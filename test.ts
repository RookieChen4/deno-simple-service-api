import { serve } from "https://deno.land/std@0.56.0/http/server.ts";
const s = serve({ port: 8000 });
console.log("http://localhost:8000/");
for await (const req of s) {
  req.respond({ body: "Hello World\n" });
}
console.log("Welcome to Deno 🦕");

// const filenames = ['test.txt'];
// for (const filename of filenames) {
//   const file = await Deno.open(filename);
//   await Deno.copy(file, Deno.stdout);
//   file.close();
// }

// const hostname = "0.0.0.0";
// const port = 8080;
// const listener = Deno.listen({ hostname, port });
// console.log(`Listening on ${hostname}:${port}`);
// for await (const conn of listener) {
//   Deno.copy(conn, conn);
// }