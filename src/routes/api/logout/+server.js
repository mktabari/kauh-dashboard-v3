// export const prerender = false;
import { json } from "@sveltejs/kit";
// import { dev } from "$app/environment";
export async function GET({ cookies }) {
  cookies.delete("session_token", {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });
  return json({ success: true });
}
