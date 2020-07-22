import { Client } from "https://deno.land/x/postgres/mod.ts";
import { dbCreds } from "./config.ts";

export const dbClient = new Client(dbCreds);
