import { Sizes } from '@/constants';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/authContex';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Replace with your flag images
const FLAG_IMAGES = {
  fr: require('../../assets/images/fr.png'),
  en: require('../../assets/images/en.png'),
};

const LanguageSelection = () => {
  const { selectedLanguage, setSelectedLanguage } = useAuth();
  const { t } = useTranslation();

  const router = useRouter();

  const handleContinue = () => {
    if (!selectedLanguage) return;
    router.push('/(auth)/userRole');
  };

  const languages = [
    { code: 'fr', label: 'French', image: FLAG_IMAGES.fr },
    { code: 'en', label: 'English', image: FLAG_IMAGES.en },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>{t('languageSelection.subtitle')}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.optionCard,
              selectedLanguage === lang.code && styles.selectedCard,
            ]}
            onPress={() => setSelectedLanguage(lang.code)}
          >
            <Image
              source={lang.image}
              style={styles.flag}
              resizeMode="contain"
            />
            <Text style={styles.label}>{lang.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.continueButton, !selectedLanguage && { opacity: 0.5 }]}
        disabled={!selectedLanguage}
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>{t('onboarding.next')}</Text>
        <Ionicons name="arrow-forward" size={28} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    paddingVertical: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginHorizontal: 20,
    justifyContent: 'center',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: Colors.gray800,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'column',
    marginHorizontal: 20,
    marginTop: 10,
    justifyContent: 'center',
    gap: Sizes.sm,
    width: '90%',
  },
  optionCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gray300,
    borderRadius: 20,
    paddingVertical: Sizes.x3sm,
    paddingHorizontal: Sizes.sm,
    marginHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  selectedCard: {
    borderColor: Colors.primary,
  },
  flag: {
    width: 40,
    height: 40,
  },
  label: {
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
    color: Colors.black,
  },
  continueButton: {
    backgroundColor: Colors.primaryDark,
    paddingVertical: Sizes.xsm,
    borderRadius: 9999,
    marginHorizontal: Sizes.md,
    alignItems: 'center',
    marginBottom: 30,
    flexDirection: 'row',
    gap: Sizes.xsm,
    justifyContent: 'center',
    width: '90%',
    marginVertical: Sizes.x6l,
  },
  continueText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
  },
});

export default LanguageSelection;
