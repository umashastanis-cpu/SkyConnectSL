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
  Modal,
  StatusBar,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { createPartnerProfile } from '../services/firestoreService';
import { pickImage, takePhoto, uploadPartnerLogo, uploadPartnerDocument } from '../services/storageService';

type CreatePartnerProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreatePartnerProfile'
>;

interface CreatePartnerProfileScreenProps {
  navigation: CreatePartnerProfileScreenNavigationProp;
}

const CreatePartnerProfileScreen: React.FC<CreatePartnerProfileScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Image uploads
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [documentUris, setDocumentUris] = useState<string[]>([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const handlePickLogo = async () => {
    try {
      const uri = await pickImage();
      if (uri) {
        setLogoUri(uri);
      }
    } catch (error) {
      console.error('Error picking logo:', error);
      Alert.alert('Error', 'Failed to pick logo image');
    }
  };

  const handleTakeLogo = async () => {
    try {
      const uri = await takePhoto();
      if (uri) {
        setLogoUri(uri);
      }
    } catch (error) {
      console.error('Error taking logo photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showLogoOptions = () => {
    Alert.alert(
      'Company Logo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: handleTakeLogo },
        { text: 'Choose from Gallery', onPress: handlePickLogo },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handlePickDocument = async () => {
    try {
      const uri = await pickImage();
      if (uri && documentUris.length < 3) {
        setDocumentUris([...documentUris, uri]);
      } else if (documentUris.length >= 3) {
        Alert.alert('Limit Reached', 'You can upload up to 3 documents');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const removeDocument = (index: number) => {
    setDocumentUris(documentUris.filter((_, i) => i !== index));
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
      // Upload logo if selected
      let logoUrl: string | undefined;
      if (logoUri) {
        setUploadingLogo(true);
        try {
          logoUrl = await uploadPartnerLogo(user!.uid, logoUri);
        } catch (logoError) {
          console.error('Error uploading logo:', logoError);
          Alert.alert('Warning', 'Logo upload failed, but profile will be created without it');
        } finally {
          setUploadingLogo(false);
        }
      }

      // Upload documents if selected
      let documentUrls: string[] = [];
      if (documentUris.length > 0) {
        setUploadingDocument(true);
        try {
          for (let i = 0; i < documentUris.length; i++) {
            const docUri = documentUris[i];
            const docName = `document_${i + 1}`;
            const docUrl = await uploadPartnerDocument(user!.uid, docUri, docName);
            documentUrls.push(docUrl);
          }
        } catch (docError) {
          console.error('Error uploading documents:', docError);
          Alert.alert('Warning', 'Some documents failed to upload');
        } finally {
          setUploadingDocument(false);
        }
      }

      await createPartnerProfile({
        userId: user!.uid,
        businessName: companyName.trim(),
        businessCategory: 'Tourism', // Default category
        description: description.trim(),
        businessAddress: location.trim(),
        email: user!.email,
        contactPhone: phone.trim(),
        websiteUrl: website.trim() || undefined,
        logo: logoUrl,
        documents: documentUrls.length > 0 ? documentUrls : undefined,
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigation.replace('PartnerHome');
  };

  const isFormValid = () => {
    return (
      companyName.trim().length > 0 &&
      description.trim().length > 0 &&
      location.trim().length > 0 &&
      phone.trim().length > 0
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Create Partner Profile</Text>
          <Text style={styles.headerSubtitle}>Tell us about your business</Text>
        </View>
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

            {/* Logo Upload */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Logo (Optional)</Text>
              <TouchableOpacity
                style={styles.logoUploadButton}
                onPress={showLogoOptions}
                disabled={uploadingLogo}
              >
                {logoUri ? (
                  <View style={styles.logoPreviewContainer}>
                    <Image source={{ uri: logoUri }} style={styles.logoPreview} />
                    {uploadingLogo && (
                      <View style={styles.uploadingOverlay}>
                        <ActivityIndicator color="#fff" />
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Ionicons name="image-outline" size={32} color="#4A90E2" />
                    <Text style={styles.logoUploadText}>Upload Logo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Documents Upload */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Verification Documents (Optional, up to 3)</Text>
              <TouchableOpacity
                style={styles.documentUploadButton}
                onPress={handlePickDocument}
                disabled={uploadingDocument || documentUris.length >= 3}
              >
                <Ionicons name="document-attach-outline" size={20} color="#4A90E2" />
                <Text style={styles.documentUploadText}>
                  {uploadingDocument ? 'Uploading...' : 'Add Document'}
                </Text>
              </TouchableOpacity>
              
              {documentUris.length > 0 && (
                <View style={styles.documentsPreview}>
                  {documentUris.map((uri, index) => (
                    <View key={index} style={styles.documentItem}>
                      <Image source={{ uri }} style={styles.documentThumbnail} />
                      <TouchableOpacity
                        style={styles.removeDocButton}
                        onPress={() => removeDocument(index)}
                      >
                        <Ionicons name="close-circle" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
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

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* CTA Section */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[styles.saveButton, !isFormValid() && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading || !isFormValid()}
          >
            <LinearGradient
              colors={isFormValid() ? ['#4A90E2', '#50C9C3'] : ['#CCC', '#AAA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Submitting...' : 'Save Profile'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="time-outline" size={60} color="#4A90E2" />
            </View>
            <Text style={styles.modalTitle}>Profile Submitted!</Text>
            <Text style={styles.modalMessage}>
              Your partner profile is pending approval.{'\n'}
              We'll notify you once it's approved.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleModalClose}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    marginBottom: 12,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
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
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoUploadButton: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  logoPreviewContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  logoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  logoPlaceholder: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoUploadText: {
    marginTop: 8,
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
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
  documentUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 8,
    gap: 8,
  },
  documentUploadText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  documentsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  documentItem: {
    width: 80,
    height: 80,
    position: 'relative',
  },
  documentThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  removeDocButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  modalIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CreatePartnerProfileScreen;
