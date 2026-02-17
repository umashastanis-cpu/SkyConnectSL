import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  sources?: string[];
}

const BACKEND_URL = 'http://localhost:8000'; // Change this to your backend URL

export default function AIChatScreen({ navigation }: any) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hi! I'm SkyAI, your travel assistant. I can help you plan trips, find destinations, and answer travel questions. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      setBackendAvailable(response.ok);
    } catch (error) {
      setBackendAvailable(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      if (backendAvailable) {
        // Try to use the real AI backend
        const response = await fetch(`${BACKEND_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage.text,
            user_id: user?.uid || 'guest',
            conversation_id: `chat_${user?.uid}_${Date.now()}`,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.response || 'Sorry, I couldn\'t process that.',
            sender: 'ai',
            timestamp: new Date(),
            sources: data.sources,
          };
          setMessages((prev) => [...prev, aiMessage]);
        } else {
          throw new Error('Backend response error');
        }
      } else {
        // Fallback to predefined responses
        const aiResponse = getFallbackResponse(userMessage.text);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date(),
        };
        setTimeout(() => {
          setMessages((prev) => [...prev, aiMessage]);
          setIsLoading(false);
        }, 1000);
        return;
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "🔧 I'm having trouble connecting to my AI brain right now. The backend server might be offline. Try asking something simpler, or check back later!",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    // Destination recommendations
    if (lowerQuestion.includes('beach') || lowerQuestion.includes('island')) {
      return "🏝️ For amazing beaches, I recommend:\n\n1. Maldives - Crystal clear waters and luxury resorts\n2. Bali - Beautiful beaches with vibrant culture\n3. Seychelles - Pristine beaches and unique wildlife\n\nWould you like to see listings for any of these destinations?";
    }

    if (lowerQuestion.includes('adventure') || lowerQuestion.includes('hiking')) {
      return "🏔️ For adventure seekers:\n\n1. Swiss Alps - World-class hiking and mountain activities\n2. New Zealand - Bungee jumping, skydiving, and breathtaking landscapes\n3. Nepal - Himalayan trekking and cultural experiences\n\nShall I find some adventure tours for you?";
    }

    if (lowerQuestion.includes('budget') || lowerQuestion.includes('cheap') || lowerQuestion.includes('affordable')) {
      return "💰 Budget-friendly destinations:\n\n1. Thailand - Amazing food, beaches, and culture at great prices\n2. Vietnam - Incredible value with rich history\n3. Portugal - European charm without breaking the bank\n\nI can help you find affordable accommodations in any of these!";
    }

    if (lowerQuestion.includes('hotel') || lowerQuestion.includes('accommodation') || lowerQuestion.includes('stay')) {
      return "🏨 I can help you find the perfect place to stay! Browse our listings by tapping 'Explore' on your home screen. You can filter by:\n\n• Price range\n• Location\n• Amenities\n• Guest ratings\n\nWhat's your budget and preferred location?";
    }

    if (lowerQuestion.includes('book') || lowerQuestion.includes('reservation')) {
      return "📅 To book your perfect trip:\n\n1. Browse listings in the Explore section\n2. Select a listing you like\n3. Tap 'Book Now'\n4. Choose your dates and number of guests\n5. Complete your booking!\n\nNeed help finding a specific type of accommodation?";
    }

    if (lowerQuestion.includes('family') || lowerQuestion.includes('kids')) {
      return "👨‍👩‍👧‍👦 Family-friendly destinations:\n\n1. Orlando, USA - Theme parks galore!\n2. Tokyo, Japan - Mix of culture and entertainment\n3. Barcelona, Spain - Beaches, parks, and family activities\n\nI can filter listings to show family-friendly accommodations!";
    }

    if (lowerQuestion.includes('romantic') || lowerQuestion.includes('couple') || lowerQuestion.includes('honeymoon')) {
      return "💑 Romantic getaways:\n\n1. Paris, France - The city of love\n2. Santorini, Greece - Stunning sunsets and views\n3. Venice, Italy - Gondola rides and charm\n\nWould you like to see couples' packages?";
    }

    // Default response
    return "🤖 I can help you with:\n\n✈️ Travel recommendations\n🏖️ Destination suggestions\n🏨 Finding accommodations\n💰 Budget planning\n📅 Booking assistance\n\nWhat would you like to know? Try asking about beaches, adventures, budgets, or specific destinations!";
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.aiMessageContainer]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>🤖</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.aiMessageText]}>
            {item.text}
          </Text>
          {item.sources && item.sources.length > 0 && (
            <View style={styles.sourcesContainer}>
              <Text style={styles.sourcesLabel}>Sources:</Text>
              {item.sources.map((source, index) => (
                <Text key={index} style={styles.sourceText}>• {source}</Text>
              ))}
            </View>
          )}
        </View>
        {isUser && (
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={16} color="#FFF" />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Ask SkyAI</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: backendAvailable ? '#4CAF50' : '#FF9800' }]} />
            <Text style={styles.headerSubtitle}>
              {backendAvailable === null ? 'Checking...' : backendAvailable ? 'AI Online' : 'Offline Mode'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#667eea" />
          <Text style={styles.loadingText}>SkyAI is thinking...</Text>
        </View>
      )}

      {/* Input Container */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about travel..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          >
            <LinearGradient
              colors={inputText.trim() && !isLoading ? ['#667eea', '#764ba2'] : ['#E0E0E0', '#BDBDBD']}
              style={styles.sendButtonGradient}
            >
              <Ionicons name="send" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
  },
  menuButton: {
    marginLeft: 12,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  aiAvatarText: {
    fontSize: 16,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#4A90E2',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFF',
  },
  aiMessageText: {
    color: '#333',
  },
  sourcesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  sourcesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: '#667eea',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 15,
    color: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
