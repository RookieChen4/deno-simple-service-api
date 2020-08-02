import { Context, validateJwt } from "./deps.ts";
import User from "./interface/user.ts";
import {MUser} from "./models/user.ts";
import { jwtSecret } from "./config.ts";
import { send, isWebSocketCloseEvent, WebSocket, v4 } from './deps.ts'
export async function handleAuthHeader(
    ctx: Context<{ user: Omit<User, "password"> | null }>,
    next: () => Promise<void>
    ) {
    try {
        const { request, state } = ctx;

        const jwt = request.headers.get("authorization")|| "";
        const validatedJwt :any = await validateJwt({ jwt, key:jwtSecret, algorithm: "HS256"});
        if (!validatedJwt.isValid) {
            state.user = null;
        } else {
            const user = await MUser.findOneById(validatedJwt.payload?.id as string);
            if (!user) {
                state.user = null;
                return
            }
            state.user = user;
        }
        await next();
    } catch (error) {
        throw error;
    }
}

export async function handleErrors(context: Context, next: () => Promise<void>) {
    try {
        await next();
    } catch (err) {
        context.response.status = err.status;
        const { message = "unkown error", status = 500, stack = null } = err;
        context.response.body = { message, status, stack };
        context.response.type = "json";
    }
}


// 存放在线用户 先放本地 之后放redis
/*
    userid: UserObj
*/
const usersMap = new Map();

//存放房间的用户
/*
    roomid: [UserObj,UserObj,UserObj]
*/
const RoomsMap = new Map();


interface UserObj {
    userid: string;
    rommid: string,
    username: string;
    email: string;
    sock: WebSocket;
}
export async function handleWebsocket(context: Context, next: () => Promise<void>) {
    if (!context.request.url.pathname.includes('ws')) {
        return await next();
      }
      const sock = await context.upgrade();
      const userid = v4.generate();
      for await (const ev of sock) {
        const event = typeof ev === "string" ? JSON.parse(ev) : ev;
        let userObj:UserObj;
        if(isWebSocketCloseEvent(ev)) {
            leaveRoom(userid);
            break;
        }
        switch(event.type) {
            case 'join':
                userObj = {
                    username: event.username,
                    rommid: event.rommid,
                    email: event.rommid,
                    userid: userid,
                    sock
                };
                usersMap.set(userid, userObj);
                const userslist = RoomsMap.get(event.rommid) || [];
                userslist.push(userObj)
                RoomsMap.set(event.rommid,userslist)
                emitUserJoin(event.rommid);
        }
      }
}


function emitUserJoin(roomid:string) {
    const userslist = RoomsMap.get(roomid) || [];
    const userInfo = userslist.map((u:UserObj) => {
        return { userid: u.userid, username: u.username };
      });
    for (const user of userslist) {
        const event = {
            type: "UserJoin",
            data: userInfo,
        };
        user.sock.send(JSON.stringify(event));
    }
}

function leaveRoom(userid:string) {
    // 将用户踢出用户列表
    const userObj = usersMap.get(userid);
    if (!userObj) {
      return;
    }
    let usersList = RoomsMap.get(userObj.rommid) || [];
  
    // 将用户从小组用户列表删除
    usersList =usersList.filter((u:any) => u.userid !== userid);
    RoomsMap.set(userObj.rommid, usersList);
  
    // 将该用户删除
    usersMap.delete(userid);
  
    // 再次更新小组所有用户的用户列表
    emitUserJoin(userObj.rommid);
  }