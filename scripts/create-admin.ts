import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rl = createInterface({ input, output });
  const name = (await rl.question("Admin Name: ")).trim();
  const email = (await rl.question("Admin Email: ")).trim().toLowerCase();
  const password = await rl.question("Admin Password: ");
  rl.close();

  if (!name || !email || password.length < 8) {
    throw new Error("Name and email are required, password must be at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { name, email, passwordHash }
  });

  console.log(`Admin user ready: ${email}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error.message);
    await prisma.$disconnect();
    process.exit(1);
  });
