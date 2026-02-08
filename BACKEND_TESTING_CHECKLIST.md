# Backend Testing Checklist

## ✅ **Authentication Tests**
- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Email verification
- [ ] Sign out

## ✅ **Firestore Tests**

### **Travelers**
- [ ] Create traveler profile
- [ ] Read traveler profile
- [ ] Update traveler profile with photo
- [ ] Delete traveler profile

### **Partners**
- [ ] Create partner profile
- [ ] Read partner profile  
- [ ] Update partner profile (logo, documents)
- [ ] Admin approve/reject partner

### **Listings**
- [ ] Create listing with images
- [ ] Read single listing
- [ ] Read all listings
- [ ] Search listings (by location, category, price)
- [ ] Filter listings
- [ ] Sort listings
- [ ] Update listing
- [ ] Delete listing

### **Bookings**
- [ ] Create booking
- [ ] Get user bookings (filtered by status)
- [ ] Get partner bookings
- [ ] Update booking status (confirm, reject, complete)
- [ ] Cancel booking

### **Favorites**
- [ ] Add to favorites
- [ ] Remove from favorites
- [ ] Check if favorited
- [ ] Get user favorites

## ✅ **Storage Tests**
- [ ] Upload traveler profile photo
- [ ] Upload partner logo
- [ ] Upload partner documents
- [ ] Upload listing images (multiple)
- [ ] Delete images

## ✅ **Security Tests**
- [ ] Unauthenticated users can't create data
- [ ] Users can only modify their own data
- [ ] Only admins can approve partners
- [ ] Firestore rules work correctly

## 🐛 **Common Issues to Check**

### **When testing search:**
```
Error: The query requires an index
```
**Solution:** Deploy firestore indexes or click the link in error to auto-create

### **When uploading images:**
```
Error: Storage permission denied
```
**Solution:** Deploy storage rules and ensure user is authenticated

### **When creating bookings:**
```
Error: Missing or insufficient permissions
```
**Solution:** Deploy firestore rules

## 📝 **How to Test**

### **Option 1: Use the Mobile App**
1. Run `npx expo start`
2. Test each feature manually in the app
3. Check Firebase Console to verify data is saved

### **Option 2: Use Firebase Console**
1. Go to https://console.firebase.google.com
2. Select your project: skyconnectsl-13e92
3. Navigate to Firestore Database
4. Manually create test documents
5. Verify rules are working

### **Option 3: Write Automated Tests** (Future)
```typescript
// Example test for firestoreService
import { createListing } from './src/services/firestoreService';

test('Create listing', async () => {
  const listing = await createListing({
    title: 'Test Listing',
    partnerId: 'test123',
    // ... other fields
  });
  
  expect(listing.id).toBeDefined();
});
```

## ⚠️ **Important Notes**

1. **Always test with real Firebase project** (not emulators for now)
2. **Check Firebase Console** after each operation to verify data
3. **Look for console errors** in Expo dev tools
4. **Test on both Android and iOS** if possible
5. **Test with different user roles** (traveler, partner, admin)

## 🔍 **Debugging Tips**

```typescript
// Add console logs in firestoreService.ts
export const createListing = async (data: any) => {
  console.log('Creating listing with data:', data);
  const docRef = await addDoc(collection(db, 'listings'), data);
  console.log('Listing created with ID:', docRef.id);
  return docRef;
};
```

Check Firebase Console > Firestore Database > listings collection to see if data appears.
