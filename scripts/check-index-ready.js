// Script to check if Firestore index is ready by testing the query
// Run with: node scripts/check-index-ready.js

const admin = require('firebase-admin');
const serviceAccount = require('../backend/config/serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkIndexReady() {
  try {
    console.log('🔍 Checking if Firestore index is ready...\n');

    // This is the query that requires the index
    const listingsRef = db.collection('listings');
    const query = listingsRef
      .where('partnerId', '==', 'test-id')  // Dummy query to test index
      .orderBy('createdAt', 'desc');

    await query.limit(1).get();

    console.log('✅ Index is READY!\n');
    console.log('You can now:');
    console.log('1. Restart your Expo app');
    console.log('2. Login as admin (admin@skyconnect.com / Admin123!)');
    console.log('3. Approve your listing\n');
    
    process.exit(0);
  } catch (error) {
    if (error.code === 9) { // FAILED_PRECONDITION = index not ready
      console.log('⏳ Index is still building...');
      console.log('   Please wait 1-2 more minutes\n');
      console.log('💡 Tip: You can check status at:');
      console.log('   https://console.firebase.google.com/project/skyconnectsl-13e92/firestore/indexes\n');
    } else {
      console.log('✅ Index is READY!\n');
      console.log('You can now:');
      console.log('1. Restart your Expo app');
      console.log('2. Login as admin (admin@skyconnect.com / Admin123!)');
      console.log('3. Approve your listing\n');
    }
    process.exit(0);
  }
}

checkIndexReady();
