import router from './routes.ts'
import { handleAuthHeader, handleErrors, handleWebsocket } from "./middlewares.ts"
import User from "./interface/user.ts";
import { Application, send, dejs, renderFileToString } from './deps.ts'
const { cwd } = Deno;
const port = Deno.env.get("PORT") || 5000
// const app = new Application()
const app = new Application<{
    user: Omit<User, "password"> | null;
  }>();

// app.use(async (ctx: any, next: any) => {
//   ctx.response.headers.set("Access-Control-Allow-Origin", "*");
//   ctx.response.headers.set("Access-Control-Allow-Methods", "*");
//   await next();
// });

app.use(handleWebsocket)
// 请求页面和静态资源资源
app.use(async (context,next: () => Promise<void>) => {
  if(context.request.url.pathname.includes('api')) {
    return await next()
  }
  if(context.request.url.pathname.includes('template')) {
    const output = await renderFileToString(`${cwd()}/views/template.ejs`, {
      list: [{roomid: 1 ,img:'./assets/1.jpg', roomName: '房间1'},{roomid: 2 , img:'./assets/2.jpg', roomName: '房间2'}],
    });
    context.response.body = output
    return
  }
  await send(context, context.request.url.pathname, {
    root: `${Deno.cwd()}/views`,
    index: context.request.url.pathname,
  });
});


app.use(handleAuthHeader)
app.use(handleErrors)
app.use(router.routes())
app.use(router.allowedMethods())

app.addEventListener("error", (evt) => {
    console.log(evt.error);
});

console.log(`server running at ${port}`)
await app.listen({port: +port})