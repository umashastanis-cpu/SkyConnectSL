const admin = require('firebase-admin');
const serviceAccount = require('../backend/config/serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkIndex() {
  try {
    console.log('Checking if listings status+createdAt index is ready...\n');
    
    // Try the query that requires the index
    const snapshot = await db.collection('listings')
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    console.log('✅ Index is READY!');
    console.log(`   Found ${snapshot.size} pending listing(s)\n`);
    
    if (!snapshot.empty) {
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log('   Pending listing:', {
          id: doc.id,
          title: data.title,
          status: data.status,
          createdAt: data.createdAt?.toDate()
        });
      });
    }
    
    console.log('\n✅ You can now:');
    console.log('   1. Restart your Expo app (or reload)');
    console.log('   2. Login as admin (admin@skyconnect.com / Admin123!)');
    console.log('   3. View and approve pending listings in the Admin Dashboard\n');
    
    process.exit(0);
  } catch (error) {
    if (error.code === 9 || error.message.includes('index')) {
      console.log('⏳ Index is still building...');
      console.log('   This usually takes 1-3 minutes.');
      console.log('   Run this script again in a minute to check.\n');
      console.log('   Error:', error.message);
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

checkIndex();
