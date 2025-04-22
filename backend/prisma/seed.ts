import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data in correct dependency order
  await prisma.tipUsage.deleteMany();
  await prisma.gameProgress.deleteMany();
  await prisma.question.deleteMany();
  await prisma.character.deleteMany();
  await prisma.environment.deleteMany();
  await prisma.level.deleteMany();

  // Create levels
  const levels = await prisma.$transaction([
    prisma.level.create({
      data: {
        number: 1,
        name: 'Binary Basics',
        description: 'Learn the fundamentals of binary numbers',
        difficulty: 'Easy',
        requiredScore: 0,
      },
    }),
    prisma.level.create({
      data: {
        number: 2,
        name: 'Binary Addition',
        description: 'Add binary numbers together',
        difficulty: 'Easy',
        requiredScore: 100,
      },
    }),
    prisma.level.create({
      data: {
        number: 3,
        name: 'Binary Subtraction',
        description: 'Subtract binary numbers',
        difficulty: 'Medium',
        requiredScore: 200,
      },
    }),
    prisma.level.create({
      data: {
        number: 4,
        name: 'Binary Multiplication',
        description: 'Multiply binary numbers',
        difficulty: 'Medium',
        requiredScore: 300,
      },
    }),
    prisma.level.create({
      data: {
        number: 5,
        name: 'Binary Division',
        description: 'Divide binary numbers',
        difficulty: 'Hard',
        requiredScore: 400,
      },
    }),
  ]);

  // Create characters
  const characters = await prisma.$transaction([
    prisma.character.create({
      data: {
        name: 'Joyce',
        modelUrl: '/3d/models/joyce/model.glb',
      },
    }),
  ]);

  // Create environments with obstacles
  const environment = await prisma.environment.create({
    data: {
      name: 'Binary Terrain',
      description: 'A mystical landscape of binary code',
      modelUrl: '/3d/environments/terrain/scene.gltf',
      obstacles: {
        create: [
          {
            name: 'Rock Obstacle',
            modelUrl: '/3d/environments/terrain/obstacles/scene.gltf',
            meshName: 'SM_Rocks_01_RocksStylized_M_0',
          },
        ],
      },
    },
    include: { obstacles: true },
  });

  console.log('Seeding complete!');
  console.log(`${levels.length} levels created`);
  console.log(`${characters.length} character(s) created`);
  console.log(`${environment.name} environment with ${environment.obstacles.length} obstacle(s) created`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
