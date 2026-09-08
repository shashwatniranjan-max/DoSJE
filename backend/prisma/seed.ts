import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@dosje.local" },
    update: {},
    create: {
      name: "Asha Rao",
      role: Role.ADMIN,
      email: "admin@dosje.local",
      password: passwordHash,
    },
  });

  const inspector = await prisma.user.upsert({
    where: { email: "inspector@dosje.local" },
    update: {},
    create: {
      name: "Kiran Mehta",
      role: Role.INSPECTOR,
      email: "inspector@dosje.local",
      password: passwordHash,
    },
  });

  const ngoHead = await prisma.user.upsert({
    where: { email: "ngohead@dosje.local" },
    update: {},
    create: {
      name: "Priya Nair",
      role: Role.NGO_HEAD,
      email: "ngohead@dosje.local",
      password: passwordHash,
    },
  });

  await prisma.institute.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Sunrise Learning Centre",
      claimed_capacity: 40,
      lat: 28.6139,
      lng: 77.209,
      inchargeId: ngoHead.id,
    },
  });

  console.log("Seeded users:", {
    admin: admin.email,
    inspector: inspector.email,
    ngoHead: ngoHead.email,
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
