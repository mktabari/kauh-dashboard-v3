import { db, and, eq, dbSize, serversList, tags, server_Tags } from "$lib/DB";
import { json } from "@sveltejs/kit";
import oracledb from "oracledb";
oracledb.initOracleClient();
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
export const POST = async ({ request }) => {
  const { serverId } = await request.json();

  let connection;
  try {
    const servers = await db
      .select(serversList)
      .from(serversList)
      .innerJoin(server_Tags, eq(serversList.id, server_Tags.serverId))
      .innerJoin(tags, eq(server_Tags.tagId, tags.id))
      .where(
        and(
          eq(serversList.deleteFlag, "0"),
          eq(tags.name, "DB"),
          eq(serversList.id, serverId),
        ),
      );
    let gte = new Date();
    gte.setDate(gte.getDate() - gte.getDay());
    gte.setHours(0, 0, 0, 0);
    servers.forEach(async (server) => {
      const dbSizeThisWeek = await db
        .select(dbSize)
        .from(dbSize)
        .where(
          and(eq(dbSize.dbSizeGroup, server.dbSizeGroup), eq(dbSize.date, gte)),
        );
      if (dbSizeThisWeek.length === 0) {
        connection = await oracledb.getConnection({
          user: server.dbUser,
          password: server.dbPassword,
          connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${server.ip})(PORT=${server.dbPort}))(CONNECT_DATA=(SID=${server.dbName})))`,
        });
        let result = await connection.execute(
          `select round(sum(BYTES)/1024/1024/1024) BYTES
          from dba_data_files`,
        );
        await db.insert(dbSize).values({
          dbName: server.dbSizeGroup,
          dbSizeGroup: server.dbSizeGroup,
          date: gte,
          size: parseInt(result.rows[0].BYTES),
        });
      }
    });
    return json([]);
  } catch (err) {
    console.error("api tasks/dbSize", err);
    return json([{ body: "api tasks/dbSize error", url: "/" }]);
  } finally {
    if (connection) await connection.close();
  }
};
