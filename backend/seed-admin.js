// Usage: node seed-admin.js
const seedAdmin = require('./utils/seeder');

console.log('Starting admin seeding...\n');

seedAdmin()
  .then(() => {
    console.log('\nSeeding process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nSeeding failed:', error);
    process.exit(1);
  });
