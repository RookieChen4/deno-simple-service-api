import { isWebSocketCloseEvent, WebSocket, v4 } from './deps.ts'


// 根据sockid存放在线用户 先放本地 之后放redis
/*
    sockid: UserObj
*/
const usersMap = new Map();

// 更加房间存放房间的用户
/*
    roomid: [UserObj,UserObj,UserObj]
*/
const RoomsMap = new Map();


// 根据房间存放消息
/*
    roomid: [message,message]
*/
const messagesMap = new Map();

interface UserObj {
    sockid: string;
    userid: string;
    roomid: string,
    username: string;
    email: string;
    sock: WebSocket;
}

interface message {
    sockid: string;
    roomid: string;
    userid: string;  
    username: string;
    message: string;
}

export default async function chat(sock:WebSocket) {
    const sockid = v4.generate();
    for await (const ev of sock) {
        const event = typeof ev === "string" ? JSON.parse(ev) : ev;
        if(isWebSocketCloseEvent(ev)) {
            leaveRoom(sockid);
            break;
        }
        switch(event.type) {
            case 'join':
                let userObj:UserObj = {
                    userid: event.userid,
                    username: event.username,
                    roomid: event.roomid,
                    email: event.roomid,
                    sockid: sockid,
                    sock
                };
                usersMap.set(sockid, userObj);
                const userslist = RoomsMap.get(event.roomid) || [];
                userslist.push(userObj)
                RoomsMap.set(event.roomid,userslist)
                emitUserJoin(event.roomid);
                //加载消息记录
                emitPreviousMessages(event.roomid, sock, event.userid);
                break;
            case 'sendMessage':
                let message: message = {
                    userid: event.userid,
                    username: event.username,
                    roomid: event.roomid,
                    message: event.message,
                    sockid: sockid
                };
                const messagesList = messagesMap.get(event.roomid) || [];
                messagesList.push(message)
                messagesMap.set(event.roomid, messagesList)
                emitMessage(event.roomid, message)
                break;
        }
    }
}

function emitUserJoin(roomid:string) {
    const userslist = RoomsMap.get(roomid) || [];
    const userInfo = userslist.map((u:UserObj) => {
        return { sockid: u.sockid, username: u.username };
      });
    for (const user of userslist) {
        const event = {
            type: "UserJoin",
            data: userInfo,
        };
        user.sock.send(JSON.stringify(event));
    }
}


function emitMessage(roomid:string, message:any) {
    const userslist = RoomsMap.get(roomid) || []
    for (const user of userslist) {
        // 这里防止引用创建新的变量不影响原来的值
        const tmpMessage = {
          ...message,
          sender: user.userid === message.userid ? "me" : 'other',
        };
        const event = {
          type: "message",
          data: tmpMessage,
        };
        // 向小组用户发送消息
        user.sock.send(JSON.stringify(event));
      }
}


function emitPreviousMessages(roomid:string, sock:WebSocket,userid:string) {
    let messagesList = messagesMap.get(roomid) || [];
    messagesList = messagesList.map((it:any) => {
        if(it.userid == userid) {
            return {...it, sender: 'me'}
        } else {
            return {...it, sender: 'other'}
        }
    })
    const event = {
        type: "previousMessages",
        data: messagesList,
    };
    sock.send(JSON.stringify(event));
}


function leaveRoom(sockid:string) {
    // 将用户踢出用户列表
    const userObj = usersMap.get(sockid);
    if (!userObj) {
      return;
    }
    let usersList = RoomsMap.get(userObj.roomid) || [];
  
    // 将用户从小组用户列表删除
    usersList =usersList.filter((u:any) => u.sockid !== sockid);
    RoomsMap.set(userObj.roomid, usersList);
  
    // 将该用户删除
    usersMap.delete(sockid);
  
    // 再次更新小组所有用户的用户列表
    emitUserJoin(userObj.roomid);
}