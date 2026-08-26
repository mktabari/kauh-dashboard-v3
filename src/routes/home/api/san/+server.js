import { json } from "@sveltejs/kit";
import { fork } from "child_process";
import path from "path";

export const POST = async ({ request, setHeaders }) => {
  setHeaders({ "Cache-Control": "public, max-age=43200" });
  const { ip, username, password } = await request.json();
  const worker = fork(path.resolve("scripts/san/worker.js"));
  return json({
    result: await new Promise((resolve) => {
      worker.send({ ip, username, password });
      worker.on("message", (data) => {
        worker.kill();
        resolve(data);
      });
    }),
  });
};
