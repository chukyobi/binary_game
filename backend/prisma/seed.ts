import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data in the correct order
  await prisma.tipUsage.deleteMany();
  await prisma.gameProgress.deleteMany();
  await prisma.question.deleteMany();
  await prisma.character.deleteMany();
  await prisma.environment.deleteMany();
  await prisma.level.deleteMany();

  // Create levels
  const levels = await Promise.all([
    prisma.level.create({
      data: {
        number: 1,
        name: 'Binary Basics',
        description: 'Learn the fundamentals of binary numbers',
        difficulty: 'Easy',
        requiredScore: 0
      }
    }),
    prisma.level.create({
      data: {
        number: 2,
        name: 'Binary Addition',
        description: 'Add binary numbers together',
        difficulty: 'Easy',
        requiredScore: 100
      }
    }),
    prisma.level.create({
      data: {
        number: 3,
        name: 'Binary Subtraction',
        description: 'Subtract binary numbers',
        difficulty: 'Medium',
        requiredScore: 200
      }
    }),
    prisma.level.create({
      data: {
        number: 4,
        name: 'Binary Multiplication',
        description: 'Multiply binary numbers',
        difficulty: 'Medium',
        requiredScore: 300
      }
    }),
    prisma.level.create({
      data: {
        number: 5,
        name: 'Binary Division',
        description: 'Divide binary numbers',
        difficulty: 'Hard',
        requiredScore: 400
      }
    })
  ]);

  // Create characters
  const characters = await Promise.all([
    prisma.character.create({
      data: {
        name: 'Joyce',
        modelUrl: '/3d/models/joyce/model.glb',
        textureUrl: null,
        animationUrls: [
          '/3d/models/joyce/animations/idle.glb',
          '/3d/models/joyce/animations/running.glb',
          '/3d/models/joyce/animations/running-slide.glb'
        ],
        isUnlocked: true,
        unlockCost: 0
      }
    })
  ]);

  // Create environment
  await prisma.environment.create({
    data: {
      name: 'Binary Terrain',
      description: 'A mystical landscape of binary code',
      modelUrl: '/3d/environments/terrain/model.glb',
      textureUrl: null,
      isUnlocked: true,
      unlockCost: 0
    }
  });

  console.log('Database seeded with:');
  console.log(`${levels.length} levels`);
  console.log(`${characters.length} characters`);
  console.log('1 environment');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 