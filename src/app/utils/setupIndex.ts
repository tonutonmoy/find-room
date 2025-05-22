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
    
  } catch (error) {
    console.error('Error creating index:', error);
  } finally {
    await prisma.$disconnect();
  }
}

export default setupIndex
