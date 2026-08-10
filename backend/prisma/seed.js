const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: {
      firstName: 'Alex',
      lastName: 'Admin',
      email: 'admin@restaurant.com',
      passwordHash: password,
      role: 'admin',
      startWorkDate: new Date('2022-01-10'),
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@restaurant.com' },
    update: {},
    create: {
      firstName: 'Bianca',
      lastName: 'Buyer',
      email: 'buyer@restaurant.com',
      passwordHash: password,
      role: 'buyer',
      startWorkDate: new Date('2023-03-01'),
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@restaurant.com' },
    update: {},
    create: {
      firstName: 'Sam',
      lastName: 'Staff',
      email: 'staff@restaurant.com',
      passwordHash: password,
      role: 'staff',
      startWorkDate: new Date('2024-06-15'),
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Welcome to the new restaurant app!',
      htmlContent: '<p>Hi team, please use this app to manage the shopping list going forward. Thanks!</p>',
      createdById: admin.id,
    },
  });

  const today = new Date();
  await prisma.shoppingItem.createMany({
    data: [
      {
        name: 'Tomatoes',
        category: 'Vegetables',
        quantity: 10,
        unit: 'kg',
        plannedOn: today,
        status: 'pending',
        createdById: staff.id,
        updatedById: staff.id,
      },
      {
        name: 'Mineral water',
        description: 'Still water, 1.5L bottles',
        category: 'Beverages',
        quantity: 24,
        unit: 'pcs',
        price: 0.6,
        plannedOn: today,
        status: 'pending',
        createdById: staff.id,
        updatedById: staff.id,
      },
    ],
  });

  console.log('Seed complete. Demo logins (password: password123):');
  console.log('  admin@restaurant.com / buyer@restaurant.com / staff@restaurant.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
