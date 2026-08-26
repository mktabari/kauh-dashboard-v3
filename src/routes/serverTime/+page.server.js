import { db, eq, ne, and, serversList, tags, server_Tags } from "$lib/DB";
export const load = async () => {
  const servers = await db
    .select(serversList)
    .from(serversList)
    .innerJoin(server_Tags, eq(serversList.id, server_Tags.serverId))
    .innerJoin(tags, eq(server_Tags.tagId, tags.id))
    .where(
      and(
        eq(serversList.deleteFlag, "0"),
        ne(serversList.brand, "dell"),
        eq(tags.name, "Time"),
      ),
    );

  return {
    servers,
  };
};
