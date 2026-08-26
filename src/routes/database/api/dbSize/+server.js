import { json } from "@sveltejs/kit";
import { db, eq, ne, and, dbSize } from "$lib/DB";

export const POST = async ({ request }) => {
  const { dbName, dbSizeGroup } = await request.json();
  // const data = await db
  //   .selectDistinct(dbSize)
  //   .from(dbSize)
  //   .where(and(eq(dbSize.dbName, dbName), eq(dbSize.dbSizeGroup, dbSizeGroup)));
  const data = await db
    .selectDistinct(dbSize)
    .from(dbSize)
    .where(eq(dbSize.dbSizeGroup, dbSizeGroup));
  return json({ data });
};
