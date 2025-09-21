import { images } from '@/constants';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const UserRole = () => {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<
    'recruiter' | 'worker' | null
  >(null);
  const router = useRouter();

  const roles = [
    {
      id: 'recruiter',
      title: t('userRole.recruiter.title'),
      description: t('userRole.recruiter.description'),
      icon: 'briefcase-outline',
    },
    {
      id: 'worker',
      title: t('userRole.jobSeeker.title'),
      description: t('userRole.jobSeeker.description'),
      icon: 'person-outline',
    },
  ];

  const handleContinue = () => {
    if (!selectedRole) return;
    router.push({ pathname: './signUp', params: { role: selectedRole } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.imageWrapper}>
            <Image
              source={
                typeof images.signUpImg === 'string'
                  ? { uri: images.signUpImg }
                  : images.signUpImg
              }
              style={styles.headerImage}
              resizeMode="cover"
            />
            <View style={styles.headerTextWrapper}>
              <Text style={styles.headerTitle}>{t('userRole.title')}</Text>
              <Text style={styles.headerSubtitle}>
                {t('userRole.subtitle')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                selectedRole === role.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedRole(role.id as any)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrapper}>
                <Ionicons
                  name={role.icon as any}
                  size={40}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedRole && { backgroundColor: Colors.gray300 },
          ]}
          disabled={!selectedRole}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>{t('userRole.continue')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  headerContainer: { width: '100%' },
  imageWrapper: { position: 'relative', width: '100%', height: 250 },
  headerImage: { width: '100%', height: 250 },
  headerTextWrapper: {
    position: 'absolute',
    bottom: -10,
    left: 20,
    right: 20,
  },
  headerTitle: {
    fontSize: 28,
    color: Colors.black,
    fontFamily: 'PoppinsExtraBold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.gray800,
    fontFamily: 'PoppinsRegular',
  },
  rolesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 40,
  },
  roleCard: {
    flex: 1,
    backgroundColor: Colors.gray100,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 30,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowOpacity: 0.2,
    borderRadius: 20,
  },
  iconWrapper: {
    backgroundColor: Colors.gray200,
    padding: 15,
    borderRadius: 50,
    marginBottom: 15,
  },
  roleTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
    color: Colors.black,
    marginBottom: 5,
  },
  roleDescription: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: Colors.gray500,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 9999,
    marginHorizontal: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  continueText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
  },
});

export default UserRole;
