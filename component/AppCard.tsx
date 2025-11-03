import { getOrCreateChat } from '@/appwriteFuncs/appwriteGenFunc';
import { updateApplicantStatus } from '@/appwriteFuncs/appwriteJobsFuncs';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import { Location } from '@/types/genTypes';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from './CustomButton';
import { viewImage } from '@/Utils/helpers';

type appCardProps = {
  id: string;
  name: string;
  avatar: string | null;
  workerId: string;
  location: Location;
  skill: string;
  reason: string;
  status: string;
};

type Props = {
  jobId: string;
  catWidth?: number;
  app: appCardProps;
  onPress?: () => void;
  onStatusChange?: (id: string, status: string) => void;
};

const pastelColors = [
  '#E0D7FF',
  '#D7F5E0',
  '#FFF3D7',
  '#FFD7E0',
  '#FDE7D7',
  '#D7F0FF',
  '#FFE0F0',
  '#E0FFF3',
  '#FFF0D7',
  '#D7FFE0',
  '#F0D7FF',
];

// Utility to get initials from a name
const getInitials = (name: string) => {
  if (!name) return '';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const AppCard = ({ app, onPress, onStatusChange, jobId }: Props) => {
  // console.log('app: ', app);
  const { user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = React.useState(app?.status);
  const [loading, setLoading] = React.useState(false);
  const bgColor =
    pastelColors[Math.floor(Math.random() * pastelColors.length)] ||
    Colors.gray50;

  const initials = app?.name ? getInitials(app?.name) : '';

  const handleSelect = async () => {
    setLoading(true);
    const success = await updateApplicantStatus(app.id, 'seen');
    if (success) {
      setStatus('seen');
      onStatusChange?.(app.id, 'seen');
    }
    setLoading(false);
  };

  const handleMessage = async () => {
    console.log('jobId', jobId);
    console.log('recruiterId: ', user?.recruiters?.$id);
    console.log('worker id: ', app?.workerId);
    try {
      setLoading(true);
      const recruiterId = user?.recruiters?.$id;
      const workerId = app?.workerId;
      if (!recruiterId || !workerId || !jobId) return;
      console.log('handleMessage');

      const chat = await getOrCreateChat(recruiterId, workerId, jobId);

      router.push({
        pathname: '/messages',
        params: {
          chatId: chat?.$id,
        },
      });
    } catch (err) {
      console.error('❌ handleMessage error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { width: '100%' }]}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <View style={styles.recruiterRow}>
          <View style={[styles.logoContainer, { backgroundColor: bgColor }]}>
            {app?.avatar ? (
              <Image
                source={{ uri: viewImage(app?.avatar) }}
                style={styles.logoImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.logoText}>{initials}</Text>
            )}
          </View>
          <View>
            <Text
              style={styles.recruiterName}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {app?.name}
            </Text>
            <Text style={styles.skill}>{app?.skill}</Text>
            <Text style={styles.reason} numberOfLines={1}>
              {app?.reason}
            </Text>
          </View>
        </View>
        <View style={styles.btnColumn}>
          <CustomButton
            title="Profile"
            style={styles.btn}
            textStyle={styles.btnText}
            onPress={onPress}
          />

          {status === 'seen' ? (
            <CustomButton
              title={loading ? 'Wait...' : 'Message'}
              style={[styles.btn, { backgroundColor: Colors.white }]}
              textStyle={styles.btnText}
              textVariant="outline"
              bgVariant="outline"
              onPress={handleMessage}
            />
          ) : (
            <CustomButton
              title={loading ? 'Selecting...' : 'Select'}
              style={[styles.btn, { backgroundColor: Colors.white }]}
              textStyle={styles.btnText}
              textVariant="outline"
              bgVariant="outline"
              onPress={handleSelect}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default AppCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.sm,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.xsm,
    marginVertical: Sizes.xsm / 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recruiterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '50%',
    marginRight: Sizes.sm,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    marginRight: Sizes.sm,
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  logoText: {
    color: Colors.gray900,
    fontWeight: 'bold',
    fontSize: 16,
  },
  recruiterName: {
    fontSize: 15,
    fontFamily: 'PoppinsSemiBold',
    color: Colors.text,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: Colors.gray600,
    flexShrink: 1,
  },
  skill: {
    fontSize: 12,
    color: Colors.gray900,
    fontWeight: '600',
  },
  reason: {
    fontSize: 10,
    color: Colors.gray900,
    fontFamily: 'PoppinsRegular',
  },
  applicants: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray800,
  },
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.gray800,
    paddingHorizontal: Sizes.sm,
    paddingVertical: 3,
    marginTop: 6,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  btnColumn: {
    flexDirection: 'column',
    gap: Sizes.x3sm,
    marginLeft: Sizes.lg,
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: 100,
  },
  selectBtn: {
    marginTop: 0,
  },
  btnText: {
    fontSize: 12,
    paddingHorizontal: 2,
  },
});
