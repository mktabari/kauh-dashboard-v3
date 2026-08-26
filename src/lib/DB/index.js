import { DB_FILE_NAME } from "$env/static/private";
import { drizzle } from "drizzle-orm/libsql";
import { eq, ne, and, avg, isNotNull, sql } from "drizzle-orm";
import {
  serversList,
  tags,
  serverTags as server_Tags, // Renamed to avoid Cannot access 'serverTags' before initialization
  dbSize,
  erpLogs,
  pushMessageSubscription,
  cronTasks,
  taskSubscription,
} from "$src/db/schema.js";

const db = drizzle(DB_FILE_NAME);
// const db = drizzle("file:./sqliteDB/dev.sqlite");
export {
  erpLogs,
  dbSize,
  serversList,
  tags,
  server_Tags,
  pushMessageSubscription,
  cronTasks,
  taskSubscription,
  db,
  eq,
  ne,
  and,
  avg,
  isNotNull,
  sql,
};
