import { PostgresClient } from "./deps.ts";
import { dbCreds } from "./config.ts";

export const dbClient = new PostgresClient(dbCreds);
