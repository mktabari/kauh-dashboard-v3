import { json } from "@sveltejs/kit";
import { db, eq, ne, and, serversList, tags, server_Tags } from "$lib/DB";
import oracledb from "oracledb";
oracledb.initOracleClient();
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
export const POST = async ({ request }) => {
  const { action, AUI, PI } = await request.json();
  const servers = await db
    .select(serversList)
    .from(serversList)
    .innerJoin(server_Tags, eq(serversList.id, server_Tags.serverId))
    .innerJoin(tags, eq(server_Tags.tagId, tags.id))
    .where(and(eq(serversList.deleteFlag, "0"), eq(tags.name, "Users")));
  const connection = await oracledb.getConnection({
    user: servers[0].dbUser,
    password: servers[0].dbPassword,
    connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${servers[0].ip})(PORT=${servers[0].dbPort}))(CONNECT_DATA=(SID=${servers[0].dbName})))`,
    // connectString: `${servers[0].ip}/${servers[0].dbName}`,
  });

  return json({
    result: await new Promise(async (resolve) => {
      try {
        await connection.execute(
          `update am_practitioner set eff_status='${action === "activate" ? "E" : "D"}' where practitioner_id='${PI}'`,
        );
        await connection.execute(
          `update sm_appl_user set eff_status='${action === "activate" ? "E" : "D"}' where appl_user_id='${AUI}'`,
        );
        await connection.commit();
        resolve("success");
      } catch (error) {
        console.error("users api error", error);
        await connection.rollback();
        resolve("error");
      } finally {
        await connection.close();
      }
    }),
  });
};
