import { logoutUser } from '@/appwriteFuncs/usersFunc';
import ConfirmModal from '@/component/ConfirmModal';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import { useToast } from '@/context/ToastContext';
import { viewImage } from '@/Utils/helpers';
import { Ionicons, MaterialIcons, Octicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

type SectionItem = {
  key: string;
  label: string;
  icon: IoniconsName;
  route: string;
};

const Profile: React.FC = () => {
  const { user, fetchData } = useAuth();
  const { showToast } = useToast();
  const [lan, setLan] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const { t } = useTranslation();

  const DATA: { title: string; data: SectionItem[] }[] = React.useMemo(
    () => [
      {
        title: t('settings.sections.account'),
        data: [
          {
            key: 'skills',
            label: t('settings.items.skills'),
            icon: 'build',
            route: '/(settings)/EditSkill',
          },
          {
            key: 'workSamples',
            label: t('settings.items.workSamples'),
            icon: 'images',
            route: '/(settings)/WorkSamples',
          },
          {
            key: 'location',
            label: t('settings.items.location'),
            icon: 'location',
            route: '/(settings)/EditLocation',
          },
          {
            key: 'verification',
            label: t('settings.items.verification'),
            icon: 'shield-checkmark',
            route: '/(settings)/Verify',
          },
          {
            key: 'credits',
            label: t('settings.items.credits'),
            icon: 'shield-checkmark',
            route: '/(settings)/Credits',
          },
          {
            key: 'changePassword',
            label: t('settings.items.changePassword'),
            icon: 'lock-closed',
            route: '/(settings)/ChangePassword',
          },
        ],
      },
      {
        title: t('settings.sections.general'),
        data: [
          {
            key: 'changeLanguage',
            label: t('settings.items.changeLanguage'),
            icon: 'language',
            route: '/(settings)/ChangeLanguage',
          },
          {
            key: 'privacyPolicy',
            label: t('settings.items.privacyPolicy'),
            icon: 'document-text',
            route: '/(settings)/PrivacyPolicy',
          },
          {
            key: 'helpCenter',
            label: t('settings.items.helpCenter'),
            icon: 'help-circle',
            route: '/(settings)/Support',
          },
          {
            key: 'logout',
            label: t('settings.items.logout'),
            icon: 'log-out',
            route: 'logout',
          },
        ],
      },
    ],
    [t],
  );

  const HIDDEN_FOR_RECRUITER = ['skills', 'workSamples', 'location', 'credits'];

  const filteredData = DATA.map((section) => ({
    ...section,
    data:
      user?.role === 'recruiter'
        ? section.data.filter(
            (item) => !HIDDEN_FOR_RECRUITER.includes(item.key),
          )
        : section.data,
  }));
  const mainSkill = user?.skills?.[`name_${lan || 'en'}`] || '';
  const otherSkills = user?.workers?.otherSkill
    ? `, ${user.workers?.otherSkill}`
    : '';

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem('appLanguage')
      .then((value) => {
        if (mounted) setLan(value);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleUserLogout = async () => {
    try {
      await logoutUser();
      showToast('Logged out successfully', 'success');
      await fetchData();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const renderAvatar = () => {
    if (user?.avatar) {
      return (
        <Image source={{ uri: viewImage(user.avatar) }} style={styles.avatar} />
      );
    }
    return (
      <Ionicons name="person-circle-outline" size={60} color={Colors.gray400} />
    );
  };
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SectionList
        sections={filteredData}
        keyExtractor={(item, index) => `${item.label}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              if (item.route === 'logout') {
                setShowConfirm(true);
              } else {
                router.push(item.route as any);
              }
            }}
          >
            <View style={styles.itemLeft}>
              <Ionicons
                name={item.icon}
                size={20}
                color={Colors.primaryDark}
                style={[
                  styles.itemIcon,
                  item.icon === 'log-out' && {
                    color: Colors.danger,
                    backgroundColor: Colors.dangerLight,
                  },
                ]}
              />
              <Text
                style={[
                  styles.itemText,
                  item.icon === 'log-out' ? { color: Colors.danger } : {},
                ]}
              >
                {item.label}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={18}
              color={Colors.gray700}
            />
          </TouchableOpacity>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        ListHeaderComponent={() => (
          <TouchableOpacity
            style={styles.listHeader}
            onPress={() => router.push('/(profile)/profileSettings')}
          >
            <View style={styles.headerRow}>
              {renderAvatar()}
              <View
                style={{
                  flexDirection: 'column',
                  maxWidth: 200,
                }}
              >
                <Text
                  style={{ fontFamily: 'PoppinsSemiBold', fontSize: 18 }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {user?.name}
                </Text>
                <Text
                  style={{
                    fontFamily: 'PoppinsRegular',
                    fontSize: 12,
                    color: Colors.gray800,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {mainSkill}
                  {otherSkills}
                </Text>
                <Text
                  style={{
                    fontFamily: 'PoppinsRegular',
                    fontSize: 12,
                    color: Colors.gray800,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {user?.locations?.division}, {user?.locations?.subdivision},{' '}
                  {user?.otherLocation}
                </Text>
              </View>
            </View>
            <View>
              {user?.isVerified ? (
                <MaterialIcons
                  name="verified"
                  size={24}
                  color={Colors.primary}
                />
              ) : (
                <Octicons name="unverified" size={24} color={Colors.text} />
              )}
            </View>
          </TouchableOpacity>
        )}
        style={{ flex: 1 }}
      />
      <ConfirmModal
        visible={showConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Yes"
        cancelText="No"
        onConfirm={() => {
          setShowConfirm(false);
          handleUserLogout();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  listHeader: {
    marginTop: Sizes.lg,
    height: 80,
    padding: Sizes.sm,
    backgroundColor: Colors.gray100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    marginBottom: Sizes.lg,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Sizes.md },
  section: {
    paddingTop: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: Colors.text,
    marginBottom: Sizes.xsm,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    // borderBottomWidth: 1,
    // borderColor: Colors.gray200,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIcon: {
    backgroundColor: Colors.primaryLight,
    padding: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    color: Colors.primaryDark,
    fontWeight: 'bold',
  },
  itemText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 16,
    color: Colors.text,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
});
