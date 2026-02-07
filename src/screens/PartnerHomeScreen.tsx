import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getPartnerProfile } from '../services/firestoreService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useNavigation } from '@react-navigation/native';

interface PartnerProfile {
  companyName: string;
  description: string;
  location: string;
  contactInfo: {
    phone: string;
    email?: string;
    website?: string;
  };
  status?: 'pending' | 'approved' | 'rejected';
}

const PartnerHomeScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<PartnerProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (user?.uid) {
      const data = await getPartnerProfile(user.uid);
      if (data) {
        setProfile(data as unknown as PartnerProfile);
      }
    }
  };

  const companyName = profile?.companyName || 'Partner';
  const isApproved = profile?.status === 'approved';

  const quickStats = [
    { id: 1, label: 'Listings', value: '0', icon: 'list-outline', color: '#4A90E2' },
    { id: 2, label: 'Bookings', value: '0', icon: 'calendar-outline', color: '#50C9C3' },
    { id: 3, label: 'Reviews', value: '0', icon: 'star-outline', color: '#F39C12' },
    { id: 4, label: 'Revenue', value: '$0', icon: 'trending-up-outline', color: '#27AE60' },
  ];

  const quickActions = [
    { id: 1, icon: 'add-circle-outline', label: 'Create Listing', color: '#4A90E2', emoji: '➕', action: () => navigation.navigate('CreateListing') },
    { id: 2, icon: 'list-outline', label: 'My Listings', color: '#50C9C3', emoji: '📋', action: () => navigation.navigate('PartnerListings') },
    { id: 3, icon: 'calendar-outline', label: 'Bookings', color: '#9B59B6', emoji: '📅', action: () => {} },
    { id: 4, icon: 'person-outline', label: 'Profile', color: '#E74C3C', emoji: '👤', action: () => navigation.navigate('EditPartnerProfile') },
  ];

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
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.companyName}>{companyName}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileAvatar}
            onPress={() => navigation.navigate('EditPartnerProfile')}
          >
            <Ionicons name="business" size={40} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Approval Status Banner */}
        {!isApproved && (
          <View style={styles.statusBanner}>
            <LinearGradient
              colors={['#F39C12', '#E67E22']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statusBannerGradient}
            >
              <View style={styles.statusIconContainer}>
                <Ionicons name="time-outline" size={32} color="#FFF" />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>Pending Approval</Text>
                <Text style={styles.statusMessage}>
                  Your profile is under review. You'll be notified once approved.
                </Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Quick Stats Grid */}
        {isApproved && (
          <View style={styles.statsSection}>
            <View style={styles.statsGrid}>
              {quickStats.map((stat) => (
                <View key={stat.id} style={styles.statCard}>
                  <Ionicons name={stat.icon as any} size={28} color={stat.color} />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity 
                key={action.id} 
                style={[styles.actionCard, !isApproved && action.id !== 4 && styles.actionCardDisabled]}
                disabled={!isApproved && action.id !== 4}
                onPress={action.action}
              >
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionEmoji}>{action.emoji}</Text>
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
                {!isApproved && action.id !== 4 && (
                  <View style={styles.lockedBadge}>
                    <Ionicons name="lock-closed" size={12} color="#999" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Business Info Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#4A90E2" />
              <Text style={styles.infoText}>{profile?.location || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#4A90E2" />
              <Text style={styles.infoText}>{profile?.contactInfo?.phone || 'Not set'}</Text>
            </View>
            {profile?.contactInfo?.website && (
              <View style={styles.infoRow}>
                <Ionicons name="globe" size={20} color="#4A90E2" />
                <Text style={styles.infoText}>{profile.contactInfo.website}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Next Steps (if not approved) */}
        {!isApproved && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>While You Wait</Text>
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>✨ Get Ready for Success</Text>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Prepare photos of your services</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Think about pricing strategies</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Draft descriptions for your offerings</Text>
              </View>
            </View>
          </View>
        )}

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
    height: 140,
    paddingTop: 50,
    paddingBottom: 24,
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
    fontSize: 16,
    color: '#FFF',
    opacity: 0.95,
    marginBottom: 6,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  profileAvatar: {
    marginLeft: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statusBanner: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F39C12',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  statusBannerGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconContainer: {
    marginRight: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
  },
  statusMessage: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.95,
    lineHeight: 20,
  },
  statsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
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
  actionCardDisabled: {
    opacity: 0.5,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionEmoji: {
    fontSize: 32,
  },
  actionLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  lockedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 6,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  tipsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipBullet: {
    fontSize: 16,
    color: '#4A90E2',
    marginRight: 12,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
    lineHeight: 22,
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

export default PartnerHomeScreen;
