import { db } from '../prisma/db';

async function checkUsers() {
  const users = await db.orm.public.User.all();

  console.log('=== Current Users ===');

  for (const user of users) {
    console.log({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
    });
  }
}

checkUsers().catch((error) => {
  console.error('Failed to read users:', error);
  process.exit(1);
});