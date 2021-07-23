var express = require('express');
var router = express.Router();

/* GET users listing. */

const FabricCAServices = require('fabric-ca-client');
const { Wallets, Gateway} = require('fabric-network');
const fs = require('fs');
const path = require('path'); 

const ccpPath = path.resolve (__dirname, '..', '..','fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

const dbUrl  = 'http://admin:adminpw@10.0.2.15:5984';
const dbName = 'wallet';

// wallet에 등록되어있는 사용자 1명 아이디
const walletUser = 'aaa'; // 임의로

// 함수만들기 (서버 구동시 자동으로 실행되지 않음)
async function main(){
    try{
        console.log('main 함수 구동 중');
        // await을 사용하려면 함수 안에서만 가능하기 때문에 main 생성

        //wallet db에 접속
        const wallet = await Wallets.newCouchDBWallet(dbUrl, dbName);

        // walletUser 변수에 정의된 사용자가 존재하는지 확인
        const identity = await wallet.get(walletUser);
        if(!identity){
            console.error(`${walletUser} 사용자가 존재하지 않습니다. `);
            return; // 함수 종료
        }

        // 4. 체인코드 호출을 위한 gateway 생성 및 접속
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet, 
            identity:walletUser, 
            discovery:{enabled:true, asLocalhost:true} });
        
        // 5. 채널 선택
        const network = await gateway.getNetwork('mychannel');

        // 6. 체인코드 선택
        const contract = await network.getContract('mycar');

        // 7. 리스너 함수 생성

        // 8. 리스너 함수 호출
    }
    catch(error){
        console.error(error);
        return;
    }

}
main(); // 함수 호출하기(호출 전까지 안나옴)

// 위와 같은 의미, 다른 형태
(async function main1() {
    console.log('main1 함수 구동중');
})();



console.log('실시간 블록 생성 event 받기')
module.exports = router;
