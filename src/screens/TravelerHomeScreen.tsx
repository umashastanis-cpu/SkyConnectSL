import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getTravelerProfile } from '../services/firestoreService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useNavigation } from '@react-navigation/native';

interface TravelerProfile {
  name: string;
  preferences: string[];
  budgetMin: number;
  budgetMax: number;
  travelType: string;
}

const TravelerHomeScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<TravelerProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (user?.uid) {
      const data = await getTravelerProfile(user.uid);
      if (data) {
        setProfile(data as unknown as TravelerProfile);
      }
    }
  };

  const firstName = profile?.name?.split(' ')[0] || 'Traveler';

  const featuredDestinations = [
    { id: 1, name: 'Maldives', emoji: '🏝️', price: '$1,200', image: '🌊' },
    { id: 2, name: 'Dubai', emoji: '🏙️', price: '$850', image: '✨' },
    { id: 3, name: 'Switzerland', emoji: '🏔️', price: '$1,500', image: '🎿' },
    { id: 4, name: 'Bali', emoji: '🌴', price: '$600', image: '🌺' },
  ];

  const quickActions = [
    { id: 1, icon: 'compass-outline', label: 'Explore', color: '#4A90E2', emoji: '🧭', action: () => navigation.navigate('BrowseListings', {}) },
    { id: 2, icon: 'airplane-outline', label: 'Tours', color: '#50C9C3', emoji: '✈️', action: () => navigation.navigate('BrowseListings', {}) },
    { id: 3, icon: 'business-outline', label: 'Hotels', color: '#9B59B6', emoji: '🏨', action: () => navigation.navigate('BrowseListings', {}) },
    { id: 4, icon: 'briefcase-outline', label: 'Transport', color: '#E74C3C', emoji: '🚗', action: () => navigation.navigate('BrowseListings', {}) },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Gradient (Blue → Teal) */}
      <LinearGradient
        colors={['#4A90E2', '#50C9C3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}, {firstName} 👋</Text>
            <Text style={styles.subGreeting}>Where do you want to go today?</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileAvatar}
            onPress={() => navigation.navigate('EditTravelerProfile')}
          >
            <Ionicons name="person-circle" size={48} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Floating Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Search destinations, hotels, trips..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions - 2×2 Grid */}
        <View style={styles.quickActionsSection}>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity 
                key={action.id} 
                style={styles.quickActionCard}
                onPress={action.action}
              >
                <View style={styles.quickActionIconContainer}>
                  <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Assistant Card (Purple Gradient) */}
        <TouchableOpacity style={styles.aiCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiCardGradient}
          >
            <View style={styles.aiCardContent}>
              <View style={styles.aiCardLeft}>
                <Text style={styles.aiCardEmoji}>🤖</Text>
                <View style={styles.aiCardText}>
                  <Text style={styles.aiCardTitle}>Ask SkyAI</Text>
                  <Text style={styles.aiCardSubtitle}>Plan trips instantly with AI</Text>
                </View>
              </View>
              <Ionicons name="chatbubble-ellipses-outline" size={28} color="#FFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Featured Destinations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Destinations</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.destinationsScroll}>
            {featuredDestinations.map((dest) => (
              <TouchableOpacity key={dest.id} style={styles.destinationCard}>
                <View style={styles.destinationImagePlaceholder}>
                  <Text style={styles.destinationImageEmoji}>{dest.image}</Text>
                </View>
                <View style={styles.destinationInfo}>
                  <Text style={styles.destinationName}>
                    {dest.emoji} {dest.name}
                  </Text>
                  <Text style={styles.destinationPrice}>From {dest.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Your Preferences (Chips) */}
        {profile?.preferences && profile.preferences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.preferencesTitle}>Your Preferences:</Text>
            <View style={styles.preferencesChips}>
              {profile.preferences.map((pref, index) => {
                const emojiMap: { [key: string]: string } = {
                  Beach: '🏖',
                  Adventure: '🧗',
                  Culture: '🏛️',
                  Food: '🍜',
                  Nature: '🌿',
                  City: '🏙️',
                  Solo: '👤',
                  Couple: '💑',
                  Family: '👨‍👩‍👧',
                  Group: '👥',
                };
                const emoji = emojiMap[pref] || '✨';
                return (
                  <TouchableOpacity key={index} style={styles.preferenceChip}>
                    <Text style={styles.preferenceChipText}>
                      {emoji} {pref}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Personalized Recommendations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
          </View>
          <Text style={styles.recommendationSubtitle}>
            Based on your interests
          </Text>

          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationEmoji}>🎯</Text>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Adventure Trip – Ella</Text>
              <View style={styles.recommendationTags}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Adventure</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Nature</Text>
                </View>
              </View>
              <Text style={styles.budgetLabel}>
                ${profile?.budgetMin || 100} - ${profile?.budgetMax || 500}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Sign Out Button (Dev) */}
      <TouchableOpacity style={styles.devLogoutButton} onPress={signOut}>
        <Ionicons name="log-out-outline" size={16} color="#666" />
        <Text style={styles.devLogoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    height: 170,
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
  },
  subGreeting: {
    fontSize: 15,
    color: '#FFF',
    opacity: 0.95,
  },
  profileAvatar: {
    marginLeft: 12,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginTop: -24,
    marginBottom: 8,
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  quickActionsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionEmoji: {
    fontSize: 32,
  },
  quickActionLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  aiCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  aiCardGradient: {
    padding: 22,
  },
  aiCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiCardEmoji: {
    fontSize: 44,
    marginRight: 16,
  },
  aiCardText: {
    flex: 1,
  },
  aiCardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  aiCardSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.95,
  },
  destinationsScroll: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  destinationCard: {
    width: 180,
    marginRight: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  destinationImagePlaceholder: {
    height: 120,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationImageEmoji: {
    fontSize: 50,
  },
  destinationInfo: {
    padding: 12,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  destinationPrice: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  preferencesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  preferencesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  preferenceChip: {
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D0E8F0',
  },
  preferenceChipText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  recommendationSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  recommendationCard: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  recommendationEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  recommendationTags: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
  },
  budgetLabel: {
    fontSize: 14,
    color: '#50C9C3',
    fontWeight: '700',
  },
  devLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F0F0F0',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  devLogoutText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default TravelerHomeScreen;
