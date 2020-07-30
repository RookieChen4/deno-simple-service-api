import { Application, Router, send } from "https://deno.land/x/oak@v4.0.0/mod.ts"
import router from './routes.ts'
import { handleAuthHeader, handleErrors } from "./middlewares.ts"
// import * as dejs from 'https://deno.land/x/dejs@0.8.0/mod.ts';
// import { renderFileToString } from 'https://deno.land/x/dejs/mod.ts';
import User from "./interface/user.ts";
const { cwd, stdout, copy } = Deno;
const port = Deno.env.get("PORT") || 5000
// const app = new Application()
const app = new Application<{
    user: Omit<User, "password"> | null;
  }>();


app.use(async (ctx: any, next: any) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set("Access-Control-Allow-Methods", "*");
  await next();
});

// 请求页面资源
app.use(async (context,next: () => Promise<void>) => {
  if(context.request.url.pathname.includes('api')) {
    return await next()
  }
  // if(context.request.url.pathname.includes('template')) {
  //   const output = await renderFileToString(`${cwd()}/views/template.ejs`, {
  //     name: 'world',
  //   });
  //   context.response.body = output
  //   return
  // }
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