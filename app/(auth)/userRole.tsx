import { Sizes } from '@/constants';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const UserRole = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<
    'recruiter' | 'worker' | null
  >(null);

  const roles: { id: 'recruiter' | 'worker'; label: string }[] = [
    {
      id: 'recruiter',
      label: "Yes, I'm hiring",
    },
    {
      id: 'worker',
      label: "No, I'm a job seeker",
    },
  ];

  const handleContinue = () => {
    if (!selectedRole) return;
    router.push({ pathname: './signUp', params: { role: selectedRole } });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>Are you hiring?</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {roles.map((role) => {
          const isSelected = selectedRole === role.id;

          return (
            <TouchableOpacity
              key={role.id}
              style={[styles.optionCard, isSelected && styles.selectedCard]}
              onPress={() => setSelectedRole(role.id)}
              activeOpacity={0.8}
            >
              {/* Radio Button */}
              <View
                style={[
                  styles.radioOuter,
                  isSelected && styles.radioOuterSelected,
                ]}
              >
                {isSelected && <View style={styles.radioInner} />}
              </View>

              <Text style={styles.label}>{role.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Continue */}
      <TouchableOpacity
        style={[styles.continueButton, !selectedRole && { opacity: 0.5 }]}
        disabled={!selectedRole}
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>{t('userRole.continue')}</Text>
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

  /* Header */
  header: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: Sizes.sm,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: Colors.gray800,
    textAlign: 'center',
  },

  /* Options */
  optionsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: Sizes.md,
    width: '90%',
    marginTop: Sizes.sm,
  },
  optionCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gray300,
    borderRadius: Sizes.sm,
    paddingVertical: Sizes.x2sm,
    paddingHorizontal: Sizes.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  selectedCard: {
    borderColor: Colors.primary,
  },

  /* Radio */
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },

  /* Label */
  label: {
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
    color: Colors.black,
  },

  /* Continue */
  continueButton: {
    backgroundColor: Colors.primaryDark,
    paddingVertical: Sizes.xsm,
    borderRadius: 9999,
    alignItems: 'center',
    flexDirection: 'row',
    gap: Sizes.xsm,
    justifyContent: 'center',
    width: '90%',
    marginTop: Sizes.x6l,
  },
  continueText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
  },
});

export default UserRole;
