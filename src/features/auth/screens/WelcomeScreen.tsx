import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { authStyles as styles } from '../components';

const ONBOARDING_KEY = 'hasSeenOnboarding';

const ONBOARDING_SLIDES = [
  {
    id: 1,
    icon: 'pulse-outline' as keyof typeof Ionicons.glyphMap,
    title: 'Welcome to Jendo',
    description: 'Your trusted companion for cardiovascular health monitoring and management.',
  },
  {
    id: 2,
    icon: 'heart-outline' as keyof typeof Ionicons.glyphMap,
    title: 'Track Your Health',
    description: 'Monitor your heart health with regular Jendo tests and get personalized insights.',
  },
  {
    id: 3,
    icon: 'trending-up-outline' as keyof typeof Ionicons.glyphMap,
    title: 'Stay Informed',
    description: 'Receive wellness recommendations and connect with healthcare professionals.',
  },
];

export const WelcomeScreen: React.FC = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
    }
  };

  const handleNext = async () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await completeOnboarding();
      router.replace('/auth/login');
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/auth/login');
  };

  const slide = ONBOARDING_SLIDES[currentSlide];
  const isLastSlide = currentSlide === ONBOARDING_SLIDES.length - 1;

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.white}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.headerCentered}>
          <Text style={styles.logoLarge}>JENDO</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name={slide.icon} size={64} color={COLORS.primary} />
            </View>
          </View>

          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

        <View style={styles.onboardingFooter}>
          <View style={styles.pagination}>
            {ONBOARDING_SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentSlide && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {isLastSlide ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};
