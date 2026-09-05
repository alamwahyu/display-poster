import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const display = await prisma.display.upsert({
    where: { slug: "main" },
    update: { isDefault: true, status: "ACTIVE" },
    create: {
      name: "Main Display",
      slug: "main",
      isDefault: true,
      status: "ACTIVE"
    }
  });

  await prisma.displaySetting.upsert({
    where: { displayId: display.id },
    update: {},
    create: { displayId: display.id }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
