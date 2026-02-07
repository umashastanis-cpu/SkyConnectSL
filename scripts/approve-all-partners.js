// Script to approve all pending partners (one-time use for development)
// Run with: node scripts/approve-all-partners.js

const admin = require('firebase-admin');
const serviceAccount = require('../backend/config/serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function approveAllPendingPartners() {
  try {
    console.log('Finding pending partners...');

    const partnersRef = db.collection('partners');
    const snapshot = await partnersRef.where('status', '==', 'pending').get();

    if (snapshot.empty) {
      console.log('✅ No pending partners found');
      process.exit(0);
    }

    console.log(`Found ${snapshot.size} pending partner(s)\n`);

    const batch = db.batch();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Approving: ${data.companyName} (${doc.id})`);
      batch.update(doc.ref, {
        status: 'approved',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();

    console.log(`\n✅ Successfully approved ${snapshot.size} partner(s)!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

approveAllPendingPartners();
