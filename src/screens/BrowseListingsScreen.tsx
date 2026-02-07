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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchListings, getListingsByCategory, getApprovedListings } from '../services/firestoreService';
import { ListingCategory } from '../types';

type Category = 'all' | ListingCategory;
type SortOption = 'newest' | 'price-low' | 'price-high';

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
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    filterAndSortListings();
  }, [listings, searchQuery, selectedCategory, minPrice, maxPrice, locationFilter, sortBy]);

  const loadListings = async () => {
    try {
      // Use search function if filters are active, otherwise get all
      if (searchQuery || selectedCategory !== 'all' || minPrice || maxPrice || locationFilter) {
        const data = await searchListings(
          searchQuery || undefined,
          selectedCategory !== 'all' ? selectedCategory as ListingCategory : undefined,
          minPrice ? parseFloat(minPrice) : undefined,
          maxPrice ? parseFloat(maxPrice) : undefined,
          locationFilter || undefined
        );
        setListings(data);
      } else {
        const data = await getApprovedListings();
        setListings(data);
      }
    } catch (error: any) {
      console.error('Error loading listings:', error);
      Alert.alert('Error', 'Failed to load listings: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterAndSortListings = () => {
    let filtered = [...listings];

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        break;
    }

    setFilteredListings(filtered);
  };

  const applyFilters = async () => {
    setLoading(true);
    await loadListings();
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setLocationFilter('');
    setSortBy('newest');
  };

  const hasActiveFilters = () => {
    return searchQuery || selectedCategory !== 'all' || minPrice || maxPrice || locationFilter;
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

      {/* Filter Toggle Button */}
      <TouchableOpacity
        style={styles.filterToggle}
        onPress={() => setShowFilters(!showFilters)}
      >
        <View style={styles.filterToggleContent}>
          <Ionicons name="options-outline" size={20} color="#007AFF" />
          <Text style={styles.filterToggleText}>Filters & Sort</Text>
          {hasActiveFilters() && <View style={styles.activeFilterDot} />}
        </View>
        <Ionicons
          name={showFilters ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#666"
        />
      </TouchableOpacity>

      {/* Expandable Filter Section */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Category Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {renderCategoryButton('all', 'All')}
                {renderCategoryButton('tour', 'Tours')}
                {renderCategoryButton('accommodation', 'Hotels')}
                {renderCategoryButton('transport', 'Transport')}
                {renderCategoryButton('activity', 'Activities')}
              </View>
            </ScrollView>
          </View>

          {/* Price Range Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Price Range (LKR)</Text>
            <View style={styles.priceRangeContainer}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              <Text style={styles.priceSeparator}>-</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Location Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Location</Text>
            <TextInput
              style={styles.locationInput}
              placeholder="e.g., Colombo, Galle, Kandy"
              value={locationFilter}
              onChangeText={setLocationFilter}
              placeholderTextColor="#999"
            />
          </View>

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.sortContainer}>
              <TouchableOpacity
                style={[styles.sortButton, sortBy === 'newest' && styles.sortButtonActive]}
                onPress={() => setSortBy('newest')}
              >
                <Text style={[styles.sortButtonText, sortBy === 'newest' && styles.sortButtonTextActive]}>
                  Newest
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, sortBy === 'price-low' && styles.sortButtonActive]}
                onPress={() => setSortBy('price-low')}
              >
                <Text style={[styles.sortButtonText, sortBy === 'price-low' && styles.sortButtonTextActive]}>
                  Price: Low to High
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, sortBy === 'price-high' && styles.sortButtonActive]}
                onPress={() => setSortBy('price-high')}
              >
                <Text style={[styles.sortButtonText, sortBy === 'price-high' && styles.sortButtonTextActive]}>
                  Price: High to Low
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Action Buttons */}
          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={clearAllFilters}
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={applyFilters}
            >
              <Text style={styles.applyFiltersText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters() && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterChipsContainer}
        >
          {selectedCategory !== 'all' && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>{selectedCategory}</Text>
              <TouchableOpacity onPress={() => setSelectedCategory('all')}>
                <Ionicons name="close-circle" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          {minPrice && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Min: LKR {minPrice}</Text>
              <TouchableOpacity onPress={() => setMinPrice('')}>
                <Ionicons name="close-circle" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          {maxPrice && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Max: LKR {maxPrice}</Text>
              <TouchableOpacity onPress={() => setMaxPrice('')}>
                <Ionicons name="close-circle" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          {locationFilter && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>{locationFilter}</Text>
              <TouchableOpacity onPress={() => setLocationFilter('')}>
                <Ionicons name="close-circle" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

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
            {hasActiveFilters() && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearAllFilters}
              >
                <Text style={styles.clearButtonText}>Clear All Filters</Text>
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
  filterToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  activeFilterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  filtersContainer: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterSection: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  priceSeparator: {
    fontSize: 16,
    color: '#666',
  },
  locationInput: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  sortContainer: {
    gap: 8,
  },
  sortButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  clearFiltersButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  clearFiltersText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  applyFiltersButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  applyFiltersText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterChipsContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
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
