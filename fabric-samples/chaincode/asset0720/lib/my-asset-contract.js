/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MyAssetContract extends Contract {

    async InitAsset(ctx){
        const data = [
            {Id:'a1', Color:'blue',Size:1,Owner:'aaa'},
            {Id:'a2', Color:'red',Size:2,Owner:'bbb'},
            {Id:'a3', Color:'green',Size:3,Owner:'ccc'},
            {Id:'a4', Color:'yello',Size:4,Owner:'ddd'},
        ]

        for(const tmp of data){
            tmp['DocType'] = 'asset';

            // object -> string -> buffer
            const str = JSON.stringify(tmp);
            const buf = Buffer.from(str);
            await ctx.stub.putState(tmp['Id'], buf); // tmp.Id == tmp['Id']
            console.info('asset InitAsset sucess');
        }
    }

    async CreateAsset(ctx, a, b, c, d){
        const obj = {
            Id:a, Color:b, Size:Number(c), Owner:d, DocType:'asset'
        };

        // object -> string -> buffer
        const str = JSON.stringify(obj);
        const buf = Buffer.from(str);
        await ctx.stub.putState(obj['Id'],buf);
        console.info(`${obj} asset CreateAsset success`);
    }

    async ReadAllAsset(ctx){
        const startKey = '';
        const endKey = '';
        const allResults = [];

        for await(const{key,value} of ctx.stub.getStateByRange(startKey, endKey)){
            const str = value.toString('utf8');
            const obj = JSON.parse(str);
            allResults.push({KEY:key, VALUE:obj});
        }
        return allResults;
    }

    async UpdateAsset(ctx, key, color){
        const buf = await ctx.stub.getState(key); //키값 가져오기
        if(!buf || buf.length === 0){ // 버프 안에 값이 없거나 길이가 0일때
            //오류 처리 자동적으로 실행 종료
            throw new Error(`${key}가 없습니다.`);
        }
        var str = buf.toString(); // bueffer -> string
        var obj = JSON.parse(str); // String -> object
        obj['Color']=color;

        var str1 = JSON.stringify(obj); // object -> string
        var buf1 = Buffer.from(str1); // String -> buffer

        await ctx.stub.putState(key, buf1);



    }
    
    async DeleteAsset(ctx, key){
                // key에 해당하는 정보 조회(존재하지 않는 값 제거시 오류 발생 가능)
                const buf = await ctx.stub.getState(key); //키값 가져오기
                if(!buf || buf.length === 0){ // 버프 안에 값이 없거나 길이가 0일때
                    //오류 처리 자동적으로 실행 종료
                    throw new Error(`${key}가 없습니다.`);
                }
        
                await ctx.stub.deleteState(key);
        
    }

}

module.exports = MyAssetContract;
