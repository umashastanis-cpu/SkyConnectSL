/**
 * Network Diagnostics Utility
 * Helps diagnose and fix Firebase network connectivity issues
 */

import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    
    if (!state.isConnected) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (!state.isInternetReachable) {
      Alert.alert(
        'Network Issue',
        'Connected to network but cannot reach the internet. Please check your connection.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Network check error:', error);
    return true; // Assume connected if check fails
  }
};

export const testFirebaseConnectivity = async (): Promise<boolean> => {
  try {
    // Try to reach Firebase
    const response = await fetch('https://firestore.googleapis.com/', {
      method: 'HEAD',
      cache: 'no-cache',
    });
    
    return response.ok || response.status === 404; // 404 is expected, means reachable
  } catch (error) {
    console.error('Firebase connectivity test failed:', error);
    return false;
  }
};

export const diagnoseNetworkIssue = async (): Promise<string> => {
  const state = await NetInfo.fetch();
  
  let diagnosis = 'Network Status:\n\n';
  diagnosis += `Connected: ${state.isConnected ? '✅' : '❌'}\n`;
  diagnosis += `Internet Reachable: ${state.isInternetReachable ? '✅' : '❌'}\n`;
  diagnosis += `Connection Type: ${state.type}\n`;
  
  if (state.details) {
    diagnosis += `\nDetails:\n`;
    diagnosis += JSON.stringify(state.details, null, 2);
  }
  
  const firebaseReachable = await testFirebaseConnectivity();
  diagnosis += `\n\nFirebase Reachable: ${firebaseReachable ? '✅' : '❌'}`;
  
  return diagnosis;
};
