import {
  db,
  eq,
  ne,
  isNotNull,
  and,
  serversList,
  tags,
  server_Tags,
} from "$lib/DB";
export const load = async () => {
  const metrics = await db
    .select(serversList)
    .from(serversList)
    .innerJoin(server_Tags, eq(serversList.id, server_Tags.serverId))
    .innerJoin(tags, eq(server_Tags.tagId, tags.id))
    .where(
      and(
        eq(serversList.brand, "oracle"),
        eq(serversList.deleteFlag, "0"),
        eq(tags.name, "METRICS"),
      ),
    );
  const dbStatus = await db
    .select(serversList)
    .from(serversList)
    .innerJoin(server_Tags, eq(serversList.id, server_Tags.serverId))
    .innerJoin(tags, eq(server_Tags.tagId, tags.id))
    .where(and(eq(serversList.deleteFlag, "0"), eq(tags.name, "DB")));
  const checkMount = await db
    .select(serversList)
    .from(serversList)
    .where(
      and(
        eq(serversList.deleteFlag, "0"),
        eq(serversList.brand, "oracle"),
        ne(serversList.mountPoint, ""),
      ),
    );
  const SANs = await db
    .select(serversList)
    .from(serversList)
    .innerJoin(server_Tags, eq(serversList.id, server_Tags.serverId))
    .innerJoin(tags, eq(server_Tags.tagId, tags.id))
    .where(
      and(
        eq(serversList.deleteFlag, "0"),
        eq(tags.name, "SAN"),
        eq(serversList.brand, "dell"),
      ),
    );
  const DBs = await db
    .select(serversList)
    .from(serversList)
    .innerJoin(server_Tags, eq(serversList.id, server_Tags.serverId))
    .innerJoin(tags, eq(server_Tags.tagId, tags.id))
    .where(and(eq(serversList.deleteFlag, "0"), eq(tags.name, "DB")));

  const veeam = await db
    .select(serversList)
    .from(serversList)
    .innerJoin(server_Tags, eq(serversList.id, server_Tags.serverId))
    .innerJoin(tags, eq(server_Tags.tagId, tags.id))
    .where(and(eq(serversList.deleteFlag, "0"), eq(tags.name, "Veeam")));
  return {
    metrics,
    dbStatus,
    checkMount,
    SANs,
    DBs,
    veeam,
  };
};
