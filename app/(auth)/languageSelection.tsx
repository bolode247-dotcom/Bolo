import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Replace with your flag images
const FLAG_IMAGES = {
  fr: require('../../assets/images/fr.png'),
  en: require('../../assets/images/en.png'),
};

const LanguageSelection = () => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<'fr' | 'en' | null>(
    null,
  );
  const router = useRouter();

  const handleContinue = () => {
    if (!selectedLanguage) return;

    // Save language to AsyncStorage or AuthContext here
    router.push('/(auth)/signIn');
  };

  const languages = [
    { code: 'fr', label: 'French', image: FLAG_IMAGES.fr },
    { code: 'en', label: 'English', image: FLAG_IMAGES.en },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('languageSelection.title')}</Text>
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
            onPress={() => setSelectedLanguage(lang.code as 'fr' | 'en')}
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
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'PoppinsExtraBold',
    color: Colors.black,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: Colors.gray800,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 50,
  },
  optionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gray300,
    borderRadius: 20,
    paddingVertical: 30,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCard: {
    borderColor: Colors.primary,
  },
  flag: {
    width: 60,
    height: 40,
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
    color: Colors.black,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
  },
  continueText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
  },
});

export default LanguageSelection;
