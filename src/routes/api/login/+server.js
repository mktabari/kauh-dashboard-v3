// export const prerender = false;
import { dev } from "$app/environment";
import { json } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
// import dns from "node:dns/promises";
import { PRIVATE_JWT_KEY } from "$env/static/private";
import { PRIVATE_ADMIN_PASSWORD } from "$env/static/private";

export async function POST({ getClientAddress, request, cookies }) {
  const { password } = await request.json();
  if (password === PRIVATE_ADMIN_PASSWORD) {
    try {
      let machineName = "Unknown";
      const ip = getClientAddress();
      // let hostnames;
      // if (dev)
      // hostnames = ["aa"];
      machineName = "aa";
      // else hostnames = await dns.reverse(ip);
      // if (hostnames && hostnames.length > 0) {
      //   machineName = hostnames[0];
      // }
      const token = jwt.sign({ machineName, ip }, PRIVATE_JWT_KEY, {
        expiresIn: "30d",
      });
      // console.log("login token", !dev);
      cookies.set("session_token", token, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        maxAge: 60 * 60 * 24 * 30,
      });
    } catch (error) {
      console.error("api/login error", error);
    }
    return json({ success: true });
  }

  return json({ error: "Invalid credentials" }, { status: 401 });
}
