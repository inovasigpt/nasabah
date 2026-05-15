import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { createSession } from "./session";

export async function loginUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return { success: false, error: "Invalid username or password" };
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return { success: false, error: "Invalid username or password" };
  }

  await createSession({
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
  });

  return { success: true, user: { id: user.id, username: user.username, role: user.role, name: user.name } };
}
