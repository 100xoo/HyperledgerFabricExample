var express = require('express');
var router = express.Router();

//변수 만들기
var a = 13;
const b = '24';
const c = { //c는 오브젝트
  userid : 'a', username: 'b', userage: 13
};
const d = [
  {userid : 'a', username:'b1', userage:13},
  {userid : 'b', username:'b2', userage:23},
  {userid : 'c', username:'b', userage:33}
];

for(let tmp of d){ // [ {}, {}, {}]
  tmp['userphone'] = '010-xxxx'; //새로운 데이터 추가하기
  console.log(tmp);
}
console.log("==============aa===============");
for(let i=0;i<d.length;i++){ // 0 1 2( d.length= 3)
  d[i]['useremail'] = 'aaa','@xmail.com';
  console.log(d[i]); // console.log(d[2])
}

console.log("==============================");

console.log( typeof(c),c);

// 체인코드를 통해 데이터를 추가하기 위해서는 (넣을 때)
// object -> string -> buffer(0 1 1 0 1 1)
const str_c = JSON.stringify(c); // c의 object 타입을 string으로 변환하여 str_c에 저장
console.log(typeof(str_c), str_c);

const buf_c = Buffer.from(str_c); //str_c에 있는 string타입을 buffer 타입으로 변환하여 buf_c에 보관
console.log(typeof(buf_c),buf_c);


console.log("==============================");
// 저장된 데이터를 사용하려면 (꺼낼 때)
// buffer -> string -> object
const buf_c1 = buf_c; //buffer 타입
console.log(typeof(buf_c1),buf_c1);

const str_c1 = buf_c1.toString(); // buf_c1에 있는 값을 string으로
console.log(typeof(str_c1),str_c1);

const c1 = JSON.parse(str_c1); //str_c1의 값을 object로 변환 후 c1에 저장
console.log(typeof(c1),c1);

//출력하기
// console.log( typeof(a),a);
// console.log( typeof(b),b);
// console.log( typeof(c),c);
// console.log( typeof(d),d);

module.exports = router;
