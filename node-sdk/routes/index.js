var express = require('express');
var router = express.Router();

//127.0.0.1:15984 윈도우 주소

const nano = require('nano')('http://admin:adminpw@10.0.2.15:5984')//ubuntu에 저장돼있기 때문에 윈도우 주소 사용할 필요 없음
const db = nano.db.use('member'); //couchdb의 member 페이지 이용
const db1 = nano.db.use('wallet');

const FabricCAServices = require('fabric-ca-client');
const { Wallets, Gateway} = require('fabric-network');
const fs = require('fs');
const path = require('path'); 

router.get('/readQuerySelector', async function(req, res, next) {
  try {
    // 0. 입력한 값 받기
    // req.body.userid    POST일때
    // req.query.userid   GET일때
    const userid =  req.query.userid;
    const make = req.query.make;

    //1. 환경설정 파일 읽기
    const ccpPath = path.resolve (__dirname, '..', '..','fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // 2. wallet만들기( couchdb )
    const dbUrl  = 'http://admin:adminpw@10.0.2.15:5984';
    const dbName = 'wallet';
    const wallet = await Wallets.newCouchDBWallet(dbUrl, dbName);

    // 3. 이미 등록된 사용자 존재 확인
    const userIdentity = await wallet.get(userid);
    if( !userIdentity ) {
      console.log(`${userid} 사용자가 없습니다.`);
      res.redirect("/");
      return;
    }

    // 4. 체인코드 호출을 위한 gateway 생성 및 접속
    const gateway = new Gateway();
    await gateway.connect(ccp, {
          wallet, 
          identity:userid, 
          discovery:{enabled:true, asLocalhost:true} });
    
    // 5. 채널 선택
    const network = await gateway.getNetwork('mychannel');

    // 6. 체인코드 선택
    const contract = await network.getContract('mycar');

    // 7. 체인코드 readAllCar함수 호출 (데이터를 조회)
    // async readAllCar(ctx)

    const query = {make : make};
    const result = await contract.evaluateTransaction('readQuerySelector', JSON.stringify(query)); //조회
    // await contract.submitTransaction('createCar', key, color, make, model, owner ); //변경
    const str = result.toString(); // buffer -> string
    const obj = JSON.parse(str);   // string -> object
    console.log(obj);
    
    // 8. gateway 닫기
    await gateway.disconnect();

    //res.redirect("/")
    res.render('readallcar', {rows : obj}); // readallcar.ejs로 전달하고 출력
  }
  catch(error){
    console.log(error);
    res.redirect("/");
  }
});


router.post('/deleteCar', async function(req, res, next) {
  try {
    const userid = req.body.userid;
    const car    = req.body.car;

    //1. 환경설정 파일 읽기
    const ccpPath = path.resolve (__dirname, '..', '..','fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // 2. wallet만들기( couchdb )
    const dbUrl  = 'http://admin:adminpw@10.0.2.15:5984';
    const dbName = 'wallet';
    const wallet = await Wallets.newCouchDBWallet(dbUrl, dbName);

    // 3. 이미 등록된 사용자 존재 확인
    const userIdentity = await wallet.get(userid);
    if( !userIdentity ) {
      console.log(`${userid} 사용자가 없습니다.`);
      res.redirect("/");
      return;
    }

    // 4. 체인코드 호출을 위한 gateway 생성 및 접속
    const gateway = new Gateway();
    await gateway.connect(ccp, {
          wallet, 
          identity:userid, 
          discovery:{enabled:true, asLocalhost:true} });
    
    // 5. 채널 선택
    const network = await gateway.getNetwork('mychannel');

    // 6. 체인코드 선택
    const contract = await network.getContract('mycar');

    // 7. 체인코드 deleteCar 호출 (데이터를 변경)
    // async deleteCar(ctx, key) 
    await contract.submitTransaction('deletecar', car );

    // 8. gateway 닫기
    await gateway.disconnect();

    // 9. 페이지 이동
    res.redirect("/");    
  }catch(error) {
      console.log(error);
      res.redirect("/");
  }
});

router.get('/readAllCar', async function(req, res, next) {
  try {
    // 0. 입력한 값 받기
    // req.body.userid    POST일때
    // req.query.userid   GET일때
    const userid =  req.query.userid;

    //1. 환경설정 파일 읽기
    const ccpPath = path.resolve (__dirname, '..', '..','fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // 2. wallet만들기( couchdb )
    const dbUrl  = 'http://admin:adminpw@10.0.2.15:5984';
    const dbName = 'wallet';
    const wallet = await Wallets.newCouchDBWallet(dbUrl, dbName);

    // 3. 이미 등록된 사용자 존재 확인
    const userIdentity = await wallet.get(userid);
    if( !userIdentity ) {
      console.log(`${userid} 사용자가 없습니다.`);
      res.redirect("/");
      return;
    }

    // 4. 체인코드 호출을 위한 gateway 생성 및 접속
    const gateway = new Gateway();
    await gateway.connect(ccp, {
          wallet, 
          identity:userid, 
          discovery:{enabled:true, asLocalhost:true} });
    
    // 5. 채널 선택
    const network = await gateway.getNetwork('mychannel');

    // 6. 체인코드 선택
    const contract = await network.getContract('mycar');

    // 7. 체인코드 readAllCar함수 호출 (데이터를 조회)
    // async readAllCar(ctx)
    const result = await contract.evaluateTransaction('readAllCar'); //조회
    // await contract.submitTransaction('createCar', key, color, make, model, owner ); //변경
    const str = result.toString();
    const obj = JSON.parse(str);
    console.log(obj);
    
    // 8. gateway 닫기
    await gateway.disconnect();

    // res.redirect("/")
    res.render('readallcar',{rows : obj}); //views폴더에 readallcar.ejs로 전달하고 출력
  }
  catch(error){
    console.log(error);
    res.redirect("/");
  }
});

router.post('/createCar', async function(req, res, next){
  try {
    // 0. 입력한 값들 받기 ( 키, 색상, 제조사, 모델, 소유자)
    const userid = req.body.userid;
    const key =  req.body.key; //<input type="text" name="key" />
    const color =  req.body.color;
    const make =  req.body.make;
    const model =  req.body.model;
    const owner =  req.body.owner;

    const ccpPath = path.resolve (__dirname, '..', '..','fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));




    const dbUrl = 'http://admin:adminpw@10.0.2.15:5984';
    const dbName = 'wallet';
    const wallet = await Wallets.newCouchDBWallet(dbUrl, dbName);

    const userIdentity = await wallet.get(userid);
    if(!userIdentity){
      console.log(`${userid}는 존재하지 않는 아이디입니다.`);
      res.redirect("/");
      return;
    }

    // 4. 체인코드 호출을 위한 getaway 생성, 접속
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet, 
      identity:userid, 
      discovery:{enabled:true, asLocalhost:true} });

    // 5. 채널 선택
    const network = await gateway.getNetwork('mychannel');

    // 6. 체인코드 선택
    const contract = await network.getContract('mycar');

    // 7. 체인코드 createCar함수 호출 (조회, 데이터 변경)
    // async create(생략(ctx), key, color, make, model, owner)
    await contract.submitTransaction('createCar', key, color, make, model, owner);

    // 8. gateway 닫기
    await gateway.disconnect();

    // 9. 페이지 이동
    res.redirect("/");
  }
  catch(error){
    console.log(error);
    res.redirect("/");
  }
});

router.post('/removeUser', async function(req, res, next){
  try {
    // 0. 입력한 아이디 받기
    const userid = req.body.userid;

    // 1. json 열기
    const ccpPath = path.resolve (__dirname, '..', '..','fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
  

    // 2. 인증기관 접속
    const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
    const ca = new FabricCAServices(caURL);

      // 3. wallet 만들기 (couchdb)
    const dbUrl = 'http://admin:adminpw@10.0.2.15:5984';
    const dbName = 'wallet';
    const wallet = await Wallets.newCouchDBWallet(dbUrl, dbName);

    // 4. user 등록 여부 확인(삭제시 없을 때 오류 발생 )
    const userIdentity = await wallet.get(userid);
    if(!userIdentity){
      console.log(`${userid}는 존재하지 않는 아이디입니다.`);
      res.redirect("/");
      return;
    }

    // 5. 관리자 정보 가져오기
    const adminIdentity = await wallet.get('admin');
    if(!adminIdentity){
      console.log('admin을 먼저 등록하세요');
      res.redirect("/");
      return;
    }

    // 6. 관리자 정보 생성
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    // 7. ca에 삭제 및 wallet에 삭제
    await ca.newIdentityService().delete(userid, adminUser);
    await wallet.remove(userid);

    // 8. 페이지 이동하기
    res.redirect("/");
  } 
  catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.post('/registerUser', async function(req, res, next){
  try {
    // 0. 아이디 등록시 db 저장
    const userid = req.body.userid; // member page에서 입력한 내용 저장

    // 1. json 열기
    console.log(__dirname); 
    const ccpPath = path.resolve (__dirname, '..', '..','fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // 2. 인증기관 접속
    const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
    const ca = new FabricCAServices(caURL);

      // 3. wallet 만들기 (couchdb)
    const dbUrl = 'http://admin:adminpw@10.0.2.15:5984';
    const dbName = 'wallet';
    const wallet = await Wallets.newCouchDBWallet(dbUrl, dbName);

    // 4. user 등록 여부 확인
    const userIdentity = await wallet.get(userid);
    if(userIdentity){
      console.log(`${userid}는 이미 존재하는 아이디입니다.`);
      res.redirect("/");
      return;
    }

    // 5. 관리자 정보 가져오기
    const adminIdentity = await wallet.get('admin');
    if(!adminIdentity){
      console.log('admin을 먼저 등록하세요');
      res.redirect("/");
      return;
    }

    // 6. 관리자 정보 생성
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    // 7. 사용자 등록
    const secret = await ca.register({
       affiliation : 'org1.department1',
       enrollmentID : userid,
       role : 'client'
    }, adminUser);
    const enrollment = await ca.enroll({
      enrollmentID : userid,
      enrollmentSecret : secret
    });

    // 8. x.509 인증서 생성
    const x509Identity = { credentials : {
          certificate : enrollment.certificate,
          privateKey : enrollment.key.toBytes()
      },
      mspId : 'Org1MSP',
      type  : 'X.509'
    };

    // 9. wallet에 보관
    await wallet.put(userid, x509Identity);

    // 10. 페이지 이동
    res.redirect("/")

  }
  catch(error){
    console.log(error);
    res.redirect("/");

  }
});

// 127.0.0.1:13000/enrollAdmin
router.post('/enrollAdmin', async function(req,res,next){
  //load network configuration

  // 1. 환경설정 파일(org1.json) 읽기
  console.log(__dirname); // /home/vagrant/Hyperledger/node-sdk/routes
  const ccpPath = path.resolve (__dirname, '..', '..','fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
  //  /home/vagrant/Hyperledger/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json
  //console.log(ccpPath);
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
  console.log(ccp);

  // const ccp = { userid : 'aaa', username : 'bbb' , userdata : { age:12 }}
  // ccp.userid === ccp['userid']
  // ccp.username === ccp['username']
  //ccp.userdata.age === ccp['userdata']['age']

  // 2. CA 접속
  const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
  const caTLSCACerts = caInfo.tlsCACerts.pem;
  const ca = new FabricCAServices(
                caInfo.url,
                {trustedRoots:caTLSCACerts, verify:false},
                caInfo.caName
  );

  // 3. wallet 만들기 (couchdb)
  const dbUrl = 'http://admin:adminpw@10.0.2.15:5984';
  const dbName = 'wallet';
  const wallet = await Wallets.newCouchDBWallet(dbUrl, dbName);

  // 4. wallet에 admin이 등록된상태인지 확인
  const identity = await wallet.get('admin');
  if(identity){
    console.log('admin은 이미 등록되어 있습니다.');
    res.redirect("/"); // 페이지를 이동하고
    return; // 종료
  }

  // 5. CA에 등록하기
  const enrollment = await ca.enroll({enrollmentID:'admin', enrollmentSecret:'adminpw'});

  // 6. x.509 인증서 생성
  const x509Identity = {  credentials :
                    {
                      certificate : enrollment.certificate,
                      privateKey : enrollment.key.toBytes()
                    },
                    mspId : 'Org1MSP',
                    type : 'X.509'

  };

  // 7. 인증서 지갑에 보관
  await wallet.put('admin', x509Identity);

  console.log(ca);

  res.redirect("/")
});

//127.0.0.1:13000/
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Member Page' }); // view 안의 index.ejs를 표시
});

//127.0.0.1:13000/insert
router.get('/insert', function(req, res, next) {
  res.render('insert', { title: 'Register' });
});

// ==========================
// 화면에서 데이터를 입력 후에 버튼 눌렀을 때 반응
// <form action="/insert" method="post">
router.post('/insert', async function(req,res,next){
  try {
    console.log(req.body);
    // [Object: null prototype] {
    //   email: '1',
    //   name: '2',
    //   age: '3',
    //   phone: '4'
    // } 이런 형태로 서버에 저장됨
    const obj = {
      _id : req.body.email,
      name : req.body.name,
      age : Number(req.body.age),
      phone : req.body.phone
    };
    //DB에 추가하기
    await db1.insert(obj);
    res.redirect('/'); // 입력후 사용자에게 보여줄 화면
    }
    catch(error){
      console.log(error);
      res.redirect("/");
    }
});

//127.0.0.1:13000/insert
router.get('/viewer', async function(req, res, next) {
  try {
  //DB에서 내용 가져오기
  const data = await db1.list({include_docs:true}); //phone 정보가 출력되지 않아서 include_docs 추가
  console.log(data.total_rows); //개수
  console.log(data.rows); // 데이터
  //화면 표시
  res.render('viewer', { title: 'Member Viewer', count: data.total_rows, rows : data.rows }); // ejs에서 정보 출력, {} 안의 정보는 ejs로 전송
  }
  catch(error){
    console.log(error);
    res.redirect("/");
  }
});



module.exports = router;
