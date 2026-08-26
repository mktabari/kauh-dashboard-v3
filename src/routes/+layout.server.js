import { redirect } from "@sveltejs/kit";
// import dns from "node:dns/promises";
import { dev } from "$app/environment";
export const load = async ({ locals, url, cookies }) => {
  // if (dev) return {};
  if (false) {
    let show_log = false;
    if (dev && show_log)
      console.log("layout locals", locals, "layout url.pathname", url.pathname);
    // if (locals.user?.ip) {
    //   if (dev) console.log("layout locals.user.ip", locals.user.ip);
    //   const hostnames = await dns.reverse(locals.user.ip);
    //   if (locals.user.machineName !== hostnames[0]) {
    //     cookies.delete("session_token", {
    //       path: "/",
    //       httpOnly: true,
    //       sameSite: "strict",
    //       secure: false,
    //     });
    //     if (dev)
    //       console.log(
    //         "machineName mismatch redirect to /",
    //         locals.user.machineName,
    //         hostnames,
    //       );
    //     throw redirect(307, "/");
    //   }
    // }
    if (!locals.user) {
      if (dev && show_log) console.log("layout locals user is null");
      if (
        url.pathname !== "/" &&
        url.pathname !== "/api/login" &&
        url.pathname !== "/api/logout"
      ) {
        if (dev && show_log)
          console.log("layout redirect not /, login or logout", url.pathname);
        throw redirect(303, "/");
      }
    } else if (url.pathname === "/") {
      if (dev && show_log)
        console.log("layout redirect to /home", url.pathname);
      throw redirect(307, "/home");
    }
  }
  return {};
};
