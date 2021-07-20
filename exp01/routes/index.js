var express = require('express');
var router = express.Router();

// 블록체인 네트워크 연동되는 부분!

/* GET home page. */
// 크롬에서 127.0.0.1:3000/
router.get('/', function(req, res, next) {
  //여기로 데이터 받아옴
  res.render('index', { title: 'MainPage' });
});

// 다른 게시판 생성 127.0.0.1:3000/insert
router.get('/insert', function(req, res, next) {
  res.render('insert', { title: 'InsertPage' });
});
// 입력한 내용을 전송했을 때
router.post('/insert',function(req,res,next){
  //데이터가 추가되는 곳

  const obj = req.body; //obj변수에 값 저장
  console.log(obj);  // { userid: 'a', userpw: 'b', ---}
  //입력후 페이지 다시 출력(없으면 계속 로딩떠서)
  res.redirect("/");
});


// 게시판 생성 127.0.0.1:3000/update
router.get('/update', function(req, res, next) {
  res.render('update', { title: 'Update' });
});
// delete 게시판 생성
router.get('/delete', function(req, res, next) {
  res.render('delete', { title: 'Delete' });
});
router.get('/select', function(req, res, next) {
  const obj = 
  {
    userid:'a',
    username:'가나다',
    userage:12,
    userphone:'010-1234'
  };
  const obj1 = [
    {
      userid    : 'a', username  : '가나다', userage   : 12, userphone : '010-1234'
    },
    {    
      userid    : 'b', username  : '나다라', userage   : 23, userphone : '010-9876'
    },
    {    
      userid    : 'c', username  : '다라마', userage   : 32, userphone : '010-4567'
    }
  ];



  //views에 있는 select.ejs를 화면에 표시 { 전달하려는 값 }
  res.render('select', { title: '조회하기' , obj : obj, abc:'가나다',obj1:obj1});
  //ejs에서 이용할 obj 꼭 추가해야함
});

module.exports = router;
