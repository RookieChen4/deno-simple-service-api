import getUserInfo from '../utils/getUserInfo.js'
import { getCookie } from '../utils/cookie.js'
import request from '../utils/fetch.js'
let isLogin = false
function VaildateIslogin() {
    const AuthKey = getCookie('AuthKey')
    AuthKey&&(getUserInfo().then(res => {
        isLogin = true
        document.querySelector('.action-list').style.display="flex"
        document.querySelector('.signUp').style.display="none"
    }).catch((reject) => {
        isLogin = false
        console.log('无此用户！重新登录')
    }))
}
window.addEventListener('load',debounce(VaildateIslogin,200))


// 生成瀑布流
window.addEventListener('DOMContentLoaded',() => {
    var elem = document.querySelector('.room-list');
    var msnry = new Masonry( elem, {
        itemSelector: '.room-item'
    });
})

// 登录弹窗
document.querySelector('.close').addEventListener('click',() => {
    document.querySelector('.signUp-model').style.display = "none"
})
document.querySelector('.signUpButton').addEventListener('click',showsignUp)
function showsignUp(event) {
    event.preventDefault()
    document.querySelector('.signUp-model').style.display = "flex"
}


// 登录事件
function signUp(event) {
    event.preventDefault()
    const password = document.querySelector('#password').value
    const email = document.querySelector('#email').value
    let form = {
        email: email,
        password: password
    }
    request('/login','POST',form).then(res=>{
        document.cookie="AuthKey=" + res.data;
        document.querySelector('.action-list').style.display="flex"
        document.querySelector('.signUp').style.display="none"
        document.querySelector('.signUp-model').style.display = "none"
    }).catch(err => {
        console.log(err)
    })
}
document.querySelector('#signUp').addEventListener('click',signUp)


// 点击房间事件 事件代理
let grid = document.querySelector('#grid')
document.querySelector('#grid').addEventListener('click',(event) => {
    let target = event.target;
    while(target !== grid){
        if(target.tagName.toLowerCase() == 'li'){
            break;
        }
        target = target.parentNode;
    }
    if(isLogin) {
        window.location.href = `http://localhost:5000/chat.html?roomid=${target.id}`
        return
    }
    console.log('login first')
})