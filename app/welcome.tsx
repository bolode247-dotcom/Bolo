import CustomButton from '@/component/CustomButton';
import { Colors } from '@/constants';
import { useOnBoardingData } from '@/constants/onBoarding';
import { useAuth } from '@/context/authContex';
// import { useAuth } from '@/context/authContext';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';

const OnBoarding = () => {
  const { t } = useTranslation();
  const onBoarding = useOnBoardingData();
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === onBoarding.length - 1;
  const { markOnboardingComplete } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity
        onPress={async () => {
          await markOnboardingComplete();
          router.replace('/(auth)/languageSelection');
        }}
        style={styles.skipButton}
      >
        <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
      </TouchableOpacity>

      {/* Swiper */}
      <Swiper
        ref={swiperRef}
        showsPagination
        loop={false}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {onBoarding.map((item, index) => (
          <View key={index} style={styles.slide}>
            <Image
              source={
                typeof item.image === 'string'
                  ? { uri: item.image }
                  : item.image
              }
              style={styles.image}
              resizeMode="contain"
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        ))}
      </Swiper>

      {/* Button */}
      <CustomButton
        title={isLastSlide ? t('onboarding.getStarted') : t('onboarding.next')}
        bgVariant="primary"
        textVariant="default"
        onPress={async () => {
          if (isLastSlide) {
            await markOnboardingComplete();
            router.replace('/(auth)/languageSelection');
          } else {
            swiperRef.current?.scrollBy(1);
          }
        }}
        style={{ width: '90%', marginVertical: 30 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    width: '100%',
    alignItems: 'flex-end',
    padding: 20,
  },
  skipText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'PoppinsSemiBold',
  },
  dot: {
    width: 32,
    height: 4,
    marginHorizontal: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  activeDot: {
    width: 32,
    height: 4,
    marginHorizontal: 4,
    backgroundColor: Colors.primaryDark,
    borderRadius: 4,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  image: {
    width: '100%',
    height: 300,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 20,
  },
});

export default OnBoarding;
