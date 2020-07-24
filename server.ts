import { Application, Router } from "https://deno.land/x/oak@v4.0.0/mod.ts"
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


// app.use(handleAuthHeader)
app.use(handleErrors)
app.use(router.routes())
app.use(router.allowedMethods())


app.addEventListener("error", (evt) => {
    console.log(evt.error);
});

console.log(`server running at ${port}`)
await app.listen({port: +port})