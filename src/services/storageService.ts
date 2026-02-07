import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
} from 'firebase/storage';
import { storage } from '../config/firebase';
import * as ImagePicker from 'expo-image-picker';

// ========== Image Picker Helper ==========

/**
 * Pick image from gallery
 */
export const pickImage = async (): Promise<string | null> => {
  // Request permission
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (!permissionResult.granted) {
    alert('Permission to access camera roll is required!');
    return null;
  }

  // Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8, // Compress to 80%
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }

  return null;
};

/**
 * Take photo with camera
 */
export const takePhoto = async (): Promise<string | null> => {
  // Request permission
  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  
  if (!permissionResult.granted) {
    alert('Permission to access camera is required!');
    return null;
  }

  // Take photo
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }

  return null;
};

/**
 * Pick multiple images
 */
export const pickMultipleImages = async (
  maxImages: number = 5
): Promise<string[]> => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (!permissionResult.granted) {
    alert('Permission to access camera roll is required!');
    return [];
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    selectionLimit: maxImages,
    quality: 0.8,
  });

  if (!result.canceled) {
    return result.assets.map(asset => asset.uri);
  }

  return [];
};

// ========== Upload Functions ==========

/**
 * Upload traveler profile photo
 */
export const uploadTravelerProfilePhoto = async (
  userId: string,
  imageUri: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const fileName = `profile_${Date.now()}.jpg`;
    const storageRef = ref(storage, `travelers/${userId}/${fileName}`);

    const response = await fetch(imageUri);
    const blob = await response.blob();

    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading traveler photo:', error);
    throw error;
  }
};

/**
 * Upload partner logo
 */
export const uploadPartnerLogo = async (
  userId: string,
  imageUri: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const fileName = `logo_${Date.now()}.jpg`;
    const storageRef = ref(storage, `partners/${userId}/logo/${fileName}`);

    const response = await fetch(imageUri);
    const blob = await response.blob();

    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading partner logo:', error);
    throw error;
  }
};

/**
 * Upload partner document
 */
export const uploadPartnerDocument = async (
  userId: string,
  documentUri: string,
  documentName: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const fileName = `${documentName}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `partners/${userId}/documents/${fileName}`);

    const response = await fetch(documentUri);
    const blob = await response.blob();

    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading partner document:', error);
    throw error;
  }
};

/**
 * Upload listing images
 */
export const uploadListingImages = async (
  partnerId: string,
  listingId: string,
  imageUris: string[],
  onProgress?: (progress: number) => void
): Promise<string[]> => {
  try {
    const uploadPromises = imageUris.map(async (uri, index) => {
      const fileName = `listing_${listingId}_${index}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `listings/${partnerId}/${listingId}/${fileName}`);

      const response = await fetch(uri);
      const blob = await response.blob();

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      if (onProgress) {
        const progress = ((index + 1) / imageUris.length) * 100;
        onProgress(progress);
      }

      return downloadURL;
    });

    const downloadURLs = await Promise.all(uploadPromises);
    return downloadURLs;
  } catch (error) {
    console.error('Error uploading listing images:', error);
    throw error;
  }
};

/**
 * Generic image upload (backward compatibility)
 */
export const uploadImage = async (uri: string, path: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Generic multiple image upload (backward compatibility)
 */
export const uploadMultipleImages = async (
  uris: string[],
  folder: string
): Promise<string[]> => {
  try {
    const uploadPromises = uris.map((uri, index) => {
      const fileName = `image_${Date.now()}_${index}.jpg`;
      const path = `${folder}/${fileName}`;
      return uploadImage(uri, path);
    });

    const downloadURLs = await Promise.all(uploadPromises);
    return downloadURLs;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw new Error('Failed to upload images');
  }
};

/**
 * Delete image from storage
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Delete multiple images
 */
export const deleteMultipleImages = async (urls: string[]): Promise<void> => {
  try {
    const deletePromises = urls.map(url => deleteImage(url));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting multiple images:', error);
    throw new Error('Failed to delete images');
  }
};
