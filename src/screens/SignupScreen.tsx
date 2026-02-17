import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

interface SignupScreenProps {
  navigation: SignupScreenNavigationProp;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('traveler');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, selectedRole);
      Alert.alert(
        'Success',
        'Account created! Please check your email for verification.',
        [{ text: 'OK', onPress: () => navigation.replace('EmailVerification') }]
      );
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = error.message || 'Signup failed. Please try again.';
      
      if (error.code === 'auth/network-request-failed') {
        errorMessage = 
          '🌐 Network Connection Failed\n\n' +
          'Cannot reach Firebase servers. Please check:\n\n' +
          '• Your internet connection\n' +
          '• WiFi or mobile data is enabled\n' +
          '• Firewall or VPN settings\n\n' +
          'Try closing and reopening the app.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters.';
      }
      
      Alert.alert('Signup Failed', errorMessage, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0A3D62', '#1a237e', '#283593']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative Travel Elements */}
      <View style={styles.decorativeElements}>
        <Text style={styles.travelIcon1}>✈️</Text>
        <Text style={styles.travelIcon2}>🗺️</Text>
        <Text style={styles.travelIcon3}>🏔️</Text>
        <Text style={styles.travelIcon4}>🏖️</Text>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Logo */}
            <Image
              source={require('../../assets/logo1.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            
            {/* Title */}
            <Text style={styles.title}>SkyConnect SL</Text>
            <Text style={styles.subtitle}>Create your account</Text>

          {/* Role Selection */}
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                selectedRole === 'traveler' && styles.roleButtonActive,
              ]}
              onPress={() => setSelectedRole('traveler')}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  selectedRole === 'traveler' && styles.roleButtonTextActive,
                ]}
              >
                🧳 Traveler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                selectedRole === 'partner' && styles.roleButtonActive,
              ]}
              onPress={() => setSelectedRole('partner')}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  selectedRole === 'partner' && styles.roleButtonTextActive,
                ]}
              >
                🏢 Partner
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4A90E2', '#50C9C3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.signupButtonText}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorativeElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  travelIcon1: {
    position: 'absolute',
    top: 50,
    right: 30,
    fontSize: 40,
    opacity: 0.15,
    transform: [{ rotate: '-15deg' }],
  },
  travelIcon2: {
    position: 'absolute',
    top: 150,
    left: 20,
    fontSize: 35,
    opacity: 0.12,
    transform: [{ rotate: '20deg' }],
  },
  travelIcon3: {
    position: 'absolute',
    bottom: 200,
    right: 40,
    fontSize: 45,
    opacity: 0.1,
  },
  travelIcon4: {
    position: 'absolute',
    bottom: 100,
    left: 30,
    fontSize: 38,
    opacity: 0.13,
    transform: [{ rotate: '-10deg' }],
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'LeckerliOne_400Regular',
    fontSize: 32,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#E8F4F8',
    marginBottom: 30,
    opacity: 0.9,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  roleButtonActive: {
    borderColor: '#4DD0E1',
    backgroundColor: 'rgba(77, 208, 225, 0.2)',
  },
  roleButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#E8F4F8',
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#4DD0E1',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 14,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    color: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  signupButton: {
    paddingVertical: 16,
    borderRadius: 25,
    marginTop: 10,
    overflow: 'hidden',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  loginText: {
    color: '#E8F4F8',
    fontSize: 16,
  },
  loginLink: {
    color: '#4DD0E1',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SignupScreen;
