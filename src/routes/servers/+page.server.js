import { db, eq, serversList, tags, server_Tags } from "$lib/DB";
export const load = async () => {
  const servers = await db
    .select()
    .from(serversList)
    .where(eq(serversList.deleteFlag, "0"))
    .all();
  const allTags = await db.select().from(tags);
  const serverTags = await db.select().from(server_Tags);
  servers.sort((a, b) => a.name.localeCompare(b.name));
  return {
    servers,
    allTags,
    serverTags,
  };
};

export const actions = {
  addServer: async ({ request }) => {
    let data = Object.fromEntries(await request.formData());
    let { assignedTags, ...server } = data;
    try {
      const newServer = await db
        .insert(serversList)
        .values(server)
        .returning({ id: serversList.id });

      if (assignedTags && assignedTags !== "")
        await db.insert(server_Tags).values(
          assignedTags.split(",").map((tagId) => ({
            serverId: newServer[0].id,
            tagId,
          })),
        );
      return { message: `Server ${server.name} Added Successfully` };
    } catch (error) {
      console.error("Error adding server:", error);
      return { message: "Failed to add server." };
    }
  },
  editServer: async ({ request }) => {
    let server = Object.fromEntries(await request.formData());
    try {
      await db
        .update(serversList)
        .set(server)
        .where(eq(serversList.id, server.id));
      await db.delete(server_Tags).where(eq(server_Tags.serverId, server.id));
      if (server.assignedTags !== "")
        await db.insert(server_Tags).values(
          server.assignedTags.split(",").map((tagId) => ({
            serverId: server.id,
            tagId,
          })),
        );
      return { message: `Server ${server.name} Updated Successfully` };
    } catch (error) {
      console.error("Error updating server:", error);
      return { error: "Error updating server." };
    }
  },
  deleteServer: async ({ request }) => {
    let server = Object.fromEntries(await request.formData());
    try {
      await db.delete(serversList).where(eq(serversList.id, server.id));
      await db
        .update(serversList)
        .set(serversList.deleteFlag, "1")
        .where(eq(serversList.id, server.id));
      return { message: `Server ${server.name} Deleted Successfully` };
    } catch (error) {
      console.error("Error deleting server:", error);
      return { error: "Error deleting server." };
    }
  },
};
