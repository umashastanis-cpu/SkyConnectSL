import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, PartnerProfile, Listing } from '../types';
import { useNavigation } from '@react-navigation/native';
import {
  getPendingPartners,
  getPendingListings,
  approvePartner,
  rejectPartner,
  approveListing,
  rejectListing,
} from '../services/firestoreService';

type AdminDashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AdminDashboard'
>;

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const { user, signOut } = useAuth();

  const [pendingPartners, setPendingPartners] = useState<PartnerProfile[]>([]);
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'partners' | 'listings'>('partners');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [partners, listings] = await Promise.all([
        getPendingPartners(),
        getPendingListings(),
      ]);
      setPendingPartners(partners);
      setPendingListings(listings);
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load pending items');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleApprovePartner = async (userId: string, companyName: string) => {
    Alert.alert(
      'Approve Partner',
      `Approve "${companyName}" as a partner?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await approvePartner(userId, user!.uid);
              setPendingPartners(pendingPartners.filter((p) => p.userId !== userId));
              Alert.alert('Success', 'Partner approved!');
            } catch (error) {
              console.error('Error approving partner:', error);
              Alert.alert('Error', 'Failed to approve partner');
            }
          },
        },
      ]
    );
  };

  const handleRejectPartner = async (userId: string, companyName: string) => {
    Alert.alert(
      'Reject Partner',
      `Reject "${companyName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectPartner(userId);
              setPendingPartners(pendingPartners.filter((p) => p.userId !== userId));
              Alert.alert('Success', 'Partner rejected');
            } catch (error) {
              console.error('Error rejecting partner:', error);
              Alert.alert('Error', 'Failed to reject partner');
            }
          },
        },
      ]
    );
  };

  const handleApproveListing = async (listingId: string, title: string) => {
    Alert.alert(
      'Approve Listing',
      `Approve "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await approveListing(listingId);
              setPendingListings(pendingListings.filter((l) => l.id !== listingId));
              Alert.alert('Success', 'Listing approved!');
            } catch (error) {
              console.error('Error approving listing:', error);
              Alert.alert('Error', 'Failed to approve listing');
            }
          },
        },
      ]
    );
  };

  const handleRejectListing = async (listingId: string, title: string) => {
    Alert.alert(
      'Reject Listing',
      `Reject "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectListing(listingId);
              setPendingListings(pendingListings.filter((l) => l.id !== listingId));
              Alert.alert('Success', 'Listing rejected');
            } catch (error) {
              console.error('Error rejecting listing:', error);
              Alert.alert('Error', 'Failed to reject listing');
            }
          },
        },
      ]
    );
  };

  const renderPartnerCard = (partner: PartnerProfile) => (
    <View key={partner.userId} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{partner.businessName}</Text>
          <Text style={styles.cardSubtitle}>{partner.businessAddress}</Text>
        </View>
        <Ionicons name="business" size={40} color="#1E88E5" />
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {partner.description}
      </Text>

      <View style={styles.contactInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="call" size={16} color="#666" />
          <Text style={styles.infoText}>{partner.contactPhone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={16} color="#666" />
          <Text style={styles.infoText}>{partner.email}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectPartner(partner.userId, partner.businessName)}
        >
          <Ionicons name="close-circle" size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApprovePartner(partner.userId, partner.businessName)}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderListingCard = (listing: Listing) => (
    <View key={listing.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{listing.title}</Text>
          <Text style={styles.cardSubtitle}>
            by {listing.partnerName} • {listing.category}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {listing.description}
      </Text>

      <View style={styles.listingDetails}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.infoText}>{listing.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cash" size={16} color="#666" />
          <Text style={styles.infoText}>
            {listing.currency} {listing.price.toLocaleString()}
          </Text>
        </View>
        {listing.duration && (
          <View style={styles.infoRow}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.infoText}>{listing.duration}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectListing(listing.id!, listing.title)}
        >
          <Ionicons name="close-circle" size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApproveListing(listing.id!, listing.title)}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1E88E5', '#1565C0']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>Manage approvals</Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingPartners.length}</Text>
          <Text style={styles.statLabel}>Pending Partners</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingListings.length}</Text>
          <Text style={styles.statLabel}>Pending Listings</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'partners' && styles.activeTab]}
          onPress={() => setActiveTab('partners')}
        >
          <Ionicons
            name="people"
            size={20}
            color={activeTab === 'partners' ? '#1E88E5' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'partners' && styles.activeTabText,
            ]}
          >
            Partners ({pendingPartners.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'listings' && styles.activeTab]}
          onPress={() => setActiveTab('listings')}
        >
          <Ionicons
            name="list"
            size={20}
            color={activeTab === 'listings' ? '#1E88E5' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'listings' && styles.activeTabText,
            ]}
          >
            Listings ({pendingListings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {activeTab === 'partners' ? (
          pendingPartners.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done" size={60} color="#CCC" />
              <Text style={styles.emptyText}>No pending partners</Text>
            </View>
          ) : (
            pendingPartners.map(renderPartnerCard)
          )
        ) : pendingListings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done" size={60} color="#CCC" />
            <Text style={styles.emptyText}>No pending listings</Text>
          </View>
        ) : (
          pendingListings.map(renderListingCard)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#E3F2FD',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#1E88E5',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  contactInfo: {
    marginBottom: 12,
  },
  listingDetails: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default AdminDashboardScreen;
