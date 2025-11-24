import { getOrCreateChat } from '@/appwriteFuncs/appwriteGenFunc';
import { updateApplicantStatus } from '@/appwriteFuncs/appwriteJobsFuncs';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import { useToast } from '@/context/ToastContext';
import { Location } from '@/types/genTypes';
import { getInitials, getRandomPastelColor } from '@/Utils/Formatting';
import { viewImage } from '@/Utils/helpers';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from './CustomButton';

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

// Utility to get initials from a name

const AppCard = ({ app, onPress, onStatusChange, jobId }: Props) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [status, setStatus] = React.useState(app?.status);
  const [loading, setLoading] = React.useState(false);

  const initials = app?.name ? getInitials(app?.name) : '';

  const handleSelect = async () => {
    setLoading(true);
    try {
      const success = await updateApplicantStatus(app.id, 'seen');
      if (success) {
        showToast('Application shortlisted successfully', 'success');
        setStatus('seen');
        onStatusChange?.(app.id, 'seen');
      }
    } catch (error: any) {
      console.error('❌ handleSelect error:', error);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
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
          <View
            style={[
              styles.logoContainer,
              { backgroundColor: getRandomPastelColor() },
            ]}
          >
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
