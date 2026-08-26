import { db, eq, tags } from "$lib/DB";
export const load = async () => {
  const allTags = await db.select().from(tags);
  return {
    allTags: allTags,
  };
};

export const actions = {
  addTag: async ({ request }) => {
    let tag = Object.fromEntries(await request.formData());
    tag.permanent ? (tag.permanent = 1) : (tag.permanent = 0);
    try {
      await db.insert(tags).values(tag).returning({ id: tags.id });

      return { message: `Tag ${tag.name} Added Successfully` };
    } catch (error) {
      console.error("Error adding tag:", error);
      return { message: "Failed to add tag." };
    }
  },
  deleteTag: async ({ request }) => {
    let tag = Object.fromEntries(await request.formData());
    try {
      await db.delete(tags).where(eq(tags.id, tag.id));
      return { message: `Tag ${tag.name} Deleted Successfully` };
    } catch (error) {
      console.error("Error deleting tag:", error);
      return { error: "Error deleting tag." };
    }
  },
};
