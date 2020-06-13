import { Application, Router } from "https://deno.land/x/oak@v4.0.0/mod.ts"
import router from './routes.ts'

const port = Deno.env.get("PORT") || 5000
const app = new Application()

// console.log(Deno.env.get('test'))

app.use(router.routes())
app.use(router.allowedMethods())
app.addEventListener("error", (evt) => {
    console.log(evt.error);
});

console.log(`server running at ${port}`)
await app.listen({port: +port})