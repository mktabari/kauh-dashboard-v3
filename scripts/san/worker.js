import makeFetchCookie from "fetch-cookie";
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
process.on("message", async ({ ip, username, password }) => {
  const fetchCookie = makeFetchCookie(fetch);
  try {
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
    let response = await fetchCookie(
      `https://${ip}/api/types/systemCapacity/instances?fields=sizeFree,sizeTotal,id,sizeUsed`,
      requestOptions,
    );
    let result = await response.json();
    process.send(result.entries[0]?.content);
  } catch (err) {
    console.error("worker san error", err);
    process.send("error");
  }
});
