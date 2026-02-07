import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const mapLineAnim = useRef(new Animated.Value(0)).current;
  const aiDot1 = useRef(new Animated.Value(0)).current;
  const aiDot2 = useRef(new Animated.Value(0)).current;
  const aiDot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Map line draws slowly
    Animated.timing(mapLineAnim, {
      toValue: 1,
      duration: 1500,
      delay: 400,
      useNativeDriver: true,
    }).start();

    // AI dots pulse gently
    const pulseDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 800,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    pulseDot(aiDot1, 600);
    pulseDot(aiDot2, 800);
    pulseDot(aiDot3, 1000);

    // Auto-navigate after 3 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#87CEEB', '#20B2AA', '#1DD1A1']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      {/* Map Route Lines */}
      <Animated.View style={[styles.mapLinesContainer, { opacity: mapLineAnim }]}>
        <View style={styles.mapLine1} />
        <View style={styles.mapLine2} />
        <View style={styles.mapLine3} />
        <View style={styles.routeDot1} />
        <View style={styles.routeDot2} />
        <View style={styles.routeDot3} />
      </Animated.View>

      {/* AI Network Dots */}
      <View style={styles.aiDotsContainer}>
        <Animated.View style={[styles.aiDot, styles.aiDot1Pos, { opacity: aiDot1 }]} />
        <Animated.View style={[styles.aiDot, styles.aiDot2Pos, { opacity: aiDot2 }]} />
        <Animated.View style={[styles.aiDot, styles.aiDot3Pos, { opacity: aiDot3 }]} />
        <Animated.View style={[styles.aiDot, styles.aiDot4Pos, { opacity: aiDot1 }]} />
        <Animated.View style={[styles.aiDot, styles.aiDot5Pos, { opacity: aiDot2 }]} />
      </View>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo1.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* App Name */}
        <Text style={styles.appName}>SkyConnect SL</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>Your Smart Travel Companion</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLinesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  mapLine1: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    width: 150,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ rotate: '45deg' }],
  },
  mapLine2: {
    position: 'absolute',
    top: '50%',
    right: '15%',
    width: 120,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    transform: [{ rotate: '-30deg' }],
  },
  mapLine3: {
    position: 'absolute',
    bottom: '25%',
    left: '20%',
    width: 100,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ rotate: '15deg' }],
  },
  routeDot1: {
    position: 'absolute',
    top: '28%',
    left: '10%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.6,
  },
  routeDot2: {
    position: 'absolute',
    top: '48%',
    right: '15%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.6,
  },
  routeDot3: {
    position: 'absolute',
    bottom: '23%',
    left: '20%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.6,
  },
  aiDotsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  aiDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  aiDot1Pos: {
    top: '20%',
    right: '25%',
  },
  aiDot2Pos: {
    top: '35%',
    left: '30%',
  },
  aiDot3Pos: {
    bottom: '30%',
    right: '30%',
  },
  aiDot4Pos: {
    top: '60%',
    left: '15%',
  },
  aiDot5Pos: {
    bottom: '15%',
    right: '20%',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontFamily: 'LeckerliOne_400Regular',
    fontSize: 42,
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: '#E8F4F8',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
