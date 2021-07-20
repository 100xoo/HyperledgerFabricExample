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

}

module.exports = MyAssetContract;
