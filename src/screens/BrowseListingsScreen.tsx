import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { getApprovedListings } from '../services/firestoreService';

type Category = 'all' | 'tour' | 'hotel' | 'transport';

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
  createdAt: any;
  partnerId: string;
}

export default function BrowseListingsScreen({ navigation }: any) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchQuery, selectedCategory]);

  const loadListings = async () => {
    try {
      const data = await getApprovedListings();
      setListings(data);
    } catch (error: any) {
      console.error('Error loading listings:', error);
      Alert.alert('Error', 'Failed to load listings: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(listing => listing.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.location.toLowerCase().includes(query)
      );
    }

    setFilteredListings(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadListings();
  };

  const renderCategoryButton = (category: Category, label: string) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === category && styles.categoryButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'tour':
        return styles.tourBadge;
      case 'hotel':
        return styles.hotelBadge;
      case 'transport':
        return styles.transportBadge;
      default:
        return styles.tourBadge;
    }
  };

  const renderListingCard = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
    >
      {/* Image or Placeholder */}
      {item.images && item.images.length > 0 ? (
        <Image
          source={{ uri: item.images[0] }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.cardImagePlaceholder, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.placeholderEmoji}>{getCategoryEmoji(item.category)}</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={[styles.categoryBadge, getCategoryBadgeStyle(item.category)]}>
            <Text style={styles.categoryBadgeText}>{item.category.toUpperCase()}</Text>
          </View>
        </View>
        
        <Text style={styles.cardLocation}>📍 {item.location}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>LKR {item.price.toLocaleString()}</Text>
          {item.duration && (
            <Text style={styles.cardDuration}>⏱️ {item.duration}</Text>
          )}
        </View>
        
        {item.amenities && item.amenities.length > 0 && (
          <View style={styles.amenitiesContainer}>
            {item.amenities.slice(0, 3).map((amenity, index) => (
              <View key={index} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
            {item.amenities.length > 3 && (
              <Text style={styles.moreAmenities}>+{item.amenities.length - 3} more</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'tour': return '🗺️';
      case 'hotel':
      case 'accommodation': return '🏨';
      case 'transport': return '🚗';
      default: return '📍';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tour': return '#E3F2FD';
      case 'hotel':
      case 'accommodation': return '#F3E5F5';
      case 'transport': return '#E8F5E9';
      default: return '#F5F5F5';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading listings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, location, or description..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        {renderCategoryButton('all', 'All')}
        {renderCategoryButton('tour', 'Tours')}
        {renderCategoryButton('hotel', 'Hotels')}
        {renderCategoryButton('transport', 'Transport')}
      </View>

      {/* Results Count */}
      <Text style={styles.resultsCount}>
        {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
      </Text>

      {/* Listings List */}
      <FlatList
        data={filteredListings}
        renderItem={renderListingCard}
        keyExtractor={(item, index) => item.id || `listing-${index}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory !== 'all'
                ? 'No listings match your filters'
                : 'No approved listings yet'}
            </Text>
            {(searchQuery || selectedCategory !== 'all') && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#FFF',
  },
  resultsCount: {
    padding: 15,
    fontSize: 14,
    color: '#666',
    backgroundColor: '#FFF',
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 60,
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tourBadge: {
    backgroundColor: '#E3F2FD',
  },
  hotelBadge: {
    backgroundColor: '#F3E5F5',
  },
  transportBadge: {
    backgroundColor: '#E8F5E9',
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  cardLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  cardDuration: {
    fontSize: 14,
    color: '#666',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  amenityTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  amenityText: {
    fontSize: 12,
    color: '#666',
  },
  moreAmenities: {
    fontSize: 12,
    color: '#007AFF',
    alignSelf: 'center',
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  clearButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
