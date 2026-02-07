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
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { createTravelerProfile } from '../services/firestoreService';
import { pickImage, takePhoto, uploadTravelerProfilePhoto } from '../services/storageService';

type CreateTravelerProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreateTravelerProfile'
>;

interface CreateTravelerProfileScreenProps {
  navigation: CreateTravelerProfileScreenNavigationProp;
}

const TRAVEL_PREFERENCES = [
  { id: 'Beach', label: 'Beach', emoji: '🏖️' },
  { id: 'Adventure', label: 'Adventure', emoji: '🧗' },
  { id: 'Nature', label: 'Nature', emoji: '🌿' },
  { id: 'City', label: 'City', emoji: '🏙️' },
  { id: 'Culture', label: 'Culture', emoji: '🕌' },
];

const TRAVEL_TYPES = [
  { id: 'Solo', label: 'Solo', emoji: '🧳' },
  { id: 'Couple', label: 'Couple', emoji: '💑' },
  { id: 'Family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { id: 'Group', label: 'Group', emoji: '👥' },
];

const CreateTravelerProfileScreen: React.FC<CreateTravelerProfileScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [travelType, setTravelType] = useState('Solo');
  const [loading, setLoading] = useState(false);
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const togglePreference = (prefId: string) => {
    if (selectedPreferences.includes(prefId)) {
      setSelectedPreferences(selectedPreferences.filter(p => p !== prefId));
    } else {
      if (selectedPreferences.length < 3) {
        setSelectedPreferences([...selectedPreferences, prefId]);
      } else {
        Alert.alert('Limit Reached', 'You can select up to 3 preferences');
      }
    }
  };

  const handlePickPhoto = async () => {
    try {
      const uri = await pickImage();
      if (uri) {
        setProfilePhotoUri(uri);
      }
    } catch (error) {
      console.error('Error picking photo:', error);
      Alert.alert('Error', 'Failed to pick photo');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const uri = await takePhoto();
      if (uri) {
        setProfilePhotoUri(uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Profile Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Gallery', onPress: handlePickPhoto },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (selectedPreferences.length === 0) {
      Alert.alert('Error', 'Please select at least one travel preference');
      return;
    }

    if (!minBudget || !maxBudget) {
      Alert.alert('Error', 'Please enter your budget range');
      return;
    }

    const min = parseFloat(minBudget);
    const max = parseFloat(maxBudget);

    if (min >= max) {
      Alert.alert('Error', 'Maximum budget must be greater than minimum');
      return;
    }

    setLoading(true);
    try {
      // Upload profile photo if selected
      let profilePhotoUrl: string | undefined;
      if (profilePhotoUri) {
        setUploadingPhoto(true);
        try {
          profilePhotoUrl = await uploadTravelerProfilePhoto(user!.uid, profilePhotoUri);
        } catch (photoError) {
          console.error('Error uploading photo:', photoError);
          Alert.alert('Warning', 'Photo upload failed, but profile will be created without it');
        } finally {
          setUploadingPhoto(false);
        }
      }

      await createTravelerProfile({
        userId: user!.uid,
        name: name.trim(),
        email: user!.email,
        travelPreferences: selectedPreferences,
        budgetRange: { min, max },
        travelType,
        profilePhoto: profilePhotoUrl,
      });
      Alert.alert('Success', 'Profile created successfully!');
      navigation.replace('TravelerHome');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Traveler Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar + Greeting */}
            <View style={styles.topSection}>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={showPhotoOptions}
                activeOpacity={0.7}
              >
                {profilePhotoUri ? (
                  <Image source={{ uri: profilePhotoUri }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarEmoji}>👤</Text>
                )}
                {uploadingPhoto && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator color="#fff" />
                  </View>
                )}
                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text style={styles.greeting}>Hi, {name || 'Traveler'}!</Text>
              <Text style={styles.subtitle}>Tell us your travel style</Text>
              <Text style={styles.hint}>This helps our AI plan trips just for you</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Name Input */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Traveler"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Travel Preferences */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>What do you enjoy?</Text>
                <View style={styles.chipsContainer}>
                  {TRAVEL_PREFERENCES.map(pref => (
                    <TouchableOpacity
                      key={pref.id}
                      style={[
                        styles.chip,
                        selectedPreferences.includes(pref.id) && styles.chipActive,
                      ]}
                      onPress={() => togglePreference(pref.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.chipEmoji}>{pref.emoji}</Text>
                      <Text
                        style={[
                          styles.chipText,
                          selectedPreferences.includes(pref.id) && styles.chipTextActive,
                        ]}
                      >
                        {pref.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Budget Range */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Budget Range ($)</Text>
                <View style={styles.budgetContainer}>
                  <TextInput
                    style={styles.budgetInput}
                    placeholder="Min"
                    placeholderTextColor="#999"
                    value={minBudget}
                    onChangeText={setMinBudget}
                    keyboardType="numeric"
                  />
                  <Text style={styles.budgetSeparator}>to</Text>
                  <TextInput
                    style={styles.budgetInput}
                    placeholder="Max"
                    placeholderTextColor="#999"
                    value={maxBudget}
                    onChangeText={setMaxBudget}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.hintText}>Estimated trip cost</Text>
              </View>

              {/* Travel Type */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Travel Type</Text>
                <View style={styles.travelTypeContainer}>
                  {TRAVEL_TYPES.map(type => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.travelTypeCard,
                        travelType === type.id && styles.travelTypeCardActive,
                      ]}
                      onPress={() => setTravelType(type.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.travelTypeEmoji}>{type.emoji}</Text>
                      <Text
                        style={[
                          styles.travelTypeText,
                          travelType === type.id && styles.travelTypeTextActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* CTA Section - Sticky Bottom */}
          <View style={styles.ctaSection}>
            <Text style={styles.aiMessage}>
              🤖 Your AI assistant is preparing your travel ideas…
            </Text>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!name || selectedPreferences.length === 0 || !minBudget || !maxBudget) &&
                  styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={
                loading ||
                !name ||
                selectedPreferences.length === 0 ||
                !minBudget ||
                !maxBudget
              }
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4A90E2', '#50C9C3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Profile'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150,
  },
  topSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4A90E2',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  formSection: {
    paddingHorizontal: 20,
  },
  fieldContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  chipActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#E3F2FD',
  },
  chipEmoji: {
    fontSize: 18,
  },
  chipText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#4A90E2',
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  budgetInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetSeparator: {
    color: '#999',
    fontSize: 16,
    fontWeight: '500',
  },
  hintText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  travelTypeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  travelTypeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  travelTypeCardActive: {
    borderColor: '#4A90E2',
    borderWidth: 3,
    backgroundColor: '#E3F2FD',
  },
  travelTypeEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  travelTypeText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  travelTypeTextActive: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  ctaSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  aiMessage: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  saveButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateTravelerProfileScreen;
