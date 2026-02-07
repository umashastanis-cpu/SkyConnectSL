// Script to create an admin user in Firebase
// Run with: node scripts/create-admin.js your-email@example.com your-password

const admin = require('firebase-admin');
const serviceAccount = require('../backend/config/serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

async function createAdmin(email, password) {
  try {
    if (!email || !password) {
      console.error('❌ Please provide email and password');
      console.log('Usage: node scripts/create-admin.js your-email@example.com your-password');
      process.exit(1);
    }

    console.log('Creating admin user...');

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: true, // Auto-verify admin
    });

    console.log(`✅ User created with UID: ${userRecord.uid}`);

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      role: 'admin',
      emailVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Admin user document created in Firestore');
    console.log('\n🎉 Admin account created successfully!');
    console.log(`Email: ${email}`);
    console.log(`UID: ${userRecord.uid}`);
    console.log('\nYou can now login with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

createAdmin(email, password);
