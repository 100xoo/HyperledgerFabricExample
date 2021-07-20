/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MyccContract extends Contract {

    async initLedger(ctx){
        const data = [
            { userid: 'a1', username: '가나다', userage: 11 },
            { userid: 'a2', username: '나다라', userage: 22 },
            { userid: 'a3', username: '마바사', userage: 33 }
        ]

    }// 데이터 초기화

    async createData(ctx, key, userid, username, userage){

    }// 데이터 생성

    async readAllData(ctx){

    }

}

module.exports = MyccContract;
