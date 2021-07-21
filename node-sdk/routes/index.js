var express = require('express');
var router = express.Router();

//127.0.0.1:15984 윈도우 주소
const nano = require('nano')('http://admin:adminpw@10.0.2.15:5984')//ubuntu에 저장돼있기 때문에 윈도우 주소 사용할 필요 없음
const db = nano.db.use('member'); //couchdb의 member 페이지 이용


//127.0.0.1:13000/
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' }); // view 안의 index.ejs를 표시
});

//127.0.0.1:13000/insert
router.get('/insert', function(req, res, next) {
  res.render('insert', { title: 'Express' });
});

// ==========================
// 화면에서 데이터를 입력 후에 버튼 눌렀을 때 반응
// <form action="/insert" method="post">
router.post('/insert', async function(req,res,next){
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
  await db.insert(obj);
  res.redirect('/'); // 입력후 사용자에게 보여줄 화면
});

module.exports = router;
