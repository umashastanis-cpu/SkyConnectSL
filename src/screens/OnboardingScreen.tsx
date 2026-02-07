import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  Animated,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

interface OnboardingScreenProps {
  navigation: OnboardingScreenNavigationProp;
}

const ONBOARDING_DATA = [
  {
    id: 'welcome',
    type: 'welcome',
  },
  {
    id: 'ai-assistant',
    type: 'content',
    title: 'AI-Powered Travel Assistant',
    subtitle: 'Get personalized travel plans, routes, and suggestions instantly.',
    bullets: [
      { icon: 'chatbubbles-outline', text: 'Ask travel questions' },
      { icon: 'map-outline', text: 'Get custom itineraries' },
      { icon: 'bulb-outline', text: 'Smart recommendations' },
    ],
    illustration: 'ai',
  },
  {
    id: 'explore-book',
    type: 'content',
    title: 'Explore & Book in One App',
    subtitle: 'Discover destinations, hotels, transport, and local guides easily.',
    bullets: [
      { icon: 'location-outline', text: 'Popular destinations' },
      { icon: 'shield-checkmark-outline', text: 'Trusted partners' },
      { icon: 'time-outline', text: 'Real-time availability' },
    ],
    illustration: 'explore',
  },
  {
    id: 'safe-travel',
    type: 'content',
    title: 'Travel Your Way',
    subtitle: 'Manage your entire trip, from bookings to memories, in one safe place.',
    bullets: [
        { icon: 'calendar-outline', text: 'Organize schedule' },
        { icon: 'wallet-outline', text: 'Track expenses' },
        { icon: 'images-outline', text: 'Save memories' },
    ],
    illustration: 'travel',
    isLast: true,
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Responsive sizing based on screen dimensions
  const isSmallScreen = height < 700;
  const scale = Math.min(width / 390, height / 844); // iPhone 13 Pro baseline
  
  // Welcome screen background logic
  const isLandscape = width > height;
  const welcomeImage = isLandscape
    ? require('../../assets/landscape.jpg')
    : require('../../assets/Potrait.jpg');

  const scrollToNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      // State change will likely trigger re-render in AppNavigator or we can reset navigation
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const renderIllustration = (type: string) => {
    switch (type) {
      case 'ai':
        return (
          <View style={styles.illustrationContainer}>
            <View style={styles.aiImageWrapper}>
              <Image
                source={require('../../assets/AI powered.png')}
                style={styles.aiImage}
                resizeMode="cover"
              />
            </View>
          </View>
        );
      case 'explore':
        return (
          <View style={styles.illustrationContainer}>
            <View style={styles.aiImageWrapper}>
              <Image
                source={require('../../assets/explore and book in one app.png')}
                style={styles.aiImage}
                resizeMode="cover"
              />
            </View>
          </View>
        );
      case 'travel':
        return (
          <View style={styles.illustrationContainer}>
            <View style={styles.aiImageWrapper}>
              <Image
                source={require('../../assets/Travel your way.png')}
                style={styles.aiImage}
                resizeMode="cover"
              />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // Welcome Screen (Screen 1)
    if (item.type === 'welcome') {
      return (
        <View style={{ width, height, flex: 1 }}>
          <ImageBackground
            source={welcomeImage}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={styles.overlay}>
              <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                  <TouchableOpacity>
                    <Ionicons name="menu-outline" size={30} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons name="person-circle-outline" size={30} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.welcomeContentContainer}>
                  <Text style={styles.welcomeTitle}>Explore SriLanka</Text>
                  <Text style={styles.welcomeSubtitle}>
                    We are here to help you to explore SriLanka easily
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.welcomeButton}
                    onPress={scrollToNext}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.welcomeButtonText}>Lets go</Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </View>
          </ImageBackground>
        </View>
      );
    }

    // AI-Powered Screen (Screen 2)
    return (
      <View style={{ width, height, flex: 1, backgroundColor: '#FFF' }}>
        <SafeAreaView style={styles.slideContainer}>
          {/* Top Illustration Section */}
          <View style={[styles.topSection, { height: height * 0.5 }]}>
            {renderIllustration(item.illustration)}
          </View>

          {/* Bottom Content Section */}
          <View style={[styles.bottomSection, { 
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 40,
          }]}>
            <Text style={[styles.contentTitle, { fontSize: Math.max(18, 20 * scale) }]}>{item.title}</Text>
            <Text style={[styles.contentSubtitle, { fontSize: Math.max(11, 12 * scale) }]}>{item.subtitle}</Text>

            {/* Bullets */}
            {item.bullets && (
              <View style={styles.bulletsContainer}>
                {item.bullets.map((bullet: any, idx: number) => (
                  <View key={idx} style={styles.bulletItem}>
                    <View style={styles.bulletIconContainer}>
                      <Ionicons name={bullet.icon} size={16} color="#0A3D62" />
                    </View>
                    <Text style={styles.bulletText}>{bullet.text}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Note for Screen 4 */}
            {item.note && (
              <View style={styles.noteContainer}>
                <Ionicons name="lock-closed-outline" size={14} color="#666" />
                <Text style={styles.noteText}>{item.note}</Text>
              </View>
            )}

            {/* Pagination Dots */}
            <View style={styles.dotsContainer}>
              {ONBOARDING_DATA.map((_, dotIndex) => (
                <View
                  key={dotIndex}
                  style={[
                    styles.dot,
                    currentIndex === dotIndex ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>

            {/* Buttons */}
            {item.isLast ? (
              <View style={styles.lastSlideFooter}>
                 <TouchableOpacity onPress={completeOnboarding} style={styles.skipLink}>
                   <Text style={styles.skipLinkText}>Skip</Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                    style={styles.getStartedBtn}
                    onPress={completeOnboarding}
                    activeOpacity={0.8}
                 >
                    <Text style={styles.getStartedBtnText}>Get Started</Text>
                 </TouchableOpacity>
              </View>
            ) : (
             <TouchableOpacity
              style={styles.circularButton}
              onPress={scrollToNext}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="arrow-forward" 
                size={24} 
                color="#FFF" 
              />
            </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>
    );
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <StatusBar style={currentIndex === 0 ? "light" : "dark"} />
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        bounces={false}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  // Welcome Screen Styles
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  welcomeContentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: '25%',
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: '80%',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  welcomeButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  welcomeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Slide Styles
  slideContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  topSection: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomSection: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  illustrationContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  beachScene: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  explorerScene: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  aiImageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  aiImage: {
    width: '100%',
    height: '100%',
  },
  natureScene: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  illustrationEmoji: {
    fontSize: 60,
  },
  floatingCard: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardIcon: {
    fontSize: 24,
  },
  phoneMockup: {
    width: 120,
    height: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  illustrationCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  miniIcon: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4DD0E1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  contentTitle: {
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  contentSubtitle: {
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
    maxWidth: '100%',
    paddingHorizontal: 5,
  },
  bulletsContainer: {
    width: '100%',
    paddingHorizontal: 5,
    marginBottom: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 10,
  },
  bulletIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E1F5FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bulletText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#4A90E2',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#D1D1D6',
  },
  circularButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0A3D62',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    alignSelf: 'center',
    marginTop: 5,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    gap: 8,
    marginHorizontal: 5,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    lineHeight: 16,
  },
  lastSlideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
    marginTop: 10,
  },
  skipLink: {
    padding: 10,
  },
  skipLinkText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  getStartedBtn: {
    backgroundColor: '#0A3D62',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 2,
    minWidth: 140,
    alignItems: 'center',
  },
  getStartedBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextCircleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  skipButton: {
    padding: 15,
  },
  skipText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },

});

export default OnboardingScreen;
