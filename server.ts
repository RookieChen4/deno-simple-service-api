import { Application, Router, send } from "https://deno.land/x/oak@v4.0.0/mod.ts"
import router from './routes.ts'
import { handleAuthHeader, handleErrors } from "./middlewares.ts"
import User from "./interface/user.ts";
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
    await next()
  } else {
    await send(context, context.request.url.pathname, {
      root: `${Deno.cwd()}/views`,
      index: context.request.url.pathname.replace("/",''),
    });
  }
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