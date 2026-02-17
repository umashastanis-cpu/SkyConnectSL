import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getListing } from '../services/firestoreService';

const { width } = Dimensions.get('window');

interface Listing {
  id?: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  duration?: string;
  amenities?: string[];
  images?: string[];
  availability?: {
    startDate: Date | string;
    endDate: Date | string;
  };
  tags?: string[];
  maxGuests?: number;
  partnerId: string;
  status: string;
  createdAt: any;
}

export default function ListingDetailScreen({ route, navigation }: any) {
  const { listingId } = route.params;
  const [listing, setListing] = useState<Listing | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListing();
  }, []);

  const loadListing = async () => {
    try {
      const data = await getListing(listingId);
      if (data) {
        setListing(data);
      } else {
        Alert.alert('Error', 'Listing not found');
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Error loading listing:', error);
      Alert.alert('Error', 'Failed to load listing: ' + error.message);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!listing) return;
    
    navigation.navigate('Booking', { 
      listingId: listing.id || listingId,
      listing: listing
    });
  };

  const handleContactPartner = () => {
    Alert.alert(
      'Coming Soon',
      'Partner contact functionality will be available soon!',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading listing...</Text>
      </View>
    );
  }

  if (!listing) {
    return null;
  }

  const getCategoryIcon = () => {
    switch (listing.category) {
      case 'tour':
        return '🗺️';
      case 'hotel':
        return '🏨';
      case 'transport':
        return '🚗';
      default:
        return '📍';
    }
  };

  const getCategoryColor = () => {
    switch (listing.category) {
      case 'tour':
        return '#007AFF';
      case 'hotel':
        return '#9B59B6';
      case 'transport':
        return '#27AE60';
      default:
        return '#666';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Image Gallery or Placeholder */}
        {listing.images && listing.images.length > 0 ? (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                setCurrentImageIndex(slideIndex);
              }}
              scrollEventThrottle={16}
            >
              {listing.images.map((image: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            
            {listing.images.length > 1 && (
              <View style={styles.pagination}>
                {listing.images.map((_: string, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      currentImageIndex === index && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: getCategoryColor() }]}>
            <Text style={styles.imageEmoji}>{getCategoryIcon()}</Text>
          </View>
        )}

        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{listing.title}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() }]}>
              <Text style={styles.categoryBadgeText}>{listing.category.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color="#666" />
            <Text style={styles.location}>{listing.location}</Text>
          </View>
        </View>

        {/* Price Card */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>LKR {listing.price.toLocaleString()}</Text>
            </View>
            {listing.duration && (
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.duration}>{listing.duration}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Info */}
        <View style={styles.quickInfoSection}>
          {listing.maxGuests && (
            <View style={styles.quickInfoItem}>
              <Ionicons name="people" size={20} color="#007AFF" />
              <Text style={styles.quickInfoText}>Max {listing.maxGuests} guests</Text>
            </View>
          )}
          {listing.availability && (
            <View style={styles.quickInfoItem}>
              <Ionicons name="calendar" size={20} color="#007AFF" />
              <Text style={styles.quickInfoText}>
                {typeof listing.availability.startDate === 'string' 
                  ? listing.availability.startDate 
                  : listing.availability.startDate.toLocaleDateString()} - {typeof listing.availability.endDate === 'string' 
                  ? listing.availability.endDate 
                  : listing.availability.endDate.toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>

        {/* Amenities */}
        {listing.amenities && listing.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            <View style={styles.amenitiesList}>
              {listing.amenities.map((amenity: string, index: number) => (
                <View key={index} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {listing.tags.map((tag: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Listed on:</Text>
            <Text style={styles.infoValue}>
              {listing.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <View style={[styles.statusBadge, styles.approvedBadge]}>
              <Text style={styles.statusText}>{listing.status}</Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing for fixed buttons */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactPartner}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
          <Text style={styles.contactButtonText}>Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    zIndex: 10,
  },
  imageCarousel: {
    width,
    height: 300,
  },
  image: {
    width,
    height: 300,
  },
  imagePlaceholder: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#FFF',
    width: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  imageEmoji: {
    fontSize: 80,
  },
  titleSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  priceCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  duration: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
    fontWeight: '600',
  },
  quickInfoSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  amenitiesList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  amenityText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvedBadge: {
    backgroundColor: '#D4EDDA',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#155724',
    textTransform: 'capitalize',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#FFF',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginLeft: 8,
  },
  bookButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#007AFF',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 8,
  },
});
