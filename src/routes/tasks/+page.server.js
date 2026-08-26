import {
  sql,
  db,
  eq,
  and,
  cronTasks,
  taskSubscription,
  pushMessageSubscription,
  serversList,
  tags,
  server_Tags,
} from "$lib/DB";
import pm2 from "pm2";
const restartCronTasks = async () => {
  pm2.connect((err) => {
    if (err) return;

    pm2.sendDataToProcessId(
      "0",
      {
        type: "process:msg",
        topic: "cron-control",
        data: {
          command: "restart", // 'kill' or 'restart'
        },
      },
      (err, res) => {
        pm2.disconnect();
      },
    );
  });
};
export const load = async () => {
  const cron_Tasks = await db
    .select(cronTasks)
    .from(cronTasks)
    .innerJoin(serversList, eq(cronTasks.serverId, serversList.id))
    .innerJoin(server_Tags, eq(serversList.id, server_Tags.serverId))
    .innerJoin(tags, eq(server_Tags.tagId, tags.id))
    .where(and(eq(serversList.deleteFlag, "0"), eq(tags.name, "DB")));
  const DBs = await db
    .select(serversList)
    .from(serversList)
    .innerJoin(server_Tags, eq(serversList.id, server_Tags.serverId))
    .innerJoin(tags, eq(server_Tags.tagId, tags.id))
    .where(and(eq(serversList.deleteFlag, "0"), eq(tags.name, "DB")));
  const taskSubscriptions = await db
    .select(taskSubscription)
    .from(taskSubscription)
    .innerJoin(cronTasks, eq(taskSubscription.taskId, cronTasks.id))
    .innerJoin(
      pushMessageSubscription,
      eq(taskSubscription.subscriptionId, pushMessageSubscription.id),
    );
  // .where(eq(cronTasks.deleteFlag, "0"));
  return {
    cronTasks: cron_Tasks,
    DBs,
    taskSubscriptions,
  };
};

export const actions = {
  addTask: async ({ request }) => {
    let data = Object.fromEntries(await request.formData());
    let {
      scheduleMinute,
      scheduleHour,
      scheduleDayOfMonth,
      scheduleMonth,
      scheduleDayOfWeek,
      ...task
    } = data;

    try {
      const newTask = await db.insert(cronTasks).values(task);
      return { message: `Task ${task.taskName} Added Successfully` };
    } catch (error) {
      console.error("Error adding task:", error);
      return { message: "Failed to add task." };
    }
  },
  editTask: async ({ request }) => {
    let data = Object.fromEntries(await request.formData());
    let {
      scheduleMinute,
      scheduleHour,
      scheduleDayOfMonth,
      scheduleMonth,
      scheduleDayOfWeek,
      ...task
    } = data;
    try {
      await db
        .update(cronTasks)
        .set({ ...task, updatedAt: sql`(CURRENT_TIMESTAMP)` })
        .where(eq(cronTasks.id, task.id));
      restartCronTasks();
      return { message: `Task ${task.taskName} Updated Successfully` };
    } catch (error) {
      console.error("Error updating task:", error);
      return { error: "Error updating task." };
    }
  },
  deleteTask: async ({ request }) => {
    let data = Object.fromEntries(await request.formData());
    try {
      await db.delete(cronTasks).where(eq(cronTasks.id, data.id));
      return { message: `Task ${data.taskName} Deleted Successfully` };
    } catch (error) {
      console.error("Error deleting task:", error);
      return { error: "Error deleting task." };
    }
  },
  activateTask: async ({ request }) => {
    let data = Object.fromEntries(await request.formData());

    try {
      await db
        .update(cronTasks)
        .set({ status: "active", updatedAt: sql`(CURRENT_TIMESTAMP)` })
        .where(eq(cronTasks.id, data.id));
      restartCronTasks();
      return { message: `Task ${data.taskName} Activated Successfully` };
    } catch (error) {
      console.error("Error updating task:", error);
      return { error: "Unable to activate task." };
    }
  },
  deactivateTask: async ({ request }) => {
    let data = Object.fromEntries(await request.formData());

    try {
      await db
        .update(cronTasks)
        .set({ status: "inactive", updatedAt: sql`(CURRENT_TIMESTAMP)` })
        .where(eq(cronTasks.id, data.id));
      restartCronTasks();
      return { message: `Task ${data.taskName} Deactivated Successfully` };
    } catch (error) {
      console.error("Error updating task:", error);
      return { error: "Unable to deactivate task." };
    }
  },
};
