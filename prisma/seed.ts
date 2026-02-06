const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      namaLengkap: 'Admin Madrasah',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('User Admin berhasil dibuat:', admin.username);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());