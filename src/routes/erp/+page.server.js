import {
  db,
  eq,
  ne,
  and,
  serversList,
  tags,
  server_Tags,
  erpLogs,
  avg,
} from "$lib/DB";
export const load = async () => {
  //   const db = drizzle(process.env.DB_FILE_NAME);
  const servers = await db
    .select(serversList)
    .from(serversList)
    .innerJoin(server_Tags, eq(serversList.id, server_Tags.serverId))
    .innerJoin(tags, eq(server_Tags.tagId, tags.id))
    .where(and(eq(serversList.deleteFlag, "0"), eq(tags.name, "ERP")));
  const durations = await db
    .select({
      step: erpLogs.step,
      duration: avg(erpLogs.duration), // Calculates average
    })
    .from(erpLogs)
    .groupBy(erpLogs.step);
  return {
    servers: servers[0],
    durations,
  };
};
