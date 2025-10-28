import { Sizes } from '@/constants';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/authContex';
import { useToast } from '@/context/ToastContext';
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

const ChangeLanguage = () => {
  const { selectedLanguage, setSelectedLanguage } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const router = useRouter();

  const handlLanguageChange = async (code: string) => {
    if (!selectedLanguage || selectedLanguage === code) return;
    try {
      setSelectedLanguage(code);
      showToast(t('languageSelection.lanChangeSuccess'), 'success');
    } catch (error) {
      console.error('Error changing language:', error);
      showToast(t('languageSelection.lanChangeFailed'), 'error');
    }
  };

  const languages = [
    { code: 'fr', label: t('languageSelection.french'), image: FLAG_IMAGES.fr },
    {
      code: 'en',
      label: t('languageSelection.english'),
      image: FLAG_IMAGES.en,
    },
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
            onPress={() => handlLanguageChange(lang.code)}
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
  },
  optionCard: {
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
});

export default ChangeLanguage;
