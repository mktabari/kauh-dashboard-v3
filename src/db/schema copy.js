import { sqliteTable, text, numeric, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { duration } from "drizzle-orm/gel-core";

export const dbSize = sqliteTable("DbSize", {
  id: integer().primaryKey({ autoIncrement: true }).notNull(),
  dbName: text().notNull(),
  size: integer().notNull(),
  date: numeric()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  dbSizeGroup: text().notNull(),
});

// export const serversList = sqliteTable("ServersList", {
//   id: integer().primaryKey({ autoIncrement: true }).notNull(),
//   brand: text().notNull(),
//   name: text().notNull(),
//   ip: text().notNull(),
//   username: text().notNull(),
//   password: text().notNull(),
//   db: text(),
//   dbName: text(),
//   dbPort: text(),
//   dbUser: text(),
//   dbPassword: text(),
//   dbAlert: text(),
//   bkLogDir: text(),
//   drInstance: text(),
//   dbSizeGroup: text(),
//   mountPoint: text(),
//   memory: text(),
//   cpu: text(),
//   deleteFlag: text().default("0").notNull(),
//   dbLabel: text(), // Add the dbLabel
// });

// export const tags = sqliteTable("tags", {
//   id: integer().primaryKey({ autoIncrement: true }).notNull(),
//   name: text().notNull(),
//   description: text().notNull(),
//   color: text().notNull(),
//   permanent: integer().default(0).notNull(),
// });

// export const serverTags = sqliteTable("serverTags", {
//   id: integer().primaryKey({ autoIncrement: true }).notNull(),
//   serverId: integer()
//     .notNull()
//     .references(() => serversList.id, { onDelete: "cascade" }),
//   tagId: integer()
//     .notNull()
//     .references(() => tags.id, { onDelete: "cascade" }),
// });

// export const erpLogs = sqliteTable("erpLogs", {
//   id: integer().primaryKey({ autoIncrement: true }).notNull(),
//   step: text().notNull(),
//   date: numeric()
//     .default(sql`(CURRENT_TIMESTAMP)`)
//     .notNull(),
//   duration: integer().notNull(),
// });
// export const pushMessageSubscription = sqliteTable("pushMessageSubscription", {
//   id: integer().primaryKey({ autoIncrement: true }).notNull(),
//   endpoint: text().notNull(),
//   p256dh: text(),
//   auth: text(),
//   expirationTime: numeric(),
//   subsecription: text().notNull(),
// });
// export const cronTasks = sqliteTable("cronTasks", {
//   id: integer().primaryKey({ autoIncrement: true }).notNull(),
//   taskName: text().notNull(),
//   schedule: text().notNull(),
//   lastRun: numeric(),
//   status: text().default("pending").notNull(),
//   createdAt: numeric()
//     .default(sql`(CURRENT_TIMESTAMP)`)
//     .notNull(),
//   updatedAt: numeric()
//     .default(sql`(CURRENT_TIMESTAMP)`)
//     .notNull(),
//   serverId: integer()
//     .notNull()
//     .references(() => serversList.id, {
//       onDelete: "cascade",
//     }),
//   taskType: text().default("sql").notNull(),
//   api: text(),
//   sql: text(),
// });
// export const taskSubscription = sqliteTable("taskSubscription", {
//   id: integer().primaryKey({ autoIncrement: true }).notNull(),
//   taskId: integer()
//     .notNull()
//     .references(() => cronTasks.id, { onDelete: "cascade" }),
//   subscriptionId: integer()
//     .notNull()
//     .references(() => pushMessageSubscription.id, { onDelete: "cascade" }),
// });
