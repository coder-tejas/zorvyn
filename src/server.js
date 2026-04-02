const { prisma } = require('./config/prisma');
const { connectRedis } = require('./config/redis');
const { createApp } = require('./app');

const PORT = Number(process.env.PORT || 3000);

async function start() {
  const redis = await connectRedis();
  const app = createApp({ prisma, redis });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch(async (error) => {
  console.error('Failed to start server', error);
  await prisma.$disconnect();
  process.exit(1);
});
