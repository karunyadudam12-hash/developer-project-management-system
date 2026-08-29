import { getUsers } from '../repositories/user.repository';
import { db } from './db';

async function testDatabaseAccess() {
  try {
    console.log('Testing DPMS database access layer...');

    const users = await getUsers();

    console.log('✅ Database access layer working!');
    console.log(`Users found: ${users.length}`);
  } catch (error) {
    console.error('❌ Database access layer failed!');
    console.error(error);
  } finally {
    await db.close();
  }
}

testDatabaseAccess();