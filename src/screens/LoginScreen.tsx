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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signOut } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      // Navigation handled by App.tsx based on auth state
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = error.message || 'Login failed. Please try again.';
      
      if (error.code === 'auth/network-request-failed') {
        errorMessage = 
          '🌐 Network Connection Failed\n\n' +
          'Cannot reach Firebase servers. Please check:\n\n' +
          '• Your internet connection\n' +
          '• WiFi or mobile data is enabled\n' +
          '• Firewall or VPN settings\n\n' +
          'Try closing and reopening the app.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      Alert.alert('Login Failed', errorMessage, [
        { text: 'OK' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Temporary function to reset onboarding for testing
  const resetOnboarding = async () => {
    await AsyncStorage.removeItem('onboardingCompleted');
    await signOut(); // Also sign out to start fresh
    Alert.alert('Success', 'App reset! Reloading...');
    // The app will automatically reload due to auth state change
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
        <Text style={styles.travelIcon1}>🎈</Text>
        <Text style={styles.travelIcon2}>📷</Text>
        <Text style={styles.travelIcon3}>🗺️</Text>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Curved Background */}
          <View style={styles.curvedBackground}>
            <View style={styles.wave} />
        </View>

        {/* Login Card */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.title}>Sign in</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={styles.input}
                  placeholder="demo@email.com"
                  placeholderTextColor="#B0B0B0"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#B0B0B0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={styles.rememberContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>Remember Me</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4A90E2', '#50C9C3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Signing In...' : 'Login'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an Account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>

            {/* TEMPORARY: Reset Onboarding Button for Testing */}
            <TouchableOpacity onPress={resetOnboarding} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>🔄 Reset Onboarding (Dev Only)</Text>
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
    top: 60,
    left: 30,
    fontSize: 50,
    opacity: 0.2,
    transform: [{ rotate: '-20deg' }],
  },
  travelIcon2: {
    position: 'absolute',
    top: 80,
    right: 40,
    fontSize: 45,
    opacity: 0.18,
    transform: [{ rotate: '15deg' }],
  },
  travelIcon3: {
    position: 'absolute',
    top: 180,
    right: 25,
    fontSize: 40,
    opacity: 0.15,
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  curvedBackground: {
    height: height * 0.45,
    position: 'relative',
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    bottom: -50,
    left: 0,
    right: 0,
    height: 150,
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    transform: [{ scaleX: 2 }],
  },
  cardContainer: {
    flex: 1,
    marginTop: -80,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 15,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#4A90E2',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 14,
    color: '#666',
  },
  forgotText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 20,
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
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resetButton: {
    marginTop: 20,
    padding: 10,
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

export default LoginScreen;
