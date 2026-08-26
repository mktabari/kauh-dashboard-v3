process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
import { XMLParser } from "fast-xml-parser";
import { json } from "@sveltejs/kit";
export const POST = async ({ request }) => {
  const { ip, username, password, id } = await request.json();
  // console.log(id);
  let response = await fetch(
    `http://${ip}:9002/reports/rwservlet/getserverinfo${id}?statusformat=xml`,
  );
  if (response.status !== 200) {
    return json({ status: "error" });
  }
  const options = {
    ignoreAttributes: false, // Keeps your XML attributes (e.g., id="123")
    attributeNamePrefix: "_", // Prefixes attribute keys to avoid naming clashes
  };
  const parser = new XMLParser(options);
  let xmlString = await response.text();
  let jsonObj = parser.parse(xmlString);
  let engine = jsonObj.serverInfo.engine
    .find((item) => item._id === "rwEng")
    .engineInstance.find((item) => item._runJobId === id)._name;
  // console.log(engine);
  engine = engine.split("-");
  response = await fetch(
    `http://${ip}:9002/reports/rwservlet/killengine${engine[1]}?statusformat=xml&authid=${username}/${password}&type=${engine[0]}`,
  );
  // console.log(response);
  if (response.status !== 200) {
    return json({ status: "error" });
  }
  xmlString = await response.text();

  jsonObj = parser.parse(xmlString);
  // console.log(
  //   `http://${ip}:9002/reports/rwservlet/killengine${engine[1]}?statusformat=xml&authid=${username}/${password}&type=${engine[0]}`,
  // );
  return json(jsonObj);
};
