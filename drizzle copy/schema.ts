import { sqliteTable, AnySQLiteColumn, text, numeric, integer } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const prismaMigrations = sqliteTable("_prisma_migrations", {
	id: text().primaryKey().notNull(),
	checksum: text().notNull(),
	finishedAt: numeric("finished_at"),
	migrationName: text("migration_name").notNull(),
	logs: text(),
	rolledBackAt: numeric("rolled_back_at"),
	startedAt: numeric("started_at").default(sql`(current_timestamp)`).notNull(),
	appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const dbSize = sqliteTable("DbSize", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	dbName: text().notNull(),
	size: integer().notNull(),
	date: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	dbSizeGroup: text().notNull(),
});

