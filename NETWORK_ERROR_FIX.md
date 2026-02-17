# 🔧 Firebase Network Error - Quick Fix Guide

## Error Symptoms
```
ERROR: Sign in error: [FirebaseError: Firebase: Error (auth/network-request-failed).]
WARN: @firebase/firestore: WebChannelConnection RPC 'Listen' stream transport errored
```

## ✅ Solutions (Try in order)

### 1. **Install Network Dependency**
```bash
npm install @react-native-community/netinfo
```

### 2. **Restart Development Server**
```bash
# Stop Expo (Ctrl+C in terminal)
# Clear cache and restart
npx expo start --clear
```

### 3. **Check Your Internet Connection**
- Verify your device/emulator has internet access
- Try opening a website in the device browser
- Check WiFi or mobile data is enabled

### 4. **For Android Emulator**
If using Android Emulator:
- Cold boot the emulator (Wipe data in AVD Manager)
- Or restart with: `adb kill-server && adb start-server`

### 5. **For Physical Device**
- Make sure device and computer are on the same network
- Disable any VPN or firewall that might block Firebase
- Try switching between WiFi and mobile data

### 6. **Check Firestore Rules**
Your rules are set correctly, but verify in Firebase Console:
- Go to Firebase Console → Firestore Database → Rules
- Ensure rules are published (not in draft)

### 7. **Clear App Cache**
On your device/emulator:
- Uninstall the app completely
- Reinstall by running `npx expo start` again
- Press 'a' for Android or 'i' for iOS

### 8. **Test Backend Connection**
```bash
# Test if backend is reachable
Invoke-WebRequest -Uri https://firestore.googleapis.com/ -Method HEAD
```

## 🔍 Diagnostic Commands

### Check Network Status
```javascript
// Add to LoginScreen for testing
import NetInfo from '@react-native-community/netinfo';

NetInfo.fetch().then(state => {
  console.log('Connection type', state.type);
  console.log('Is connected?', state.isConnected);
  console.log('Is internet reachable?', state.isInternetReachable);
});
```

### Check Firebase Config
```javascript
// In src/config/firebase.ts, add logging
console.log('Firebase initialized:', auth.app.name);
```

## 🎯 Most Common Fixes

**90% of network errors are fixed by:**
1. Installing `@react-native-community/netinfo`
2. Running `npx expo start --clear`
3. Restarting the device/emulator
4. Checking internet connection

## 📱 Quick Test

After applying fixes, test with:
```javascript
// Test credentials (create an admin first)
Email: test@example.com
Password: test123
Role: Traveler
```

## ⚙️ Advanced: FirebaseError Debug

If error persists, add to `src/contexts/AuthContext.tsx`:

```typescript
const signIn = async (email: string, password: string) => {
  try {
    console.log('🔄 Attempting Firebase sign in...');
    console.log('📧 Email:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Sign in successful');
    
    const firebaseUser = userCredential.user;
    // ... rest of code
  } catch (error: any) {
    console.error('❌ Firebase error code:', error.code);
    console.error('❌ Firebase error message:', error.message);
    console.error('❌ Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
};
```

## 🚨 Still Not Working?

1. Check Firebase Console → Project Settings → General
   - Verify your app is registered
   - Check API keys are correct

2. Test Backend Separately:
   ```bash
   cd backend
   .\venv\Scripts\uvicorn.exe main:app --host 0.0.0.0 --port 8000
   # Visit http://localhost:8000/docs
   ```

3. Create a fresh test account:
   ```bash
   node scripts/create-admin.js test@example.com test123
   ```

## 📞 Need More Help?

Check logs in:
- Expo terminal output
- Chrome DevTools (if using Expo web)
- Android Logcat: `adb logcat`
- iOS logs: Check Xcode console
