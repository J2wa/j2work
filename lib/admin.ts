import { getSession } from "./auth";
// IDs are assigned by the authentication service, never accepted from signup input.
export function isAdminId(id: string) {
  return (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .includes(id);
}
export async function getAdmin() {
  const session = await getSession();
  return session && isAdminId(session.user.id) ? session.user : null;
}
