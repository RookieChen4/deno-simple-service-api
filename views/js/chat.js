import getUserInfo from '../utils/getUserInfo.js'
import { getCookie } from '../utils/cookie.js'
let username,email,userid;
const userlist = document.querySelector('.roomer-list')
function VaildateIslogin() {
    const AuthKey = getCookie('AuthKey')
    AuthKey&&(getUserInfo().then(res => {
        console.log(res)
        username = res.username
        email = res.email
        userid = res.id
        document.querySelector('.action-list').style.display="flex"
        document.querySelector('.signUp').style.display="none"
        ws = new WebSocket(`ws://localhost:5000/ws`);
        ws.addEventListener("open", onConnectionOpen);
        ws.addEventListener("message", onMessageReceived);
        ws.addEventListener("close ", onConnectionClosed);
    }).catch((reject) => {
        alert('无此用户！重新登录')
    }))
}
window.addEventListener('DOMContentLoaded',debounce(VaildateIslogin,200))



const rommid = getQueryString('roomid')
document.querySelector('#roomid').innerHTML = rommid
const info = navigator.userAgent
const agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPod", "iPad"];
let isPhone = false
for(let i = 0; i < agents.length; i++){
    if(info.indexOf(agents[i]) >= 0) isPhone = true
}
isPhone&&(document.querySelector('.main-wrap').style.height = (window.innerHeight  - 56) + 'px',
document.querySelector('.main-wrap').style.maxHeight = (window.innerHeight  - 56) + 'px')
window.addEventListener('resize', () => {
    document.querySelector('.main-wrap').style.height = (window.innerHeight  - 56) + 'px'
    document.querySelector('.main-wrap').style.maxHeight = (window.innerHeight  - 56) + 'px'
})
let ws = null
// window.addEventListener("DOMContentLoaded", () => {
//     ws = new WebSocket(`ws://localhost:5000/ws`);
//     ws.addEventListener("open", onConnectionOpen);
//     ws.addEventListener("message", onMessageReceived);
//     ws.addEventListener("close ", onConnectionClosed);
// });
function onConnectionOpen () {
    const event = {
        type: "join",
        rommid: rommid,
        username: username,
        email: email,
        userid: userid
    };
    ws.send(JSON.stringify(event));
}

function onMessageReceived(message) {
    console.log(message)
    const event = JSON.parse(message.data)
    switch (event.type) {
        case "UserJoin":
            userlist.innerHTML = ''
            event.data.forEach((u) => {
                let li = document.createElement('li')
                li.classList.add('roomer-item')
                let roomitem = document.createElement('room-item')
                roomitem.user = u
                li.appendChild(roomitem)
                userlist.appendChild(li)
            });
          break;
        case "closed":
            onConnectionClosed()
      }
}
function onConnectionClosed() {
    console.log('closed')
}

function sendMessage(event) {
    event.preventDefault()
    if(!document.querySelector('#message').value) {
        return
    }
    ws.send(document.querySelector('#message').value)
    document.querySelector('#message').value = ''
}