import { db, eq, and, serversList, tags, server_Tags } from "$lib/DB";
export const load = async () => {
  //   const db = drizzle(process.env.DB_FILE_NAME);
  const DBs = await db
    .select(serversList)
    .from(serversList)
    .innerJoin(server_Tags, eq(serversList.id, server_Tags.serverId))
    .innerJoin(tags, eq(server_Tags.tagId, tags.id))
    .where(and(eq(serversList.deleteFlag, "0"), eq(tags.name, "DB")));
  const serverTags = async (server) => {
    server.tags = await db
      .select(tags)
      .from(tags)
      .innerJoin(server_Tags, eq(server_Tags.tagId, tags.id))
      .where(eq(server_Tags.serverId, server.id));
  };

  await Promise.all(
    DBs.map((server) => {
      return serverTags(server);
    }),
  );

  return {
    DBs,
  };
};
