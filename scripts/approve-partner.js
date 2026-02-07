// Quick script to approve a partner account in Firestore
// Run with: node scripts/approve-partner.js YOUR_USER_ID

const admin = require('firebase-admin');
const serviceAccount = require('../backend/config/serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function approvePartner(userId) {
  try {
    if (!userId) {
      console.error('❌ Please provide a user ID');
      console.log('Usage: node scripts/approve-partner.js YOUR_USER_ID');
      process.exit(1);
    }

    const partnerRef = db.collection('partners').doc(userId);
    const partnerDoc = await partnerRef.get();

    if (!partnerDoc.exists) {
      console.error(`❌ Partner with ID ${userId} not found`);
      process.exit(1);
    }

    await partnerRef.update({
      status: 'approved',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Partner ${userId} has been approved!`);
    console.log(`Partner: ${partnerDoc.data().companyName}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error approving partner:', error);
    process.exit(1);
  }
}

// Get user ID from command line argument
const userId = process.argv[2];
approvePartner(userId);
