// import { DB_FILE_NAME } from "$env/static/private";
import { defineConfig } from "drizzle-kit";
// import dotenv from "dotenv";
// dotenv.config();
export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.js",
  dialect: "sqlite",
  dbCredentials: {
    // url: process.env.DB_FILE_NAME,
    url: "file:./sqliteDB/dev.sqlite",
    // url: DB_FILE_NAME,
  },
});
