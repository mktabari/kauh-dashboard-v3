process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
import { XMLParser } from "fast-xml-parser";
import { json } from "@sveltejs/kit";
export const POST = async ({ request }) => {
  const { ip, username, password, queue } = await request.json();
  let count = "";
  if (queue === "past") {
    count = "&count=20";
  }
  let response = await fetch(
    `http://${ip}:9002/reports/rwservlet/showjobs?statusformat=xml&startrow=0&queuetype=${queue}${count}`,
  );

  if (response.status !== 200) {
    return json({ status: "error" });
  }
  const xmlString = await response.text();
  const options = {
    ignoreAttributes: false, // Keeps your XML attributes (e.g., id="123")
    attributeNamePrefix: "_", // Prefixes attribute keys to avoid naming clashes
  };
  const parser = new XMLParser(options);
  const jsonObj = parser.parse(xmlString);
  // console.log(jsonObj);
  return json(jsonObj);
};
