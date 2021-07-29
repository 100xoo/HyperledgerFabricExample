'use strict';

const { Contract } = require('fabric-contract-api');


// 체인코드에서 많이 사용하는 함수 생성 위치
// 물품 존재 유무
async function isExist(ctx, id) {
    const itemAsBytes =  await ctx.stub.getState(id);
    if(!itemAsBytes || itemAsBytes.length === 0) { 
        return false;
    }
    return true;
};


class ItemContract extends Contract {


    // 물품등록(물품코드, 물품명, 물품내용, 가격, 수량, 판매자)
    async createItem(ctx, id, name, content, price, quantity, seller){
        // 등록 시간
        const txTimestamp = ctx.stub.getTxTimestamp();

        // 물품 object생성 {key:value, name:'사과', content:'맛있는 사과' ... regdata: }
        const item = {  name:name, content, price, quantity, seller, regdate:txTimestamp };

        // object -> string -> buffer변환
        const str = JSON.stringify(item);
        const buf = Buffer.from(str);

        // 12, 가나다, abc  => {age:12, name:"가나다", title:"abc"} JSON, xml
        // 저장하기putState(키, 값)   => 값의 어떤의미인지, 키가 없으면 검색, 
        return await ctx.stub.putState(id, buf);
    }

    // ** 함수 추가 : 물품수량변경(물품코드, 변경할 개수)
    async changeQuantityItem(ctx, id, quantity){
        // 1. 물품이 있는지 확인
        const itemAsBytes =  await ctx.stub.getState(id);
        // 해당하는 물품이 없으면 오류를 출력하고 종료
        if(!itemAsBytes || itemAsBytes.length === 0) { 
            throw new Error(`물품코드 ${id} 없습니다.`);
        }

        // 2. buffer -> string -> object
        const itemObj = JSON.parse( itemAsBytes.toString() );
        item.Obj.quantity = quantity;

        // 3. object -> string -> buffer => putState 수행
        return await ctx.stub.putState( id, Buffer.from(JSON.stringify(itemObj)) );

    }


    // 물품변경 (물품코드(변경불가), 물품명, 물품내용, 가격, 수량, 판매자)
    async changeItem(ctx, id, name, content, price, quantity, seller){
        // 1. 물품이 있는지 확인
        const itemAsBytes =  await ctx.stub.getState(id);
        // 해당하는 물품이 없으면 오류를 출력하고 종료
        if(!itemAsBytes || itemAsBytes.length === 0) { 
            throw new Error(`물품코드 ${id} 없습니다.`);
        }

        // 2. buffer -> string -> object 변환
        const str = itemAsBytes.toString();
        const item = JSON.parse(str); 
        // {name:'aaa', content:'ccc', price:'343', ... }

        // 3. 변경할 항목 
        item.name       = name;
        item.content    = content;
        item.price      = price;
        item.quantity   = quantity;
        item.seller     = seller;

        // 4. object -> string -> buffer로 변환
        const str1 = JSON.stringify(item);
        const buf = Buffer.from(str1);

        // 5. 저장하기
        return await ctx.stub.putState(id, buf);
    }


    // 물품삭제(물품코드)
    async deleteItem(ctx, id) {
        // 1. 물품이 있는지 확인
        const itemAsBytes =  await ctx.stub.getState(id);
        // 해당하는 물품이 없으면 오류를 출력하고 종료
        if(!itemAsBytes || itemAsBytes.length === 0) { 
            throw new Error(`물품코드 ${id} 없습니다.`);
        }
        
        // 2. 물품삭제 수행
        // KEY는 string으로 처리하기 때문에 string -> buffer로 변환하지 않음.
        return await ctx.stub.deleteState(id);
    }

    // 물품1개 조회
    async readItem(ctx, id){
        // 1. 물품이 있는지 확인
        const itemAsBytes =  await ctx.stub.getState(id);
        // 해당하는 물품이 없으면 오류를 출력하고 종료
        if(!itemAsBytes || itemAsBytes.length === 0) { 
            throw new Error(`물품코드 ${id} 없습니다.`);
        }

        //2. buffer -> string -> object
        return  JSON.parse( itemAsBytes.toString() );
    }

    // 전체조회, 키범위내에서 조회
    // 물품전체조회(  '',  ''   'ITEM0008' ~ 'ITEM0013')
    async readAllItems(ctx, startKey, endKey){
        // 조회한 내용을 보관할 변수
        const allResults = [];

        // startKey와 endKey범위의 물품 조회
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            console.log(key, value); 
            // value값은 buffer -> string -> object, key값 string이므로 변경X
            const str = value.toString();
            const obj = JSON.parse(str);

            // 변수에 순차적으로 보관
            allResults.push({Key:key, Value:obj}); 
        }
        // 저장된 값을 리턴함
        return allResults;
    }

    // 물품조건조회 
    // ex)  { selector : {name:'사과'} }  => 물품중에서 사과인것만 조회
    async queryItems(ctx, selector) {
        let queryString = {};          //   {     }
        //selector는 string -> object로 변환
        queryString.selector =  JSON.parse(selector);     //  {selctor: { object } }

        // 조회한 내용을 보관할 변수
        const allResults = [];

        //object -> string
        const str = JSON.stringify(queryString);
        for await (const {key, value} of ctx.stub.getQueryResult(str)) {
            //key : string , value : buffer
            const str = value.toString();
            const obj = JSON.parse(str);

            // 변수에 순차적으로 보관
            allResults.push({Key:key, Value:obj}); 
        }
        return allResults;
    }


    // 물품조건조회개수제한  (node-sdk에서 전달되는 값은 모두 string)
    async queryItemsPagination(ctx, selector, page) {
        let queryString = {};          //   {     }
        //selector는 string -> object로 변환
        queryString.selector =  JSON.parse(selector);     //  {selctor: { object } }

        // 조회한 내용을 보관할 변수
        const allResults = [];

        const str = JSON.stringify(queryString);
        for await (const {key, value} of ctx.stub.getQueryResultWithPagination(str, Number(page))){
            //key : string , value : buffer
            const str = value.toString();
            const obj = JSON.parse(str);

            // 변수에 순차적으로 보관
            allResults.push({Key:key, Value:obj}); 
        }
        return allResults;

    }


    // 물품변경이력 조회
    async readItemHistory(ctx, id) {
        if(isExist(ctx, id) === false) { 
            throw new Error(`물품코드 ${id} 없습니다.`);
        }

        // 조회한 내용을 보관할 변수
        const allResults = [];

        // 블록의 생성 개수 (생성, 변경, 삭제)
        for await (const res of ctx.stub.getHistoryForKey(id)){
            console.log(res);
            if(res.isDelete !== true) { //생성, 변경 value존재
                const str = res.value.toString();
                const obj = JSON.parse(str);

                // 블록생성 시간
                const milliseconds = (res.timestamp.seconds.low + 
                    ((res.timestamp.nanos / 1000000) / 1000)) * 1000;

                obj.isDelete = false;  
                obj.blockDate = milliseconds;
                // { name:'a', content:'b', price:'3', isDelete:false... blockDate: }

                allResults.push({Key:id, Value:obj});
            }
            else { //삭제, value존재X
                const obj = {};

                // 블록생성 시간
                const milliseconds = (res.timestamp.seconds.low + 
                    ((res.timestamp.nanos / 1000000) / 1000)) * 1000;
                
                obj.isDelete = true; 
                obj.blockDate = milliseconds;
                // { isDelete:true, blockDate:시간}

                allResults.push({Key:id, Value:obj});
            }
        }

        return allResults;
    }


}

module.exports = ItemContract;