import User from '../interface/User.ts'
import { v4 as uuid } from 'https://deno.land/std/uuid/mod.ts'
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { Client } from "https://deno.land/x/postgres/mod.ts";
import { dbCreds } from '../config.ts'
const client = new Client(dbCreds);


const handleResult = (result:any) => {
    let property: string[]= result.rowDescription.columns.map((it:any) => it.name)
    let user = result.rows.map((el:any) => {
        let obj: any = {}
        property.forEach((it,index) => {
            obj[it] = el[index]
        })
        return obj
    })
    return user
}

// find User by username
const getUsertByname = async ({params, response}:{params:{username:string},response:any}) => {
    try {
        await client.connect()
        const result = await client.query( "SELECT * FROM USERS WHERE username = $1",params.username)
        let user = handleResult(result)
        if(result.rowCount === 0) {
            response.status = 200
            response.body = {
                success: true,
                data: user
            }
        } else {
            response.status = 200
            response.body = {
                success: true,
                data: user
            }
        }
    } catch (err) {
        response.status = 500
        response.body = {
            success: false,
            data: err.toString()
        }
    } finally {
        client.end()
    }
}

// Insert User
const InsertUser = async({request ,response}:{request:any,response:any}) => {
    const body = await request.body()
    if(!request.hasBody) {
        response.status = 400
        response.body = {
            success: false,
            data: 'bad request'
        }
    } else {
        const User:User = body.value
        await getUsertByname({params:{"username":User.username},response})
        console.log(response.body.data)
        if(!response.body.data.length) {
            try {
                await client.connect()
                User.id = uuid.generate();
                User.password = await bcrypt.hash(User.password);
                const result = await client.query("INSERT INTO USERS(id,username,password,email) VALUES($1,$2,$3,$4)",
                User.id,User.username,User.password,User.email)
                response.status = 200
                response.body = {
                    success: true,
                    data: User
                }
            }catch (err){
                response.status = 500
                response.body = {
                    success: false,
                    data: err.toString()
                }
            } finally {
                await client.end()
            }
        } else {
            response.status = 400
            response.body = {
                success: false,
                data: '已存在该用户'
            }
        }
    }
}

// login
const login = async({request ,response}:{request:any,response:any}) => {
    const body = await request.body()
    if(!request.hasBody) {
        response.status = 400
        response.body = {
            success: false,
            data: 'bad request'
        }
    } else {
        const User:User = body.value
        await getUsertByname({params:{"username":User.username},response})
        if(response.body.data.length) {
            console.log(User.password, response.body.data[0].password)
            const result = await bcrypt.compare(User.password, response.body.data[0].password);
            console.log(User.password, response.body.data[0].password,result)
            if(result) {
                response.status = 200
                response.body = {
                    success: true,
                    data: '登录成功'
                }
            } else {
                response.status = 400
                response.body = {
                    success: false,
                    data: '密码错误'
                }
            }
        } else {
            response.status = 400
            response.body = {
                success: false,
                data: '该用户不存在'
            }
        }
    }
}

export { InsertUser, getUsertByname, login }