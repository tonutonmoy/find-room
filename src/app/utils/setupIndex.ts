// prisma/setupIndex.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const  setupIndex= async()=> {
  try {
    await prisma.$runCommandRaw({
      createIndexes: 'listings',
      indexes: [
        {
          key: { location: '2dsphere' },
          name: 'location_2dsphere',
        },
      ],
    });
    console.log('2dsphere index created successfully.');
  } catch (error) {
    console.error('Error creating index:', error);
  } finally {
    await prisma.$disconnect();
  }
}

export default setupIndex
