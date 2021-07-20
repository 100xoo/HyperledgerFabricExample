/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MyccContract extends Contract {

    //CRUD => 생성, 읽기, 수정, 삭제

    async initLedger(ctx){
        const data = [
            { userid: 'a1', username: '가나다', userage: 11 },
            { userid: 'a2', username: '나다라', userage: 22 },
            { userid: 'a3', username: '마바사', userage: 33 }
        ]

        for(let i=0; i<data.length; i++) { // 0 1 2 3번 수행
            var str = JSON.stringify( data[i] ); // object -> string
            var buf = Buffer.from(str); // String -> buffer

            await ctx.stub.putState('PK'+i, buf); //저장하기(키, 값)

        }
    }// 데이터 초기화

    //회원 등록하기(key, 아이디, 이름, 나이)
    async createData(ctx, key, userid, username, userage){
        const obj = {
            userid: userid,
            username: username,
            userage: Number(userage) // string으로 받아오기 때문에 형변환
        };

        var str = JSON.stringify( obj ); // object -> string
        var buf = Buffer.from(str); // String -> buffer

        await ctx.stub.putState(key, buf);


    }// 데이터 생성


    // 한명의 회원 정보 중 이름과 나이를 수정
    async updateDate(ctx, key, newname, newage){
        const buf = await ctx.stub.getState(key); //키값 가져오기
        if(!buf || buf.length === 0){ // 버프 안에 값이 없거나 길이가 0일때
            //오류 처리 자동적으로 실행 종료
            throw new Error(`${key}가 없습니다.`);
        }
        var str = buf.toString(); // bueffer -> string
        var obj = JSON.parse(str); // String -> object
        //{userid:'a1', username:'가나다',userage: 11}
        obj['username']=newname;
        obj['userage']=Number(newage);
        //>>{username:'a1', username:'newname',userage: newage}
        var str1 = JSON.stringify(obj); // object -> string
        var buf1 = Buffer.from(str1); // String -> buffer

        await ctx.stub.putState(key, buf1);


    }

    // 회원정보 삭제(삭제하고자 하는 키값이 필요함)
    async deleteData(ctx, key){
        // key에 해당하는 정보 조회(존재하지 않는 값 제거시 오류 발생 가능)
        const buf = await ctx.stub.getState(key); //키값 가져오기
        if(!buf || buf.length === 0){ // 버프 안에 값이 없거나 길이가 0일때
            //오류 처리 자동적으로 실행 종료
            throw new Error(`${key}가 없습니다.`);
        }

        await ctx.stub.deleteState(key);

    }

    //한 개의 정보 가져오기
    async readOneData(ctx, key){
        // key에 해당하는 정보 가져오기 (타입 buffer)
        const buf = await ctx.stub.getState(key); //키값 가져오기
        if(!buf || buf.length === 0){ // 버프 안에 값이 없거나 길이가 0일때
            //오류 처리 자동적으로 실행 종료
            throw new Error(`${key}가 없습니다.`);
        }
        //buffer -> string -> object

        var str = buf.toString(); //buffer -> string
        return JSON.parse(str);//buf = JSON.parse(str); // string -> object
    }

    async readAllData(ctx){
        const startKey = ''; // 시작키 설정
        const endKey = ''; // 종료키 설정
        const allResults = [];

 
        //for (const tmp of d) { }
        for await( const{key,value} of ctx.stub.getStateByRange(startKey, endKey)){ //d=> [{},{},{}]
            //buffer -> string
            const str = value.toString('utf8');
            const obj = JSON.parse(str);

            allResults.push({KEY:key, VALUE:obj});
        }
        return allResults;

    }

}

module.exports = MyccContract;
