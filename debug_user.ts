
import { getDatabaseService } from './src/services/databaseService';

// Mocking required environment or initialization if necessary
// This script assumes the database service can be initialized essentially headless or via existing config.
// We might need to initialize firebase if getDatabaseService doesn't do it automatically or lazily.
// Assuming getDatabaseService uses the singleton pattern and initializes on first call.

async function main() {
  try {
    const db = getDatabaseService();
    console.log('Fetching one user...');
    
    // Fetch 1 user
    const users = await db.getDocuments('users', { limit: 1 });
    
    if (users.length === 0) {
        console.log('No users found.');
    } else {
        console.log('User[0] keys:', Object.keys(users[0]));
        console.log('User[0] content:', JSON.stringify(users[0], null, 2));
    }
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}

main();
