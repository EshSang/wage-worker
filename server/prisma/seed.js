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

// Additional seeding for reviews

async function main() {
  await prisma.review.createMany({
    data: [
      {
        orderId: 1,
        reviewerId: 2,
        rating: 5,
        comment: 'Excellent service!', 
        createdAt: new Date()
      },
      {
        orderId: 2,
        reviewerId: 3,
        rating: 4,
        comment: 'Good job, but arrived late',
        createdAt: new Date()
      },
      {
        orderId: 3,
        reviewerId: 1,
        rating: 3,
        comment: 'Average experience',
        createdAt: new Date()
      }
    ]
  });
}



  // 2️⃣ Create orders
  // async function main() {
  //   await prisma.order.createMany({
  //   data: [
  //   {
  //     jobApplicationId:2,
  //     jobId: 1,
  //     userId: 2,
  //     acceptedDate: new Date(),
  //     status: "PENDING"
  //   },
  //   {
  //     jobApplicationId:2,
  //     jobId: 1,
  //     userId: 2,
  //     acceptedDate: new Date(),
  //     status: "COMPLETED"
  //   }
  //   ]
  // })};

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });





// main()
//   .catch(console.error)
//   .finally(() => prisma.$disconnect());
