/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

// item => CRUD + 이벤트 + 개인데이터 + 조회 + 변경
// order => 복합키 + 다른 체인코드 호출 + 이벤트 생성
class MyorderContract extends Contract {

    // 주문하기(주문 key, 물품 key, 주문수량, 구매자 아이디)
    // 주문하기 -> 주문 체인코드에 주문내역 -> 물품체인코드 재고수량 감소
    // ITEM0001, ITEM0002
    async creatOrder(ctx, orderID, itemID, orderCnt, customerID){
        // 1. (cc item에서 호출->)물품정보 가져오기
        const args = ['readItem', itemID];
        // ( 체인코드명, args, 채널)
        const response = await ctx.stub.invokeChaincode('item', args, 'mychannel');
        if(response.status !== 200){ // 정상적으로 다른 체인코드 호출하지 못한 경우
            throw new Error(response.message); // 오류발생시 자동 종료
        }
        const itemStr = response.payload.toString('utf8');
        const itemObj = JSON.parse(itemStr);
        // 기존 재고수량 - 주문한 수량 970 = 1000 - 30
        const cnt = Number(itemObj.quantity) - Number(orderCnt);

        if(cnt < 0){
            throw new Error('quantity 수량 부족'); // 오류 발생시 자동 종료
        }

        // item 체인코드 재고수량 변경
        // async changeQuantityItem( ctx, id, quantity )
        const args1 = ['changeQuantity', itemID, String(cnt)]; // string으로만 가능
        const response1 = await ctx.stub.invokeChaincode('item0727', args1, 'mychannel');
        if( response1.status !== 200){ // 정상적으로 다른 체인코드 호출 실패시
            throw new Error(response1.message); // 자동종료
        }

        // order 체인코드에 추가(물품코드, 주문수량, 고객아이디)
        const regDate = ctx.stub.getTxTimestamp();
        const orderObj = { itemID, orderCnt, customerID, regDate };

        // object -> string -> buffer
        const orderBuf = Buffer.from(JSON.stringify(orderObj));

        // 주문등록 이벤트 등록
        ctx.stub.setEvent('createOrder', orderBuf); // 이벤트, 실제데이터

        // 원장에 기록
        await ctx.stub.putState(orderID, orderBuf);

        // item cc를 사용해서 검색시 검색량이 늘어날수록 느려지는걸 예방하기 위해
        // 복합키를 생성 후 검색하면 속도 개선
        const indexName = 'customerID~orderID~itemID';
        const orderItemIndex = await ctx.stub.createCompositeKey(indexName, [customerID, orderID, itemID]);
        return await ctx.stub.putState(orderItemIndex, Buffer.from('\u0000'));

    }

    // 주문 내역 1개 조회
    async readOrder(ctx, orderID) {
        const orderAsBytes = await ctx.stub.getState(orderID),
        if( !orderAsBytes || orderAsBytes.length === 0 ){
            throw new Error(`${orderID} 가 존재하지 않습니다.`);
        }

        // buffer -> string -> object
        return JSON.parse(orderAsBytes.toString());
    }

    // 주문 변경 ( 주문번호, 물품번호, 주문수량 )
    async changeOrder(ctx, orderID, itemID, orderCnt){
        // 1. 물품정보 읽기
        const args = ['readItem', itemID];
        // ( 체인코드명, args, 채널)
        const response = await ctx.stub.invokeChaincode('item', args, 'mychannel');
        if(response.status !== 200){ // 정상적으로 다른 체인코드 호출하지 못한 경우
            throw new Error(response.message); // 오류발생시 자동 종료
        }
        const itemStr = response.payload.toString('utf8');
        const itemObj = JSON.parse(itemStr);

        // 2. 주문정보 조회
        const orderObj = await this.readOrder(ctx, orderID);

        // ex) 10개 -> 3개 변경시 재고 7개 증가
        // ex) 2개 -> 7개 변경시 재고 5개 감소
        const cnt1 = Number(orderObj.orderCnt) - Number(orderCnt);
        const cnt2 = Number(itemObj.quantity) + Number(cnt1);

        // item 체인코드 재고수량 변경
        // async changeQuantityItem( ctx, id, quantity )
        const args1 = ['changeQuantity', itemID, String(cnt2)]; // string으로만 가능
        const response1 = await ctx.stub.invokeChaincode('item', args1, 'mychannel');
        if( response1.status !== 200){ // 정상적으로 다른 체인코드 호출 실패시
            throw new Error(response1.message); // 자동종료
        }

        // order 체인코드에 주문수량 변경
        orderObj.orderCnt = orderCnt;

        // 주문정보 변경
        const orderBuf = Buffer.from( JSON.stringify(orderObj));

        // 이벤트 등록
        ctx.stub.setEvent('changeOrder', orderBuf);

        // 원장에 적용
        return await ctx.stub.putState(orderID, orderBuf);


    }

    // 실습 => 주문 취소
    async deleteOrder(ctx, orderID, itemID, orderCnt, customerID) {
        //주문내역 확인
        const orderAsBytes = await ctx.stub.getState(orderID);
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`${orderID} does not exist`);
        }

        // 재고수량 읽기
        const args = ['readItem', itemID];
        const response = await ctx.stub.invokeChaincode('item', args, 'mychannel');
        if (response.status !== 200) {
            throw new Error(response.message);
        }

        //재고수량 계산을 위한 형변환
        const str = response.payload.toString('utf8'); //buffer -> string
        const obj = JSON.parse(str);  //string -> buffer
        console.log(obj);

        // 주문수량 변경 (재고수량 + 취소한 개수)
        const cnt =  Number(obj.quantity) + Number(orderCnt);
        const args1 = ['changeQuantityItem', itemID, String(cnt)];
        const response1 = await ctx.stub.invokeChaincode('item', args1, 'mychannel');
        if (response1.status !== 200) {
            throw new Error(response1.message);
        }

        // 주문취소 이벤트 생성
        const orderBuffer = Buffer.from( JSON.stringify({orderID:orderID}));
        ctx.stub.setEvent('deleteOrder', orderBuffer);
        await ctx.stub.deleteState(orderID);

        // 복합키 삭제
        const indexName = 'customerID~orderID~itemID';
        const orderItemIndexKey = await ctx.stub.createCompositeKey(indexName, [customerID, orderID, itemID]);
        return await ctx.stub.deleteState(orderItemIndexKey);
    }
    
    
    // 복합키를 이용하여 조회  (주문번호 + 물품번호 + 고객아이디)
    // 고객별 주문내역 조회
    async orderOrderItems(ctx, customerID) {
        const indexName = 'customerID~orderID~itemID';
        // 고객 정보를 이용한 키 조회 (반복자)
        const orderItemResultsIterator = 
            await ctx.stub.getStateByPartialCompositeKey(indexName, [customerID]);

        const allResults = [];
        for(;;) { // 무한반복
            const res = await orderItemResultsIterator.next(); //1개씩 가져옴
            if(res.value) { //가져온 데이터가 있다면
                // 1. key 분할하기 attributes[0]은 고객아이디, 1은 주문번호, 2는 물품번호
                const { attributes } = await ctx.stub.splitCompositeKey(res.value.key);

                // 2. 주문번호를 이용한 주문내역 읽기
                let orderData = await this.readOrder(ctx, attributes[1]);
                orderData.orderID = attributes[1];

                // 3. 물품번호를 이용한 물품내역 읽기
                const args = ['readItem', attributes[2]];
                const response  = await ctx.stub.invokeChaincode('item', args, 'mychannel');
                if( response.status  !== 200 ) {
                    throw new Error(response.message);
                }
                const itemStr = response.payload.toString('utf8');  // buffer -> string
                const itemObj = JSON.parse(itemStr); 

                // 4. 위에 생성한 변수에 추가하기
                allResults.push({order:orderData, item:itemObj});
            }
            if(res.done){ // 가져온 데이터가 마지막이라면
                return  allResults; //리턴되면서 종료
            }

        }

    }

    // 전체 주문 조회
    async readAllOrders(ctx, startKey, endKey) {
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const str = Buffer.from(value).toString('utf8');
            const obj = JSON.parse(str);
            allResults.push({ Key: key, Value: obj });
        }
        console.info(allResults);
        return allResults;
    }

}

module.exports = MyorderContract;
