process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.env.TZ = "Asia/Amman";
// import dns from "node:dns/promises";
import { redirect } from "@sveltejs/kit";
import { PRIVATE_VAPID_KEY } from "$env/static/private";
import { PUBLIC_VAPID_KEY } from "$env/static/public";
import { PRIVATE_ORIGIN } from "$env/static/private";
import { PRIVATE_JWT_KEY } from "$env/static/private";
import jwt from "jsonwebtoken";
import { dev } from "$app/environment";
import cron from "node-cron";
import webpush from "web-push";
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
import oracledb from "oracledb";
webpush.setVapidDetails(
  "mailto:mktabari@gmail.com",
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY,
);

oracledb.initOracleClient();
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let show_log = false;

let cronJob;
let scheduledTasks = [];

const taskScheduler = async (restart) => {
  if (dev && show_log) console.log("taskScheduler");
  if (process.env.NODE_APP_INSTANCE !== undefined) {
    process.env.NODE_CRON_RUN =
      process.env.NODE_APP_INSTANCE === "0" ? "true" : "false";
  } else {
    process.env.NODE_CRON_RUN = "true";
  }
  for (const task of scheduledTasks) {
    task.destroy();
  }
  scheduledTasks = [];
  if (restart) {
    const cron_Tasks = await db
      .select({
        id: cronTasks.id,
        name: cronTasks.taskName,
        schedule: cronTasks.schedule,
        taskType: cronTasks.taskType,
        serverId: cronTasks.serverId,
        sql: cronTasks.sql,
        api: cronTasks.api,
        user: serversList.dbUser,
        password: serversList.dbPassword,
        ip: serversList.ip,
        dbName: serversList.dbName,
        dbPort: serversList.dbPort,
      })
      .from(cronTasks)
      .innerJoin(serversList, eq(cronTasks.serverId, serversList.id))
      .innerJoin(server_Tags, eq(serversList.id, server_Tags.serverId))
      .innerJoin(tags, eq(server_Tags.tagId, tags.id))
      .where(
        and(
          eq(serversList.deleteFlag, "0"),
          eq(tags.name, "DB"),
          eq(cronTasks.status, "active"),
        ),
      );
    cron_Tasks.forEach((task) => {
      if (dev && show_log) console.log(task);
      scheduledTasks.push(
        cron.schedule(
          task.schedule,
          async () => {
            let taskRows = [];
            if (dev && show_log)
              console.log(
                process.env.NODE_APP_INSTANCE,
                ` running a task . at: ${new Date().toLocaleString("en-GB", {
                  hour: "numeric",
                  minute: "numeric",
                  month: "numeric",
                  day: "numeric",
                })}`,
              );
            console.log(
              `${task.name} running a task . at: ${new Date().toLocaleString(
                "en-GB",
                {
                  hour: "numeric",
                  minute: "numeric",
                  month: "numeric",
                  day: "numeric",
                },
              )}`,
            );
            await db
              .update(cronTasks)
              .set({ lastRun: Date.now().toString() })
              .where(eq(cronTasks.id, task.id));
            if (task.taskType === "sql") {
              let connection;
              try {
                connection = await oracledb.getConnection({
                  user: task.user,
                  password: task.password,
                  connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${task.ip})(PORT=${task.dbPort}))(CONNECT_DATA=(SID=${task.dbName})))`,
                });
                const result = await connection.execute(task.sql);
                taskRows = result.rows;
                await connection.close();
              } catch (err) {
                console.error(
                  `hook.server.js taskScheduler ${task.name} error`,
                  err,
                );
                if (connection) await connection.close();
              }
            } else if (task.taskType === "api") {
              try {
                let url;
                if (dev) url = `http://localhost:5173`;
                else url = `http://172.30.5.190:3030`;
                // else url = `${PRIVATE_ORIGIN}`;
                // else url = `http://host.docker.internal:3000`;
                console.log(`${url}${task.api}`);
                let response = await fetch(`${url}${task.api}`, {
                  method: "POST",
                  body: JSON.stringify({
                    serverId: task.serverId,
                  }),
                  headers: {
                    "Content-Type": "application/json",
                    "hooks-pass": "true",
                  },
                });

                taskRows = await response.json();
              } catch (err) {
                console.error(
                  `hook.server.js taskScheduler ${task.name} error`,
                  err,
                );
              }
            }
            taskRows.forEach(async (row) => {
              const subscriptions = await db
                .select(pushMessageSubscription)
                .from(pushMessageSubscription)
                .innerJoin(
                  taskSubscription,
                  eq(
                    pushMessageSubscription.id,
                    taskSubscription.subscriptionId,
                  ),
                )
                .where(eq(taskSubscription.taskId, task.id));
              subscriptions.forEach(async (subscription) => {
                await webpush.sendNotification(
                  {
                    endpoint: subscription.endpoint,
                    keys: {
                      p256dh: subscription.p256dh,
                      auth: subscription.auth,
                    },
                    expirationTime: subscription.expirationTime,
                  },
                  JSON.stringify({
                    title: task.name,
                    body: row.body,
                    url: row.url,
                    icon: "/icon-192.png",
                    badge: "/badge.png",
                    image: "/banner.jpg",
                  }),
                );
              });
            });
          },
          { noOverlap: true, name: "schedule_task", distributed: true },
        ),
      );
    });
  }
};
export const init = async () => {
  // if (dev)
  if (dev && show_log) console.log("init");
  taskScheduler(true);
};

if (process.send) {
  // if (dev)
  if (dev && show_log) console.log("process.send");
  process.on("message", (packet) => {
    // if (dev)
    if (dev && show_log) console.log("packet", packet);
    if (packet.topic === "cron-control") {
      taskScheduler(packet.data.command === "kill" ? false : true);
    }
  });
}

export const handle = async ({ event, resolve }) => {
  if (event.request.headers.get("hooks-pass") === "true") return resolve(event);
  if (dev && show_log) console.log("hooks handle", event.url.pathname);
  if (
    event.url.pathname === "/.well-known/appspecific/com.chrome.devtools.json"
  ) {
    return new Response(undefined, { status: 404 });
  }
  const token = event.cookies.get("session_token");

  if (token) {
    const decoded = jwt.verify(token, PRIVATE_JWT_KEY);
    if (dev && show_log) console.log("hooks decoded", decoded);

    let ip = event.getClientAddress();
    // if (dev) console.log("ip", ip);
    // if (event.url.pathname.includes("api") && ip !== decoded.ip) {
    if (ip !== decoded.ip) {
      // if (false) {
      if (dev && show_log)
        console.log("hooks false", event.getClientAddress(), decoded.ip);
      event.locals.user = null;
      event.cookies.delete("session_token", {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: false,
      });
      throw redirect(307, "/");
    } else {
      if (dev && show_log)
        console.log("hooks true", event.getClientAddress(), decoded.ip);
      event.locals.user = {
        machineName: decoded.machineName,
        ip: decoded.ip,
      };
      if (event.url.pathname === "/") {
        throw redirect(307, "/home");
      }
    }
  } else if (
    event.url.pathname !== "/api/login" &&
    event.url.pathname !== "/api/logout" &&
    event.url.pathname !== "/"
  ) {
    if (dev && show_log) console.log("hooks no token", event.url.pathname);
    throw redirect(307, "/");
  }

  return resolve(event);
};
