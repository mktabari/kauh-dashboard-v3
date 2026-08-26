process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
import { json } from "@sveltejs/kit";
import path from "path";
export const POST = async ({ request }) => {
  // const { ip, username, password, bkpdir } = await request.json();
  const { ip, username, password, url } = await request.json();
  // console.log(ip, username, password, url);
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
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({}),
  };

  let response = await fetch(`http://${ip}:7001${url}`, requestOptions);
  // console.log(await response.json());
  if (response.status !== 200) {
    return json({ status: "error" });
  }

  return json({ status: "ok" });
};
