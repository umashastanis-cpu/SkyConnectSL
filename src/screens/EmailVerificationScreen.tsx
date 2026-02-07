import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../config/firebase';

type EmailVerificationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EmailVerification'
>;

interface EmailVerificationScreenProps {
  navigation: EmailVerificationScreenNavigationProp;
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  navigation,
}) => {
  const [loading, setLoading] = useState(false);
  const { sendVerificationEmail, reloadUser, user, signOut } = useAuth();

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await sendVerificationEmail();
      Alert.alert('Success', 'Verification email sent!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    try {
      await reloadUser();
      
      // Check Firebase Auth directly instead of waiting for state update
      const firebaseUser = auth.currentUser;
      await firebaseUser?.reload();
      
      if (firebaseUser?.emailVerified) {
        Alert.alert('Success', 'Your email has been successfully verified! ✅');
      } else {
        Alert.alert('Not Verified', 'Please verify your email first. Check your inbox for the verification link.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Temporary function to reset onboarding for testing
  const resetOnboarding = async () => {
    await AsyncStorage.removeItem('onboardingCompleted');
    await signOut(); // Also sign out to start fresh
    Alert.alert('Success', 'App reset! Reloading...');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📧</Text>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.description}>
        We've sent a verification link to your email address. Please check your
        inbox and verify your email to continue.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleCheckVerification}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'Checking...' : "I've Verified"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleResendEmail}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>Resend Email</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => signOut()}
      >
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>

      {/* TEMPORARY: Reset Button for Testing */}
      <TouchableOpacity onPress={resetOnboarding} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>🔄 Reset to Onboarding (Dev)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emoji: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 10,
    marginBottom: 15,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: '#4A90E2',
    fontSize: 16,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 30,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  resetButtonText: {
    color: '#856404',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default EmailVerificationScreen;
