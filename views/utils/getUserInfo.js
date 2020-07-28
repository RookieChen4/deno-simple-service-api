import request from './fetch.js'
export default function getUserInfo(){
    return new Promise((resolve, reject) => {
        request('/me').then(res=>{
            resolve({...res})
        }).catch(err => {
            reject(null)
        })
    })
 }