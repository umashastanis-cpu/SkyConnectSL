# 🧪 SkyConnect SL - Complete Testing Guide

## Quick Start Testing (5 Minutes)

### Step 1: Start the Server
```bash
cd website
npm run dev
```
✅ Server should start at http://localhost:3000

### Step 2: Create Your First Traveler Account
1. Open http://localhost:3000
2. Click "Get Started" button
3. Click "Sign Up"
4. Fill in:
   - Email: `test-traveler@example.com`
   - Password: `test123`
   - Confirm Password: `test123`
5. Click the "Traveler" card (with ✈️ icon)
6. Click "Create Account"
7. You'll see "Verify Your Email" page

### Step 3: Verify Email
Since this is testing, you have two options:

**Option A: Check your actual email**
- Check the email inbox for verification link
- Click the link
- Return to website and click "I've Verified My Email"

**Option B: Manual verification (for testing)**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Open your project: `skyconnectsl-13e92`
3. Go to Authentication → Users
4. Find your test user
5. Click the ⋮ menu → "Enable user"
6. Return to website and click "I've Verified My Email"

### Step 4: Create Traveler Profile
You'll be redirected to profile creation:
1. Full Name: `Test Traveler`
2. Country: `United States`
3. Select interests (click at least one):
   - Click 🏛️ Cultural Sites
   - Click 🌿 Nature & Wildlife
4. Adjust budget sliders:
   - Min: $50
   - Max: $500
5. Click "Create Profile & Continue"

### Step 5: Explore Traveler Dashboard
You should now see:
- ✅ Welcome message with your name
- ✅ Quick stats (destinations, budget, interests)
- ✅ Quick action buttons
- ✅ Recommended destinations

Click "Browse Listings" to see available experiences!

---

## Complete Feature Testing Checklist

### ✅ Authentication Tests

**Signup:**
- [ ] Can create traveler account
- [ ] Can create partner account
- [ ] Password validation (min 6 chars)
- [ ] Password matching validation
- [ ] Email format validation
- [ ] Duplicate email error handling

**Login:**
- [ ] Can login with correct credentials
- [ ] Error shown for wrong password
- [ ] Error shown for non-existent email
- [ ] Redirect to dashboard after login

**Email Verification:**
- [ ] Verification email sent
- [ ] Can resend verification email
- [ ] Cannot access dashboard without verification
- [ ] "I've Verified My Email" button works
- [ ] Auto-redirect after verification

**Sign Out:**
- [ ] Sign out button in user menu
- [ ] Redirects to homepage after signout
- [ ] Cannot access protected pages after signout

---

### ✅ Traveler Feature Tests

**Profile Creation:**
- [ ] Name field required
- [ ] Country field required
- [ ] Must select at least one interest
- [ ] Budget sliders work correctly
- [ ] Profile saves to database
- [ ] Redirects to home after creation

**Traveler Dashboard:**
- [ ] Shows personalized welcome with name
- [ ] Displays budget range correctly
- [ ] Shows selected interests count
- [ ] Quick action buttons navigate correctly
- [ ] Recommended destinations shown

**Browse Listings:**
- [ ] All active listings displayed
- [ ] Search bar filters by title/description
- [ ] Category filter works (Tour, Accommodation, etc.)
- [ ] Location filter works
- [ ] Price range slider filters correctly
- [ ] Shows listing count
- [ ] Listing cards display correctly

**Navigation:**
- [ ] Navbar shows "✈️" badge for traveler
- [ ] User menu shows email
- [ ] Dashboard link works
- [ ] Sign out button works

---

### ✅ Partner Feature Tests

**Partner Signup:**
1. Create new account with partner role:
   - Email: `test-partner@example.com`
   - Password: `partner123`
   - Select "Partner" (🏢) role

**Partner Profile Creation:**
- [ ] Business name field required
- [ ] Must select business category
- [ ] Business address required
- [ ] Contact phone required
- [ ] Description required (textarea)
- [ ] Registration number optional
- [ ] "Pending" status shown after creation
- [ ] Cannot create listings until approved

**Partner Dashboard (Pending Status):**
- [ ] Shows "Approval Pending" alert
- [ ] Yellow warning banner visible
- [ ] Stats show 0 listings
- [ ] "Create Listing" button works
- [ ] "My Listings" button works

**Create Listing:**
- [ ] Title field required
- [ ] Must select category
- [ ] Description required
- [ ] Price field required (number)
- [ ] Location required
- [ ] Duration optional
- [ ] Capacity optional
- [ ] Listing saves successfully
- [ ] Redirects to /partner/listings

**Manage Listings Page:**
- [ ] Shows all partner's listings
- [ ] Filter by All/Active/Inactive works
- [ ] Stats count correctly
- [ ] Edit button exists (functionality TBD)
- [ ] Delete button exists (functionality TBD)
- [ ] "Create New Listing" button works

**After Admin Approval:**
- [ ] Dashboard shows "Approved" badge (green)
- [ ] Listings become visible to travelers
- [ ] Can create more listings

---

### ✅ Admin Feature Tests

**Setup Admin Account:**
1. Create a normal account
2. Go to [Firebase Console](https://console.firebase.google.com/)
3. Firestore Database → users collection
4. Find your user document
5. Edit the document:
   - Change `role` field to `"admin"`
6. Save changes
7. Sign out and sign in again

**Admin Dashboard:**
- [ ] Shows "Admin Dashboard 👑" header
- [ ] Pending partners count shown
- [ ] Can see list of pending partners
- [ ] Partner details displayed:
  - Business name
  - Email
  - Phone
  - Category
  - Registration number
  - Address
  - Description

**Partner Approval:**
- [ ] "Approve Partner" button works
- [ ] "Reject" button works
- [ ] Confirmation feedback shown
- [ ] Partner removed from pending list
- [ ] Partner status updated in database

**Verify Approval:**
1. Sign out from admin
2. Sign in as the approved partner
3. Check partner dashboard
4. Should see "Approved" status
5. Create a listing
6. Sign in as traveler
7. Browse listings → Should see partner's listing

---

## Database Verification

### Check Firestore Collections:

**1. users/**
```
Should contain:
- userId (auto-generated)
- email
- role: "traveler" | "partner" | "admin"
- emailVerified: boolean
- createdAt: timestamp
```

**2. travelers/**
```
Should contain:
- userId (same as users collection)
- email
- name
- country
- interests: array of strings
- budgetMin: number
- budgetMax: number
- createdAt: timestamp
- updatedAt: timestamp
```

**3. partners/**
```
Should contain:
- userId
- email
- businessName
- businessCategory
- businessAddress
- contactPhone
- registrationNumber (optional)
- description
- approvalStatus: "pending" | "approved" | "rejected"
- createdAt: timestamp
- updatedAt: timestamp
```

**4. listings/**
```
Should contain:
- id (auto-generated)
- partnerId (matches partner userId)
- title
- description
- category
- price: number
- location
- duration (optional)
- capacity (optional)
- isActive: boolean
- createdAt: timestamp
- updatedAt: timestamp
```

---

## Integration Testing Scenarios

### Scenario 1: End-to-End Traveler Journey
1. ✅ Signup as traveler
2. ✅ Verify email
3. ✅ Create profile with interests
4. ✅ View dashboard
5. ✅ Browse listings
6. ✅ Filter listings by category
7. ✅ Search for specific tour
8. ✅ Sign out
9. ✅ Sign back in
10. ✅ Should land on dashboard directly

### Scenario 2: Partner Approval Workflow
1. ✅ Signup as partner
2. ✅ Create business profile
3. ✅ See "Pending" status
4. ✅ Create a listing
5. ✅ Listing not visible to travelers
6. ✅ Admin approves partner
7. ✅ Partner refreshes → sees "Approved"
8. ✅ Traveler can now see the listing

### Scenario 3: Multi-Device Testing
1. ✅ Create account on desktop
2. ✅ Open http://192.168.8.112:3000 on phone
3. ✅ Login with same credentials
4. ✅ Should see same data
5. ✅ Create listing on desktop
6. ✅ Refresh on phone → listing appears

---

## Error Handling Tests

**Test Invalid Inputs:**
- [ ] Signup with existing email → Error shown
- [ ] Login with wrong password → Error shown
- [ ] Create profile without required fields → Validation error
- [ ] Submit form without category selection → Error shown
- [ ] Price field with negative number → Validation

**Test Edge Cases:**
- [ ] Very long business description (500+ chars)
- [ ] Special characters in name field
- [ ] International phone number formats
- [ ] Emoji in description 😀
- [ ] Budget slider at extremes (0 and 1000)

---

## Performance Tests

**Page Load Times:**
- [ ] Homepage loads < 2 seconds
- [ ] Dashboard loads < 3 seconds
- [ ] Listings page loads < 3 seconds
- [ ] No console errors

**Data Operations:**
- [ ] Profile creation < 2 seconds
- [ ] Login response < 2 seconds
- [ ] Listing creation < 2 seconds
- [ ] Admin approval action < 2 seconds

---

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Accessibility Tests

- [ ] All buttons keyboard accessible
- [ ] Form inputs have proper labels
- [ ] Color contrast meets standards
- [ ] Mobile tap targets > 44px
- [ ] Works without JavaScript? (Progressive enhancement)

---

## Security Tests

**Authentication:**
- [ ] Cannot access /traveler/home without login
- [ ] Cannot access /partner/home without login
- [ ] Cannot access /admin/dashboard without admin role
- [ ] Email verification required before dashboard
- [ ] Password not visible in network tab

**Authorization:**
- [ ] Traveler cannot access /partner/* pages
- [ ] Partner cannot access /traveler/* pages
- [ ] Non-admin cannot access /admin/*
- [ ] Users can only see their own data

---

## Bug Reporting Template

If you find issues, document them like this:

```
**Bug Title:** [Short description]

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. Enter...
4. Submit...

**Expected Result:**
Should do X

**Actual Result:**
Does Y instead

**Screenshots:**
[Attach if possible]

**Browser:**
Chrome 120 / Windows 11

**Console Errors:**
[Copy any red errors from browser console]
```

---

## Test Data Suggestions

**Traveler Accounts:**
```
Email: alice@example.com
Password: traveler123
Role: Traveler
Country: USA
Interests: Cultural, Nature
Budget: $100-$300
```

**Partner Accounts:**
```
Email: lanka-tours@example.com
Password: partner123
Role: Partner
Business: Lanka Adventure Tours
Category: Tour Operator
Phone: +94 77 123 4567
```

**Sample Listings:**
```
Title: "Sigiriya Rock Fortress Day Tour"
Category: Tour
Price: 75
Location: Sigiriya
Duration: 8 hours
Capacity: 10
Description: "Climb the ancient rock fortress..."
```

---

## Success Criteria ✅

Your web app is working perfectly if:

1. ✅ Users can signup and login
2. ✅ Email verification works
3. ✅ Travelers can create profiles
4. ✅ Partners can create profiles
5. ✅ Admin can approve partners
6. ✅ Partners can create listings
7. ✅ Travelers can browse listings
8. ✅ Filters and search work
9. ✅ Navigation changes based on user role
10. ✅ Data syncs with Firebase
11. ✅ No console errors
12. ✅ Mobile responsive

---

## Need Help?

**Check Browser Console:**
- Press `F12` → Console tab
- Look for red errors
- Copy error message

**Check Network Tab:**
- F12 → Network tab
- Look for failed requests (red)
- Check if Firebase calls are succeeding

**Verify Firebase:**
- Check Firestore for data
- Check Authentication for users
- Verify security rules are active

---

**Happy Testing!** 🚀

If everything works, you're ready to deploy! 🎉
