import { removeAvatar, updateUserAvatar } from '@/appwriteFuncs/usersFunc';
import ConfirmModal from '@/component/ConfirmModal';
import CustomMenu from '@/component/CustomMenu';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import { useToast } from '@/context/ToastContext';
import { viewImage } from '@/Utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileSettings = () => {
  const { user, fetchData } = useAuth();
  const { showToast } = useToast();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [custMenuVisible, setCustMenuVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const avatarUri = user?.avatar || user?.logo;

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', // image, video, pdf
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      try {
        setIsUploading(true);
        setSelectedImage(uri);
        setCustMenuVisible(false);
        await updateUserAvatar(uri, user?.$id);
        showToast('Profile picture updated successfully', 'success');
        await fetchData();
      } catch (err: any) {
        showToast(err.message, 'error');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const takePhotoWithCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return showToast('Camera permission not granted', 'error');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5,
    });

    console.log(result);

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      try {
        setIsUploading(true);
        setSelectedImage(uri);
        setCustMenuVisible(false);
        await updateUserAvatar(uri, user?.$id);
        showToast('Profile picture updated successfully', 'success');
        await fetchData();
      } catch (err: any) {
        showToast(err.message, 'error');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setIsUploading(true);
      setImageModalVisible(false);
      await removeAvatar(user?.$id);
      setSelectedImage(null);
      showToast('Profile picture deleted successfully', 'success');
      await fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };
  const InfoRow = ({ label, value, icon, onEdit }: any) => (
    <TouchableOpacity style={styles.infoRow} onPress={onEdit}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Ionicons
          name={icon}
          size={25}
          color={Colors.gray600}
          style={styles.icon}
        />
        <View style={{ width: '80%' }}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value} numberOfLines={1}>
            {value || 'Not set'}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={onEdit}>
        <Ionicons name="create-outline" size={22} color={Colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        <View>
          {avatarUri || selectedImage ? (
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={() => setImageModalVisible(true)}
            >
              <Image
                source={{
                  uri: selectedImage
                    ? selectedImage
                    : avatarUri
                      ? viewImage(avatarUri)
                      : undefined,
                }}
                style={styles.avatar}
              />
              {isUploading && (
                <View style={styles.overlay}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <Ionicons
              name="person-circle-outline"
              size={100}
              color={Colors.gray400}
            />
          )}
        </View>

        <TouchableOpacity onPress={() => setCustMenuVisible(true)}>
          <Text style={styles.editText}>
            {user?.avatar || selectedImage ? 'Edit Photo' : 'Add Photo'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.section}>
        <InfoRow
          label="Name"
          value={user?.name}
          icon="person-outline"
          onEdit={() => router.push('/(profile)/EditName')}
        />

        <InfoRow
          label="About"
          value={user?.bio || 'Hey there!'}
          icon="information-circle-outline"
          onEdit={() => router.push('/(profile)/EditBio')}
        />

        <InfoRow
          label="Phone"
          value={user?.phoneNumber || '6xx xxx xxx'}
          icon="call-outline"
          onEdit={() => router.push('/(profile)/EditPhone')}
        />
      </View>

      <CustomMenu
        visible={custMenuVisible}
        onClose={() => setCustMenuVisible(false)}
        menuItems={[
          {
            label: 'Choose from Gallery',
            icon: 'images-outline',
            onPress: pickImageFromGallery,
          },
          {
            label: 'Take Photo',
            icon: 'camera-outline',
            onPress: takePhotoWithCamera,
          },
        ]}
      />

      <Modal
        animationType="fade"
        transparent
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <SafeAreaView style={styles.modalBackground}>
          <TouchableOpacity
            style={styles.modalCloseArea}
            onPress={() => setImageModalVisible(false)}
          />
          <View
            style={{
              width: '100%',
              height: '40%',
              overflow: 'hidden',
              aspectRatio: 2 / 2,
            }}
          >
            <Image
              source={{
                uri: selectedImage
                  ? selectedImage
                  : avatarUri
                    ? viewImage(avatarUri)
                    : undefined,
              }}
              style={styles.fullImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.editButtonRow}>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: Colors.danger }]}
              onPress={() => {
                setShowConfirm(true);
              }}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.white} />
              <Text style={styles.editBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <ConfirmModal
        visible={showConfirm}
        title="Delete Photo"
        message="Are you sure you want to delete this photo?"
        confirmText="Yes"
        cancelText="No"
        onConfirm={() => {
          setShowConfirm(false);
          handleDeleteAvatar();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </SafeAreaView>
  );
};

export default ProfileSettings;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  avatarContainer: {
    alignItems: 'center',
    paddingTop: 25,
    paddingBottom: 15,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 80,
    backgroundColor: Colors.gray700,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 80,
    backgroundColor: 'rgba(0,0,0,0.3)', // semi-transparent dark overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  editText: {
    marginTop: Sizes.lg,
    color: Colors.primary,
    fontSize: Sizes.md,
    fontFamily: 'PoppinsSemiBold',
  },
  section: {
    paddingHorizontal: 15,
    marginTop: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingVertical: Sizes.md,
  },
  label: { color: Colors.text, fontSize: 13, fontFamily: 'PoppinsSemiBold' },
  value: {
    color: Colors.gray600,
    fontSize: 16,
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
  },
  // Modal styles
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.81)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullImage: { flex: 1, width: '100%', height: '100%', aspectRatio: 2 / 2 },
  editButtonRow: {
    position: 'absolute',
    bottom: 180,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  editBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  icon: { fontWeight: 'bold' },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12,
    color: '#111',
  },
  cancelText: {
    color: '#DA0037',
    fontWeight: '600',
  },
});
