process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
process.on("message", ({ ip, username, password, url }) => {
  // const fetchCookie = makeFetchCookie(fetch);
  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    "Basic " +
      new Buffer.from(username + ":" + password, "utf8").toString("base64"),
  );
  myHeaders.append("Content-type", "application/json");
  myHeaders.append("Accept", "application/json");
  myHeaders.append("X-Requested-By", "KauhDashboard");

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  try {
    fetch(`http://${ip}:7001${url}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        process.send(result);
      })
      .catch((error) => {
        console.error("worker getRuntimeServers  error", error);
        process.send("error");
      });
  } catch (err) {
    console.error("worker getRuntimeServers error", err);
    process.send("error");
  }
});
