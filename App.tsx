import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts, LeckerliOne_400Regular } from '@expo-google-fonts/leckerli-one';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';

export default function App() {
  const [isSplashAnimationComplete, setIsSplashAnimationComplete] = useState(false);
  const [fontsLoaded] = useFonts({
    LeckerliOne_400Regular,
  });

  // Callback when splash animation finishes (3 seconds)
  const onSplashFinish = () => {
    setIsSplashAnimationComplete(true);
  };

  // Only show main app when BOTH fonts are loaded AND splash animation is done
  if (!isSplashAnimationComplete || !fontsLoaded) {
    return <SplashScreen onFinish={onSplashFinish} />;
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </AuthProvider>
  );
}
