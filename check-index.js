const admin = require('firebase-admin');
const serviceAccount = require('./backend/config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkIndex() {
  try {
    const snapshot = await db.collection('listings')
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    console.log('✅ Index is READY! Found', snapshot.size, 'pending listing(s)');
    process.exit(0);
  } catch (error) {
    console.log('⏳ Index still building...');
    process.exit(1);
  }
}

checkIndex();
