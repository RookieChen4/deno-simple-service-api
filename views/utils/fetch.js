const api = 'http://localhost:5000/api'
import { getCookie } from './cookie.js'

export default function request(url, method, data) {
    const AuthKey = getCookie("AuthKey")
    let headers = new Headers();
    headers.append('Content-Type', 'application/json')
    AuthKey&&headers.append('authorization', AuthKey)
    return fetch(api + url, {
        body: JSON.stringify(data) || '',
        headers: headers,
        method: method || 'POST'
    })
    .then(response => {
        if(response.status != 200) {
            throw new Error('Whoops!')
            return
        }
        return response.json()
    })
}