import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload an image to Firebase Storage
 * @param uri - Local URI of the image
 * @param path - Storage path (e.g., 'listings/listingId/image1.jpg')
 * @returns Download URL of the uploaded image
 */
export const uploadImage = async (uri: string, path: string): Promise<string> => {
  try {
    // Fetch the image data
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create a reference to the storage location
    const storageRef = ref(storage, path);

    // Upload the image
    await uploadBytes(storageRef, blob);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Upload multiple images
 * @param uris - Array of local image URIs
 * @param folder - Folder name in storage (e.g., 'listings/listingId')
 * @returns Array of download URLs
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
 * Delete an image from Firebase Storage
 * @param url - Download URL of the image to delete
 */
export const deleteImage = async (url: string): Promise<void> => {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
};

/**
 * Delete multiple images
 * @param urls - Array of download URLs
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
