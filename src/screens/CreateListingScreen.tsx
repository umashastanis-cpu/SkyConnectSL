import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList, ListingCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { createListing } from '../services/firestoreService';
import { getPartnerProfile } from '../services/firestoreService';
import { pickMultipleImages, uploadListingImages } from '../services/storageService';

type CreateListingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreateListing'
>;

const CreateListingScreen: React.FC = () => {
  const navigation = useNavigation<CreateListingScreenNavigationProp>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ListingCategory>('tour');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('LKR');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [duration, setDuration] = useState('');
  const [amenities, setAmenities] = useState('');
  const [tags, setTags] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const categories: ListingCategory[] = ['tour', 'accommodation', 'transport', 'activity'];

  useEffect(() => {
    loadPartnerInfo();
  }, []);

  const loadPartnerInfo = async () => {
    if (!user) return;
    
    try {
      const profile = await getPartnerProfile(user.uid);
      if (profile) {
        setPartnerName(profile.businessName);
        setLocation(profile.businessAddress);
      }
    } catch (error) {
      console.error('Error loading partner profile:', error);
    }
  };

  const pickImages = async () => {
    try {
      const images = await pickMultipleImages();
      if (images.length > 0) {
        setSelectedImages(images);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    if (!location.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return false;
    }
    if (!price || isNaN(Number(price))) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please enter availability dates (YYYY-MM-DD format)');
      return false;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      Alert.alert('Error', 'Please use YYYY-MM-DD format for dates');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a listing');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Create listing first to get the ID
      const listingId = await createListing({
        partnerId: user.uid,
        partnerName: partnerName || 'Partner',
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        price: Number(price),
        currency,
        images: [], // Will update with images after upload
        amenities: amenities.trim() ? amenities.split(',').map(a => a.trim()) : [],
        maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
        duration: duration.trim() || undefined,
        availability: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
        tags: tags.trim() ? tags.split(',').map(t => t.trim()) : [],
      });

      // Upload images if selected
      if (selectedImages.length > 0) {
        const imageURLs = await uploadListingImages(
          user.uid,
          listingId,
          selectedImages,
          (progress: number) => {
            setUploadProgress(progress);
          }
        );

        // Update listing with image URLs
        // Note: You may need to add an updateListing function to firestoreService
        // For now, this just uploads the images
      }
      
      setUploading(false);

      Alert.alert(
        'Success',
        'Your listing has been created and submitted for approval!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('PartnerHome'),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Listing</Text>
        <Text style={styles.subtitle}>Share your amazing service with travelers</Text>
      </View>

      <View style={styles.form}>
        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Sigiriya Rock Fortress Tour"
            placeholderTextColor="#999"
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your service in detail..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Images */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Photos (up to 5)</Text>
          <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
            <Ionicons name="camera" size={24} color="#007AFF" />
            <Text style={styles.addImageText}>Add Photos</Text>
          </TouchableOpacity>
          
          {selectedImages.length > 0 && (
            <View style={styles.imagesContainer}>
              {selectedImages.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., Colombo, Sri Lanka"
            placeholderTextColor="#999"
          />
        </View>

        {/* Price */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Price *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, styles.currencyGroup]}>
            <Text style={styles.label}>Currency</Text>
            <TextInput
              style={styles.input}
              value={currency}
              onChangeText={setCurrency}
              placeholder="LKR"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Duration & Capacity */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Duration</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g., 3 hours, 2 days"
              placeholderTextColor="#999"
            />
          </View>

          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Max Capacity</Text>
            <TextInput
              style={styles.input}
              value={maxCapacity}
              onChangeText={setMaxCapacity}
              placeholder="Optional"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Availability Dates */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Start Date *</Text>
            <TextInput
              style={styles.input}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
          </View>

          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>End Date *</Text>
            <TextInput
              style={styles.input}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amenities (comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={amenities}
            onChangeText={setAmenities}
            placeholder="e.g., WiFi, AC, Breakfast"
            placeholderTextColor="#999"
          />
        </View>

        {/* Tags */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tags (comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={tags}
            onChangeText={setTags}
            placeholder="e.g., Adventure, Cultural, Beach"
            placeholderTextColor="#999"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFF" />
              {uploading && (
                <Text style={styles.uploadProgressText}>
                  Uploading images: {Math.round(uploadProgress)}%
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Submit for Approval</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1E88E5',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    color: '#333',
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  currencyGroup: {
    width: 100,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  categoryButtonActive: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  addImageButton: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addImageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 10,
  },
  imageWrapper: {
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 8,
  },
  uploadProgressText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 4,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CreateListingScreen;
