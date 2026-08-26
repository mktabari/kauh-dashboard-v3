import makeFetchCookie from "fetch-cookie";
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
process.on("message", ({ ip, username, password }) => {
  const fetchCookie = makeFetchCookie(fetch);
  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    "Basic " +
      new Buffer.from(username + ":" + password, "utf8").toString("base64"),
  );
  myHeaders.append("Content-type", "application/json");
  myHeaders.append("Accept", "application/json");
  myHeaders.append("X-EMC-REST-CLIENT", "true");

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  try {
    fetchCookie(
      `https://${ip}/api/types/alert/instances?fields=severity,component,message,description,timestamp`,
      requestOptions,
    )
      .then((response) => response.json())
      .then((result) => {
        process.send(result.entries);
      })
      .catch((error) => {
        console.error("eworker faults/san fetchCookie error", error);
        process.send("error");
      });
  } catch (err) {
    console.error("worker faults/san error", err);
    process.send("error");
  }
});
