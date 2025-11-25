const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Define categories to seed
  const categories = [
    { id: 1, category: 'Barber' },
    { id: 2, category: 'Carpenter' },
    { id: 3, category: 'Electrician' },
    { id: 4, category: 'Painter' },
    { id: 5, category: 'Garagemen' },
    { id: 6, category: 'Beautician' },
    { id: 7, category: 'Plumber' },
    { id: 8, category: 'Ceiling' },
    { id: 9, category: 'Welder' },
  ];

  // Insert categories
  console.log('Seeding job categories...');

  for (const cat of categories) {
    const category = await prisma.jobCategory.upsert({
      where: { id: cat.id },
      update: {
        category: cat.category,
      },
      create: {
        id: cat.id,
        category: cat.category,
      },
    });
    console.log(`✓ Created/Updated category: ${category.category} (ID: ${category.id})`);
  }

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
