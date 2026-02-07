import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  getTravelerProfile,
  getPartnerProfile,
} from '../services/firestoreService';

// Import screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import CreateTravelerProfileScreen from '../screens/CreateTravelerProfileScreen';
import CreatePartnerProfileScreen from '../screens/CreatePartnerProfileScreen';
import EditTravelerProfileScreen from '../screens/EditTravelerProfileScreen';
import EditPartnerProfileScreen from '../screens/EditPartnerProfileScreen';
import TravelerHomeScreen from '../screens/TravelerHomeScreen';
import PartnerHomeScreen from '../screens/PartnerHomeScreen';
import CreateListingScreen from '../screens/CreateListingScreen';
import PartnerListingsScreen from '../screens/PartnerListingsScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import BrowseListingsScreen from '../screens/BrowseListingsScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();

    // Listen for app state changes to re-check onboarding
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkOnboardingStatus();
      }
    });

    // Poll for onboarding changes (fallback)
    const interval = setInterval(checkOnboardingStatus, 1000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (user) {
      checkUserProfile();
    } else {
      setHasProfile(null);
      setChecking(false);
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('onboardingCompleted');
      setOnboardingComplete(completed === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboardingComplete(false);
    }
  };

  const checkUserProfile = async () => {
    if (!user) return;

    setChecking(true);
    try {
      // Admins don't need profiles
      if (user.role === 'admin') {
        setHasProfile(true);
      } else if (user.role === 'traveler') {
        const profile = await getTravelerProfile(user.uid);
        setHasProfile(!!profile);
      } else if (user.role === 'partner') {
        const profile = await getPartnerProfile(user.uid);
        setHasProfile(!!profile);
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      setHasProfile(false);
    } finally {
      setChecking(false);
    }
  };

  if (authLoading || onboardingComplete === null || checking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Onboarding flow */}
        {!onboardingComplete ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !user ? (
          // Auth flow
          <>
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
          </>
        ) : !user.emailVerified ? (
          // Email verification required
          <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        ) : !hasProfile ? (
          // Profile creation flow
          <>
            {user.role === 'traveler' ? (
              <Stack.Screen
                name="CreateTravelerProfile"
                component={CreateTravelerProfileScreen}
              />
            ) : (
              <Stack.Screen
                name="CreatePartnerProfile"
                component={CreatePartnerProfileScreen}
              />
            )}
          </>
        ) : (
          // Main app flow (role-based)
          <>
            {user.role === 'traveler' ? (
              <>
                <Stack.Screen name="TravelerHome" component={TravelerHomeScreen} />
                <Stack.Screen name="EditTravelerProfile" component={EditTravelerProfileScreen} />
                <Stack.Screen name="BrowseListings" component={BrowseListingsScreen} />
                <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
              </>
            ) : user.role === 'admin' ? (
              <>
                <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="PartnerHome" component={PartnerHomeScreen} />
                <Stack.Screen name="EditPartnerProfile" component={EditPartnerProfileScreen} />
                <Stack.Screen name="CreateListing" component={CreateListingScreen} />
                <Stack.Screen name="PartnerListings" component={PartnerListingsScreen} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default AppNavigator;
