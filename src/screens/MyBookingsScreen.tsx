import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { getUserBookings, cancelBooking } from '../services/firestoreService';

interface Booking {
  id: string;
  listingTitle: string;
  listingCategory: string;
  partnerName: string;
  startDate: Date;
  endDate: Date;
  numberOfPeople: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests?: string;
  createdAt: Date;
}

export default function MyBookingsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [user])
  );

  const loadBookings = async () => {
    if (!user) return;

    try {
      const data = await getUserBookings(user.uid);
      setBookings(data as Booking[]);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleCancelBooking = (bookingId: string, bookingTitle: string) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel "${bookingTitle}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(bookingId);
              Alert.alert('Success', 'Booking cancelled successfully');
              loadBookings();
            } catch (error) {
              console.error('Error cancelling booking:', error);
              Alert.alert('Error', 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const getFilteredBookings = () => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return bookings.filter(b => 
          new Date(b.startDate) > now && 
          b.status !== 'cancelled' && 
          b.status !== 'completed'
        );
      case 'past':
        return bookings.filter(b => 
          new Date(b.endDate) < now || 
          b.status === 'cancelled' || 
          b.status === 'completed'
        );
      default:
        return bookings;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'cancelled':
        return '#FF3B30';
      case 'completed':
        return '#50C9C3';
      default:
        return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      case 'completed':
        return 'checkmark-done-circle';
      default:
        return 'help-circle';
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const canCancel = item.status === 'pending' || item.status === 'confirmed';
    const isPast = new Date(item.endDate) < new Date();
    
    return (
      <View style={styles.bookingCard}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status)} size={14} color="#FFF" />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>

        {/* Booking Info */}
        <View style={styles.bookingHeader}>
          <View style={styles.bookingTitleRow}>
            <Ionicons 
              name={
                item.listingCategory === 'tour' ? 'navigate-circle' :
                item.listingCategory === 'accommodation' ? 'bed' :
                item.listingCategory === 'transport' ? 'car' : 'star'
              } 
              size={20} 
              color="#50C9C3" 
            />
            <Text style={styles.bookingTitle}>{item.listingTitle}</Text>
          </View>
          <Text style={styles.bookingCategory}>{item.listingCategory}</Text>
        </View>

        <View style={styles.bookingDetails}>
          {/* Dates */}
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
            </Text>
          </View>

          {/* People */}
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.numberOfPeople} {item.numberOfPeople === 1 ? 'person' : 'people'}
            </Text>
          </View>

          {/* Partner */}
          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.partnerName}</Text>
          </View>

          {/* Price */}
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.priceText}>${item.totalPrice.toFixed(2)}</Text>
          </View>

          {/* Payment Status */}
          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={16} color="#666" />
            <Text style={[
              styles.paymentStatus,
              { color: item.paymentStatus === 'paid' ? '#34C759' : '#FF9500' }
            ]}>
              Payment: {item.paymentStatus.charAt(0).toUpperCase() + item.paymentStatus.slice(1)}
            </Text>
          </View>
        </View>

        {/* Special Requests */}
        {item.specialRequests && (
          <View style={styles.requestsContainer}>
            <Text style={styles.requestsLabel}>Special Requests:</Text>
            <Text style={styles.requestsText}>{item.specialRequests}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => {
              Alert.alert(
                item.listingTitle,
                `Booking ID: ${item.id}\n\nBooked on: ${new Date(item.createdAt).toLocaleDateString()}\n\nFor any changes or questions, please contact the partner directly.`
              );
            }}
          >
            <Ionicons name="information-circle-outline" size={18} color="#50C9C3" />
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>

          {canCancel && !isPast && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(item.id, item.listingTitle)}
            >
              <Ionicons name="close-circle-outline" size={18} color="#FF3B30" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#50C9C3" />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
            All ({bookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'upcoming' && styles.filterTabActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[styles.filterTabText, filter === 'upcoming' && styles.filterTabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'past' && styles.filterTabActive]}
          onPress={() => setFilter('past')}
        >
          <Text style={[styles.filterTabText, filter === 'past' && styles.filterTabTextActive]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={80} color="#E5E5EA" />
          <Text style={styles.emptyTitle}>No Bookings</Text>
          <Text style={styles.emptyText}>
            {filter === 'all'
              ? "You haven't made any bookings yet."
              : filter === 'upcoming'
              ? 'No upcoming bookings.'
              : 'No past bookings.'}
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('BrowseListings', {})}
          >
            <Text style={styles.browseButtonText}>Browse Listings</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#50C9C3']} />
          }
        />
      )}
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: '#50C9C3',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#FFF',
  },
  listContainer: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  bookingHeader: {
    marginBottom: 12,
  },
  bookingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  bookingCategory: {
    fontSize: 12,
    color: '#666',
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
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#50C9C3',
    marginLeft: 8,
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  requestsContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  requestsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  requestsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#50C9C3',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#50C9C3',
    marginLeft: 6,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B30',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#50C9C3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
