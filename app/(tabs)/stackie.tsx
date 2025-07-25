import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Plus, RotateCcw, Share, Copy, ThumbsUp, ThumbsDown, Sparkles, FileText, Users, Scale, BookOpen, TrendingUp, Shield, Lightbulb, MessageSquare, ArrowUp, Mic, Paperclip, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import StackieAvatar from '@/assets/images/Stackie.png';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  feedback?: 'positive' | 'negative' | null;
}

interface Suggestion {
  id: string;
  text: string;
  category: 'legal' | 'strategy' | 'compliance' | 'general';
}

const SUGGESTIONS: Suggestion[] = [
  { id: '1', text: 'Explain CCMA dispute procedures', category: 'legal' },
  { id: '2', text: 'Create employment contract template', category: 'legal' },
  { id: '3', text: 'Design performance management system', category: 'strategy' },
  { id: '4', text: 'Calculate overtime under BCEA', category: 'compliance' },
  { id: '5', text: 'Draft disciplinary procedure', category: 'legal' },
  { id: '6', text: 'Develop HR strategy roadmap', category: 'strategy' },
];

const QUICK_ACTIONS = [
  { icon: FileText, label: 'Templates', color: '#3B82F6' },
  { icon: Scale, label: 'Legal', color: '#EF4444' },
  { icon: Users, label: 'Strategy', color: '#10B981' },
  { icon: Shield, label: 'Compliance', color: '#F59E0B' },
];

export default function StackieScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(!!(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY));
  }, []);

  const formatResponse = (content: string): string => {
    return content
      // Clean markdown
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      
      // Format structure
      .replace(/^(\d+\.)\s*/gm, '$1 ')
      .replace(/^[-•]\s*/gm, '• ')
      
      // Clean spacing
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const callStackieAPI = async (userMessage: string): Promise<string> => {
    try {
      if (!isConnected) {
        return `I'm Stackie, your South African HR expert. I can help with:

• Labour law compliance (BCEA, LRA, EEA)
• CCMA procedures and dispute resolution
• Employment contracts and policies
• Performance management systems
• HR strategy and transformation

To unlock my full AI capabilities with real-time analysis and personalized responses, please connect to Supabase using the button in the top right.

How can I assist you with your HR needs today?`;
      }

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase not configured');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/stackie-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_history: messages.slice(-6)
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'I apologize, but I encountered an issue. Please try again.';
    } catch (error) {
      console.error('Stackie API Error:', error);
      return `I'm experiencing a connection issue. Here's what I can help with offline:

• BCEA overtime calculations and working time regulations
• LRA disciplinary procedures and fair dismissal processes  
• EEA compliance and employment equity planning
• CCMA conciliation and arbitration procedures
• Employment contract templates and policy development

Please try your question again or check your connection for full AI capabilities.`;
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend) return;

    setShowSuggestions(false);
    setInputText('');
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await callStackieAPI(textToSend);
      const formattedResponse = formatResponse(response);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: formattedResponse,
        timestamp: new Date(),
        feedback: null,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
        feedback: null,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion: Suggestion) => {
    sendMessage(suggestion.text);
  };

  const provideFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));
  };

  const copyMessage = (content: string) => {
    // In production, use Clipboard API
    Alert.alert('Copied', 'Message copied to clipboard');
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderWelcomeState = () => (
    <View style={styles.welcomeContainer}>
      {/* Header */}
      <View style={styles.welcomeHeader}>
        <View style={styles.avatarContainer}>
          <Image source={StackieAvatar} style={styles.avatar} />
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10B981' : '#F59E0B' }]} />
        </View>
        <Text style={styles.welcomeTitle}>Hi, I'm Stackie</Text>
        <Text style={styles.welcomeSubtitle}>
          Your South African HR expert. I can help with labour law, compliance, and HR strategy.
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action, index) => (
            <TouchableOpacity key={index} style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <action.icon size={20} color={action.color} strokeWidth={2} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Suggestions */}
      <View style={styles.suggestionsContainer}>
        <Text style={styles.sectionTitle}>Suggestions</Text>
        <View style={styles.suggestions}>
          {SUGGESTIONS.slice(0, 4).map((suggestion) => (
            <TouchableOpacity
              key={suggestion.id}
              style={styles.suggestionChip}
              onPress={() => handleSuggestionPress(suggestion)}>
              <Text style={styles.suggestionText}>{suggestion.text}</Text>
              <ArrowUp size={14} color="#71717A" strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderMessage = (message: Message) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.type === 'user' ? styles.userMessage : styles.assistantMessage
    ]}>
      {message.type === 'assistant' && (
        <View style={styles.messageAvatar}>
          <Image source={StackieAvatar} style={styles.messageAvatarImage} />
        </View>
      )}
      
      <View style={[
        styles.messageBubble,
        message.type === 'user' ? styles.userBubble : styles.assistantBubble
      ]}>
        <Text style={[
          styles.messageText,
          message.type === 'user' ? styles.userText : styles.assistantText
        ]}>
          {message.content}
        </Text>
        
        {message.type === 'assistant' && (
          <View style={styles.messageActions}>
            <TouchableOpacity 
              style={styles.messageAction}
              onPress={() => copyMessage(message.content)}>
              <Copy size={14} color="#71717A" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.messageAction, message.feedback === 'positive' && styles.activeAction]}
              onPress={() => provideFeedback(message.id, 'positive')}>
              <ThumbsUp size={14} color={message.feedback === 'positive' ? '#10B981' : '#71717A'} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.messageAction, message.feedback === 'negative' && styles.activeAction]}
              onPress={() => provideFeedback(message.id, 'negative')}>
              <ThumbsDown size={14} color={message.feedback === 'negative' ? '#EF4444' : '#71717A'} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <Text style={styles.messageTime}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  const renderLoadingMessage = () => (
    <View style={[styles.messageContainer, styles.assistantMessage]}>
      <View style={styles.messageAvatar}>
        <Image source={StackieAvatar} style={styles.messageAvatarImage} />
      </View>
      <View style={[styles.messageBubble, styles.assistantBubble, styles.loadingBubble]}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="small" color="#71717A" />
          <Text style={styles.loadingText}>Stackie is thinking...</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Stackie</Text>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10B981' : '#F59E0B' }]} />
            <Text style={styles.statusText}>{isConnected ? 'Connected' : 'Limited'}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {messages.length > 0 && (
            <TouchableOpacity style={styles.headerAction} onPress={clearChat}>
              <RotateCcw size={20} color="#71717A" strokeWidth={2} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerAction}>
            <MoreHorizontal size={20} color="#71717A" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {showSuggestions ? (
          renderWelcomeState()
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}>
            {messages.map(renderMessage)}
            {isLoading && renderLoadingMessage()}
          </ScrollView>
        )}
      </View>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <View style={styles.inputActions}>
            <TouchableOpacity style={styles.inputAction}>
              <Paperclip size={20} color="#71717A" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Ask Stackie about HR, labour law, or compliance..."
            placeholderTextColor="#71717A"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={2000}
            textAlignVertical="center"
          />
          
          <View style={styles.sendActions}>
            {inputText.trim() ? (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => sendMessage()}
                disabled={isLoading}>
                <Send size={18} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.micButton}>
                <Mic size={18} color="#71717A" strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F10',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2E',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#0F0F10',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  quickActionsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  suggestionsContainer: {
    flex: 1,
  },
  suggestions: {
    gap: 12,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1D',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  suggestionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  messageContainer: {
    marginBottom: 24,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  messageAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#1A1A1D',
    borderWidth: 1,
    borderColor: '#2A2A2E',
    borderBottomLeftRadius: 4,
  },
  loadingBubble: {
    paddingVertical: 16,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  assistantText: {
    color: '#FFFFFF',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#A1A1AA',
    fontStyle: 'italic',
  },
  messageActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2E',
  },
  messageAction: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2A2A2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3E',
  },
  activeAction: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderColor: '#7C3AED',
  },
  messageTime: {
    fontSize: 11,
    color: '#71717A',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#2A2A2E',
    backgroundColor: '#0F0F10',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  inputActions: {
    flexDirection: 'row',
  },
  inputAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    maxHeight: 120,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1D',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  sendActions: {
    flexDirection: 'row',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
});