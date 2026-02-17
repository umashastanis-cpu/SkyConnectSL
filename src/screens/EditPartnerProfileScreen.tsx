import React, { useState, useEffect } from 'react';
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
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getPartnerProfile, updatePartnerProfile } from '../services/firestoreService';

type EditPartnerProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditPartnerProfile'
>;

interface EditPartnerProfileScreenProps {
  navigation: EditPartnerProfileScreenNavigationProp;
}

const EditPartnerProfileScreen: React.FC<EditPartnerProfileScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user?.uid) return;

    setFetchingProfile(true);
    try {
      const profile = await getPartnerProfile(user.uid);
      if (profile) {
        setCompanyName(profile.businessName);
        setDescription(profile.description);
        setLocation(profile.businessAddress);
        setPhone(profile.contactPhone);
        setWebsite(profile.websiteUrl || '');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load profile');
      navigation.goBack();
    } finally {
      setFetchingProfile(false);
    }
  };

  const handleSave = async () => {
    if (!companyName.trim()) {
      Alert.alert('Error', 'Please enter your company name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Error', 'Please enter your location');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter a contact phone number');
      return;
    }

    setLoading(true);
    try {
      await updatePartnerProfile(user!.uid, {
        businessName: companyName.trim(),
        description: description.trim(),
        businessAddress: location.trim(),
        contactPhone: phone.trim(),
        email: user!.email,
        websiteUrl: website.trim() || undefined,
      });
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      companyName.trim().length > 0 &&
      description.trim().length > 0 &&
      location.trim().length > 0 &&
      phone.trim().length > 0
    );
  };

  if (fetchingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Text style={styles.headerSubtitle}>Update your business information</Text>
        </View>
        <TouchableOpacity onPress={handleSave} disabled={loading || !isFormValid()}>
          <Text style={[styles.saveText, (loading || !isFormValid()) && styles.saveTextDisabled]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Company Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="business" size={24} color="#4A90E2" />
              <Text style={styles.cardTitle}>Company Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Paradise Tours"
                placeholderTextColor="#999"
                value={companyName}
                onChangeText={setCompanyName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Luxury travel experiences in Sri Lanka"
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{description.length} characters</Text>
            </View>
          </View>

          {/* Contact & Location Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={24} color="#50C9C3" />
              <Text style={styles.cardTitle}>Contact & Location</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="location-outline" size={20} color="#4A90E2" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputWithIconText}
                  placeholder="Colombo, Sri Lanka"
                  placeholderTextColor="#999"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="call-outline" size={20} color="#4A90E2" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputWithIconText}
                  placeholder="+94 771 234 567"
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Website (Optional)</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="globe-outline" size={20} color="#4A90E2" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputWithIconText}
                  placeholder="www.paradisetours.lk"
                  placeholderTextColor="#999"
                  value={website}
                  onChangeText={setWebsite}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
              <Text style={styles.hintText}>Helps travelers learn more about you</Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    paddingHorizontal: 8,
  },
  saveTextDisabled: {
    color: '#999',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F8F9FB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputWithIconText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  hintText: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
  },
});

export default EditPartnerProfileScreen;
