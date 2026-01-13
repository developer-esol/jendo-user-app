import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { Header } from '../../../common/components/ui';
import { COLORS } from '../../../config/theme.config';
import { ChatMessage } from '../../../types/models';
import { wellnessApi } from '../services/wellnessApi';
import { wellnessStyles as styles } from '../components';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'initial',
  role: 'assistant',
  content: "Hello! I'm the Jendo Health Assistant. I can help you with questions about cardiovascular health, the Jendo Health Test, preventive care, and general wellness. How can I assist you today?",
  timestamp: new Date().toISOString(),
};

const QUICK_QUESTIONS = [
  "What is the Jendo Health Test?",
  "How does Jendo measure heart health?",
  "What is a Vascular Health Score?",
  "Tips for heart-healthy living?",
];

export const ChatbotScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const history = updatedMessages
        .filter(m => m.id !== 'initial')
        .map(m => ({ role: m.role, content: m.content }));
      
      const response = await wellnessApi.sendChatMessage(text, history.slice(0, -1));
      setMessages(prev => [...prev, response]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I apologize, but I'm having trouble responding right now. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.avatarBot}>
            <Ionicons name="heart" size={20} color={COLORS.white} />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleBot]}>
          <Text style={[styles.messageText, isUser && styles.messageTextUser]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper safeArea padded={false}>
      <Header title="Health Assistant" showBack />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.typingIndicator}>
                <View style={styles.avatarBot}>
                  <Ionicons name="heart" size={20} color={COLORS.white} />
                </View>
                <View style={styles.typingBubble}>
                  <Text style={styles.typingText}>Typing...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {messages.length === 1 && (
          <View style={styles.quickQuestions}>
            <Text style={styles.quickQuestionsLabel}>Quick Questions</Text>
            <View style={styles.quickQuestionsGrid}>
              {QUICK_QUESTIONS.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickQuestionChip}
                  onPress={() => sendMessage(question)}
                >
                  <Text style={styles.quickQuestionText}>{question}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask a health question..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons name="send" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};
