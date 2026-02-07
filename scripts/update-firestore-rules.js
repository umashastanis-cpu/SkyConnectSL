// Script to update Firestore security rules
// Run with: node scripts/update-firestore-rules.js

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('../backend/config/serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

async function updateRules() {
  try {
    console.log('⚠️  NOTE: Firestore security rules cannot be updated programmatically.');
    console.log('You need to update them manually in the Firebase Console.\n');
    
    console.log('📋 Follow these steps:\n');
    console.log('1. Go to: https://console.firebase.google.com');
    console.log('2. Select your project: skyconnectsl-13e92');
    console.log('3. Go to Firestore Database → Rules');
    console.log('4. Replace the existing rules with the content from firestore.rules file');
    console.log('5. Click "Publish"\n');
    
    console.log('Or use the Firebase CLI:');
    console.log('  npm install -g firebase-tools');
    console.log('  firebase login');
    console.log('  firebase use skyconnectsl-13e92');
    console.log('  firebase deploy --only firestore:rules\n');
    
    // Read and display the rules
    const rulesPath = path.join(__dirname, '..', 'firestore.rules');
    const rules = fs.readFileSync(rulesPath, 'utf8');
    
    console.log('════════════════════════════════════════════════════════════');
    console.log('COPY THE RULES BELOW TO FIREBASE CONSOLE:');
    console.log('════════════════════════════════════════════════════════════\n');
    console.log(rules);
    console.log('\n════════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateRules();
