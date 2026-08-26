import ping from "ping";
process.on("message", async (ip) => {
  try {
    ping.sys.probe(ip, function (data) {
      process.send(data.alive);
    });
  } catch (err) {
    console.error("worker ping error", err);
    process.send(false);
  }
});

// process.on("message", async (ip) => {
//   let isAlive = await new Promise((resolve, reject) => {
//     try {
//       ping.sys.probe(ip, function (data) {
//         resolve(data.alive);
//       });
//     } catch (err) {
//       reject(err);
//     }
//   });
//   process.send(isAlive);
// });
