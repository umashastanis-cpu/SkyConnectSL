# 🚀 Quick Fix Guide: Implement Booking System (MVP)

## Time Estimate: 8-12 hours
## Difficulty: Medium
## Priority: P0 (BLOCKER)

---

## 📋 What We're Building

A simple booking flow that allows travelers to:
1. Select dates
2. Choose number of guests
3. Confirm booking
4. See booking confirmation
5. View in "My Bookings"

Partners can:
1. See incoming bookings
2. Accept/reject bookings
3. Mark as completed

---

## 🛠️ Step-by-Step Implementation

### Step 1: Install Date Picker (15 mins)

```bash
npm install react-native-modal-datetime-picker @react-native-community/datetimepicker
```

---

### Step 2: Create BookingModal Component (2 hours)

Create `src/components/BookingModal.tsx`:

```typescript
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface BookingModalProps {
  visible: boolean;
  listing: any;
  onClose: () => void;
  onConfirm: (bookingData: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  listing,
  onClose,
  onConfirm,
}) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000)); // Tomorrow
  const [guests, setGuests] = useState(1);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const calculateTotalPrice = () => {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);
    return listing.price * days * guests;
  };

  const handleConfirm = () => {
    if (startDate >= endDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    if (listing.maxCapacity && guests > listing.maxCapacity) {
      Alert.alert('Error', `Maximum capacity is ${listing.maxCapacity} guests`);
      return;
    }

    const bookingData = {
      listingId: listing.id,
      listingTitle: listing.title,
      partnerId: listing.partnerId,
      partnerName: listing.partnerName,
      startDate,
      endDate,
      numberOfPeople: guests,
      totalPrice: calculateTotalPrice(),
      currency: listing.currency,
      specialRequests: '',
    };

    onConfirm(bookingData);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Book Now</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Listing Info */}
          <View style={styles.listingInfo}>
            <Text style={styles.listingTitle}>{listing.title}</Text>
            <Text style={styles.listingPrice}>
              {listing.currency} {listing.price}/day
            </Text>
          </View>

          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Check-in</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                minimumDate={new Date()}
                onChange={(event, date) => {
                  setShowStartPicker(false);
                  if (date) setStartDate(date);
                }}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Check-out</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
              <Text style={styles.dateText}>
                {endDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                minimumDate={startDate}
                onChange={(event, date) => {
                  setShowEndPicker(false);
                  if (date) setEndDate(date);
                }}
              />
            )}
          </View>

          {/* Guest Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Number of Guests</Text>
            <View style={styles.guestSelector}>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => setGuests(Math.max(1, guests - 1))}
              >
                <Ionicons name="remove" size={20} color="#4A90E2" />
              </TouchableOpacity>
              <Text style={styles.guestCount}>{guests}</Text>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => setGuests(guests + 1)}
              >
                <Ionicons name="add" size={20} color="#4A90E2" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Price Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {listing.currency} {listing.price} x{' '}
                {Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000)} days x {guests} guests
              </Text>
              <Text style={styles.summaryValue}>
                {listing.currency} {calculateTotalPrice()}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {listing.currency} {calculateTotalPrice()}
              </Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirm Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listingInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  listingPrice: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  guestSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  guestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  guestCount: {
    marginHorizontal: 30,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  summary: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

---

### Step 3: Update ListingDetailScreen (30 mins)

Update `src/screens/ListingDetailScreen.tsx`:

```typescript
import { BookingModal } from '../components/BookingModal';
import { createBooking } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';

// Inside component:
const [showBookingModal, setShowBookingModal] = useState(false);
const { user } = useAuth();

const handleBookNow = () => {
  if (!user) {
    Alert.alert('Login Required', 'Please login to make a booking');
    return;
  }
  setShowBookingModal(true);
};

const handleConfirmBooking = async (bookingData: any) => {
  try {
    setShowBookingModal(false);
    
    const bookingId = await createBooking({
      ...bookingData,
      travelerId: user!.uid,
      travelerName: user!.email!, // Replace with actual name from profile
      travelerEmail: user!.email!,
      bookingDate: new Date(),
    });

    Alert.alert(
      'Booking Confirmed! 🎉',
      `Your booking has been confirmed.\nBooking ID: ${bookingId}\n\nPayment: Pay at location`,
      [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]
    );
  } catch (error: any) {
    Alert.alert('Booking Failed', error.message);
  }
};

// In JSX, before closing View:
{listing && (
  <BookingModal
    visible={showBookingModal}
    listing={listing}
    onClose={() => setShowBookingModal(false)}
    onConfirm={handleConfirmBooking}
  />
)}
```

---

### Step 4: Create Traveler Bookings Screen (2 hours)

Create `src/screens/TravelerBookingsScreen.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getTravelerBookings, cancelBooking } from '../services/firestoreService';

export default function TravelerBookingsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      if (user) {
        const data = await getTravelerBookings(user.uid);
        setBookings(data);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancel = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(bookingId);
              loadBookings();
              Alert.alert('Success', 'Booking cancelled');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      case 'completed':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const renderBooking = ({ item }: any) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.listingTitle} numberOfLines={1}>
          {item.listingTitle}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {new Date(item.startDate.toDate()).toLocaleDateString()} -{' '}
            {new Date(item.endDate.toDate()).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.numberOfPeople} guests
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.currency} {item.totalPrice}
          </Text>
        </View>
      </View>

      {item.status === 'pending' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancel(item.id)}
        >
          <Text style={styles.cancelText}>Cancel Booking</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadBookings} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubtext}>
              Start exploring and book your first trip!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    padding: 15,
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  cancelButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
});
```

---

### Step 5: Add Navigation (15 mins)

Update `src/types/index.ts`:

```typescript
export type RootStackParamList = {
  // ... existing routes
  TravelerBookings: undefined;
  PartnerBookings: undefined;
};
```

Update `src/navigation/AppNavigator.tsx`:

```typescript
import TravelerBookingsScreen from '../screens/TravelerBookingsScreen';

// In traveler stack:
<Stack.Screen 
  name="TravelerBookings" 
  component={TravelerBookingsScreen}
  options={{ gestureEnabled: true }}
/>
```

---

### Step 6: Add to TravelerHomeScreen (15 mins)

Update quick actions in `src/screens/TravelerHomeScreen.tsx`:

```typescript
const quickActions = [
  // ... existing actions
  { 
    id: 5, 
    icon: 'calendar-outline', 
    label: 'Bookings', 
    color: '#9B59B6', 
    emoji: '📅', 
    action: () => navigation.navigate('TravelerBookings')
  },
];
```

---

### Step 7: Create Partner Bookings Screen (2 hours)

Follow similar pattern as Traveler Bookings but with:
- Accept/Reject buttons
- Mark as completed
- Filter by status

---

### Step 8: Test Everything (2 hours)

**Test Scenarios:**
1. [ ] Create a booking
2. [ ] View in My Bookings
3. [ ] Cancel a booking
4. [ ] Partner sees booking
5. [ ] Partner accepts booking
6. [ ] Edge cases (invalid dates, etc.)

---

## ✅ Success Criteria

After implementation, you should be able to:

- ✅ Click "Book Now" on any listing
- ✅ Select dates and guests
- ✅ See total price calculation
- ✅ Confirm booking
- ✅ See booking in "My Bookings"
- ✅ Partner sees booking in their dashboard
- ✅ Cancel booking (if pending)
- ✅ Update booking status

---

## 🚨 Common Pitfalls

1. **Date Picker Platform Issues**
   - iOS and Android have different date pickers
   - Test on both platforms

2. **Timestamp Conversion**
   - Firestore uses Timestamp objects
   - Convert to/from Date carefully

3. **Price Calculation**
   - Handle decimal places
   - Consider timezone issues

4. **Status Management**
   - Keep booking status consistent
   - Handle edge cases (cancelled → completed?)

---

## 📦 Quick Copy-Paste Checklist

- [ ] Install packages
- [ ] Create BookingModal.tsx
- [ ] Update ListingDetailScreen
- [ ] Create TravelerBookingsScreen  
- [ ] Update types
- [ ] Update navigation
- [ ] Update TravelerHomeScreen
- [ ] Create PartnerBookingsScreen
- [ ] Test all flows
- [ ] Handle errors gracefully

---

## 🎉 You're Done!

After following these steps, your MVP will have a functional booking system!

**Next Steps:**
1. Add email confirmations (optional)
2. Implement payment gateway (Stripe)
3. Add booking reminders
4. Analytics tracking

**Time to MVP: 8-12 hours of focused work**

Got stuck? Check:
- Firebase Console → Firestore → bookings collection
- Console logs in app
- Network tab for API calls
