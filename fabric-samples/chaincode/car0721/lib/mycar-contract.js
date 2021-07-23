/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MycarContract extends Contract {

    // 차량 변경내역 조회(이력 조회)- 차량의 key 정보를 통해 확인
    async retrieveHisory(ctx, key){
        //차량 정보 확인
        const buf1 = await ctx.stub.getState(key); // buffer
        if( !buf1 || buf.length === 0){
            throw new Error(`전달한 ${key} 정보가 존재하지 않습니다. `);
        }
        // 반복자
        const iterator = await ctx.stub.getHistoryForKey(key); // 키를 이용해 정보 받아서 iterator에 보관
        const allResults = [];
        var res = await iterator.next();
        while(!res.done){ // 읽은 내용이 있다면
            if(res.value){
                const buf = res.value.value; //buffer
                const str = buf.toString(); //string
                const obj = JSON.parse(str); //object
                allResults({KEY:res.value.key, VALUE:obj});
            }
            res = await iterator.next(); // 1개 읽기
        }
        return allResults;
    }


    // 소유자 변경하기
    async updateOwner(ctx, key, newOwner){
        const buf = await ctx.stub.getState(key); // buffer
        if( !buf || buf.length === 0){
            throw new Error(`전달한 ${key} 정보가 존재하지 않습니다. `);
        }

        // 소유자 변경을 위해서 buffer -> string -> object로 변환
        const str = buf.toString();
        const obj = JSON.parse(str);
        obj.owner = newOwner; // 소유자 변경

        // 원장에 기록하기 위해서 object -> string -> buffer로 변환
        const str1 = JSON.stringify(obj);
        const buf1 = Buffer.from(str1);

        // 이벤트 등록
        ctx.stub.setEvent('updateOwner', buf1);
        // 원장 변경
        return await ctx.stub.putState(key, buf1);

    }

    //{"selector":{"make":"Hyundai"}}
    //query => {"make":"Ford"}
    //query => [{"make":"Ford", "owner":"Tom"}]
    async readQuerySelector(ctx, query){
        var queryString = {}
        queryString.selector = JSON.parse(query) // {"selecctor" : { 전달된 조건 }}

         //object -> string 변환해서 호출
         const str = JSON.stringify(queryString);
         const iterator = await ctx.stub.getQueryResult(str);
 
         var allResults = []; // 전체 내용 보관
         // 반복자
         let res = await iterator.next(); // 1개 가져오기
         while (!res.done){
             if(res.value){ // 가져온 내용에 정보가 있는지 확인
                 console.log(res.value);
                 const str = res.value.value.toString(); // buffer -> stirng
                 const obj = JSON.parse(str); // string -> object

                 // 체인코드 수정
                 allResults.push({KEY:res.value.key, VALUE:obj});
 
             }
             res = await iterator.next();
         }
 
         await iterator.close();
         return allResults;

    }

    async deletecar(ctx, key){
        //차량 정보 확인
        const buf = await ctx.stub.getState(key); // buffer
        if( !buf || buf.length === 0){
            throw new Error(`전달한 ${key} 정보가 존재하지 않습니다. `);
        }

        // 이벤트 추가(삭제할때는 필요없음)
        // const str = buf.toString(); // buffer -> string
        // const obj = JSON.parse(str); // string -> object
        // const str1 = JSON.stringify(obj); // string -> object
        // const buf1 = Buffer.from(str1);

        // 이벤트 발생
        ctx.stub.setEvent('deletecar', buf); 
        // 삭제
        return await ctx.stub.deleteState(key);

    }

    //추가하기
    async createCar(ctx, key, color, make, model, owner){
        //차량 정보 확인
        const buf = await ctx.stub.getState(key); // buffer
        if( buf && buf.length > 0){
            throw new Error(`전달한 ${key} 정보가 이미 있습니다.`);
        }
        const obj = {
            //  차량 정보를 이용해서 object로 생성
            color : color,
            make : make,
            model : model,
            owner : owner,
        };

        // 원장 기록 obj->str->buf
        const str = JSON.stringify(obj);
        const buf1 = Buffer.from(str);
        // 이벤트 추가 ( 이벤트이름, 삭제한 자료)
        ctx.stub.setEvent('createCar', buf1);
       return await ctx.stub.putState(key, buf1);
    }

    // 조건 검색 ex) 색상이 red인 차량(제조사를 원하는 것으로 리턴)
    async readQuery(ctx, make){
        var queryString = { }; // { }
        queryString.selector = { }; // {"selector" : { }}
        queryString.selector.make = make; // {"selector" : {"make" : " "}}
        // {"selector":{"make":"Hyundai"}} 이런식으로 나오게

        //object -> string 변환해서 호출
        const str = JSON.stringify(queryString);
        const iterator = await ctx.stub.getQueryResult(str);

        var allResults = []; // 전체 내용 보관
        // 반복자
        let res = await iterator.next(); // 1개 가져오기
        while (!res.done){
            if(res.value){ // 가져온 내용에 정보가 있는지 확인
                console.log(res.value);
                const str = res.value.value.toString(); // buffer -> stirng
                const obj = JSON.parse(str); // string -> object
                allResults.push(obj);

            }
            res = await iterator.next();
        }

        await iterator.close();
        res = await iterator.next();
            
    }

        // var queryString = { }; // { }
        // queryString.selector = { }; // {"selector" : { }}
        // queryString.selector.color = color; // {"selector" : {"make" : " "}}


    // 전체 차량 조회
    async readAllCar(ctx){
        const startKey = '';
        const endKey = '';
        const allResults = [];

        // for 1개 보관 of 전체 데이터 
        for await (let {key,value} of ctx.stub.getStateByRange(startKey,endKey)){
            //변환하기 수행
            const str = value.toString();
            const obj = JSON.parse(str);
            allResults.push({KEY:key, VALUE:obj});
        }
        return allResults;
    }

    // 차량 정보 1개 조회(차량의 키 값 전달)
    async readOneCar(ctx, key){
        const buf = await ctx.stub.getState(key);
        if(!buf|| buf.length === 0){
            throw new Error(`전달한 키 정보 ${key}가 존재하지 않습니다.`);
        }
        const str = buf.toString(); //string
        const obj = JSON.parse(str); //object
        return obj; // 반환
    }



    // 네트워크로 체인코드 배포시 추가되어야 하는 항목 정의
    async initLedger(ctx){
        const cars = [
            {
                color:'blue', make:'Toyota', model:'Prius', owner:'Tomoko'
            },
            {
                color:'green', make:'Hyundai', model:'Tucson', owner:'Jin Soo'
            },
            {
                color:'black', make:'Tesla', model:'S', owner:'Adriana'
            },
        ]

        for(let i=0; i<cars.length; i++){ // 0 1 2 로 반복
            const obj = cars[i];
            const str = JSON.stringify(obj); //string
            const buf = Buffer.from(str);

            await ctx.stub.putState('CAR'+i, buf); // CAR0, CAR1, CAR2 (cars에서 고유값이 없기 때문에 임의로 만들어 준 상태)
        }
    }

}

module.exports = MycarContract;
