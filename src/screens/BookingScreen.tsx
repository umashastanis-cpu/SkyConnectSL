import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { createBooking, getListing } from '../services/firestoreService';

interface Listing {
  id?: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  duration?: string;
  maxGuests?: number;
  partnerId: string;
  partnerName?: string;
}

export default function BookingScreen({ route, navigation }: any) {
  const { listingId } = route.params;
  const { user } = useAuth();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Booking details
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000)); // +1 day
  const [numberOfPeople, setNumberOfPeople] = useState('1');
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Date picker state
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    loadListing();
  }, []);

  const loadListing = async () => {
    try {
      const data = await getListing(listingId);
      setListing(data as Listing);
    } catch (error) {
      console.error('Error loading listing:', error);
      Alert.alert('Error', 'Failed to load listing details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!listing) return 0;
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const guests = parseInt(numberOfPeople) || 1;
    
    // Simple calculation: base price × nights × guests (adjust logic as needed)
    if (listing.category === 'accommodation') {
      return listing.price * nights;
    } else {
      // For tours/activities, price per person
      return listing.price * guests;
    }
  };

  const handleCreateBooking = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to make a booking');
      return;
    }

    const guests = parseInt(numberOfPeople);
    if (isNaN(guests) || guests < 1) {
      Alert.alert('Invalid Input', 'Please enter a valid number of people');
      return;
    }

    if (listing?.maxGuests && guests > listing.maxGuests) {
      Alert.alert('Invalid Input', `Maximum ${listing.maxGuests} guests allowed`);
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Invalid Dates', 'End date must be after start date');
      return;
    }

    setSubmitting(true);
    try {
      const bookingData = {
        listingId: listingId,
        listingTitle: listing?.title || '',
        listingCategory: listing?.category || '',
        travelerId: user.uid,
        travelerName: user.email || 'Guest',
        partnerId: listing?.partnerId || '',
        partnerName: listing?.partnerName || 'Partner',
        bookingDate: new Date(),
        startDate: startDate,
        endDate: endDate,
        numberOfPeople: guests,
        totalPrice: calculateTotalPrice(),
        specialRequests: specialRequests.trim(),
      };

      const bookingId = await createBooking(bookingData);

      Alert.alert(
        'Booking Submitted!',
        'Your booking request has been sent to the partner. You will receive confirmation soon.',
        [
          {
            text: 'View My Bookings',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'TravelerHome' }],
              });
              setTimeout(() => {
                navigation.navigate('MyBookings');
              }, 100);
            },
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      // Auto-adjust end date if needed
      if (selectedDate >= endDate) {
        setEndDate(new Date(selectedDate.getTime() + 86400000));
      }
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#50C9C3" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Listing not found</Text>
      </View>
    );
  }

  const totalPrice = calculateTotalPrice();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Booking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Listing Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          <View style={styles.listingCard}>
            <Text style={styles.listingTitle}>{listing.title}</Text>
            <Text style={styles.listingDetail}>
              <Ionicons name="location-outline" size={14} color="#666" /> {listing.location}
            </Text>
            <Text style={styles.listingDetail}>
              <Ionicons name="pricetag-outline" size={14} color="#666" /> ${listing.price}
              {listing.category === 'accommodation' ? '/night' : '/person'}
            </Text>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Dates</Text>
          
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <View style={styles.dateButtonContent}>
              <Ionicons name="calendar-outline" size={20} color="#50C9C3" />
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <Text style={styles.dateValue}>{startDate.toLocaleDateString()}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <View style={styles.dateButtonContent}>
              <Ionicons name="calendar-outline" size={20} color="#50C9C3" />
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>End Date</Text>
                <Text style={styles.dateValue}>{endDate.toLocaleDateString()}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onStartDateChange}
              minimumDate={new Date()}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onEndDateChange}
              minimumDate={startDate}
            />
          )}
        </View>

        {/* Guest Count */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of People</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="people-outline" size={20} color="#50C9C3" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={numberOfPeople}
              onChangeText={setNumberOfPeople}
              keyboardType="number-pad"
              placeholder="Enter number of people"
              maxLength={3}
            />
          </View>
          {listing.maxGuests && (
            <Text style={styles.helperText}>Maximum: {listing.maxGuests} guests</Text>
          )}
        </View>

        {/* Special Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
          <TextInput
            style={styles.textArea}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            placeholder="Any special requests or requirements?"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                ${listing.price} × {listing.category === 'accommodation' 
                  ? `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} nights`
                  : `${numberOfPeople} people`
                }
              </Text>
              <Text style={styles.priceValue}>${totalPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Notice */}
        <View style={styles.noticeCard}>
          <Ionicons name="information-circle-outline" size={24} color="#FF9500" />
          <Text style={styles.noticeText}>
            Payment will be processed after the partner confirms your booking. 
            You will be notified via email.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <View style={styles.priceBottomRow}>
          <View>
            <Text style={styles.bottomPriceLabel}>Total Price</Text>
            <Text style={styles.bottomPriceValue}>${totalPrice.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.bookButton, submitting && styles.bookButtonDisabled]}
            onPress={handleCreateBooking}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.bookButtonText}>Confirm Booking</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  listingCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  listingDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateTextContainer: {
    marginLeft: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  textArea: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
  },
  priceCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#50C9C3',
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8F0',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    lineHeight: 20,
  },
  bottomContainer: {
    backgroundColor: '#FFF',
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  priceBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomPriceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bottomPriceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#50C9C3',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
