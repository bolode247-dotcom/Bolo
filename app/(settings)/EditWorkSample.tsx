import {
  updateWorkSampleCaption,
  updateWorkSampleImage,
} from '@/appwriteFuncs/appwriteWorkFuncs';
import ConfirmModal from '@/component/ConfirmModal';
import CustomMenu from '@/component/CustomMenu';
import AppForm from '@/component/Form/AppForm';
import FormField from '@/component/Form/FormField';
import SubmitButton from '@/component/Form/SubmitButton';
import { Colors, Sizes } from '@/constants';
import { useToast } from '@/context/ToastContext';
import { viewImage } from '@/Utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  caption: Yup.string()
    .required('Caption is required')
    .label('Caption')
    .max(300, 'Caption cannot exceed 300 characters'),
});

const EditWorkSample = () => {
  const { postId, caption, image } = useLocalSearchParams<{
    postId: string;
    caption: string;
    image: string;
  }>();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [custMenuVisible, setCustMenuVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);

  // 🧠 Handles caption update only
  const handleUpdateCaption = async (values: any) => {
    try {
      setIsLoading(true);
      await updateWorkSampleCaption(postId, values.caption);
      showToast('Caption updated successfully', 'success');
      router.back();
    } catch (error: any) {
      console.error('Error updating caption:', error);
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 📸 Pick image from gallery and auto-update
  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.5,
    });

    setCustMenuVisible(false);

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
      await handleImageUpdate(uri, image);
    }
  };

  // 📷 Take photo with camera and auto-update
  const takePhotoWithCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return showToast('Camera permission not granted', 'error');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.5,
    });

    setCustMenuVisible(false);

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
      await handleImageUpdate(uri, image);
    }
  };

  // 🧩 Handle image upload immediately
  const handleImageUpdate = async (uri: string, image: string) => {
    try {
      setImageLoading(true);
      await updateWorkSampleImage(postId, uri, image);
      showToast('Image updated successfully', 'success');
    } catch (error: any) {
      console.error('Error updating image:', error);
      showToast(error.message, 'error');
    } finally {
      setImageLoading(false);
    }
  };
  return (
    <SafeAreaView
      edges={['bottom']}
      style={{ flex: 1, padding: Sizes.sm, backgroundColor: Colors.background }}
    >
      <AppForm
        initialValues={{
          caption: caption,
        }}
        onSubmit={handleUpdateCaption}
        validationSchema={validationSchema}
      >
        <View style={styles.inputContainer}>
          <View>
            <FormField
              name="caption"
              label="Caption"
              placeholder="Enter a title"
              inputContainer={styles.inputStyle}
              multiline
              numberOfLines={6}
            />

            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => {
                if (selectedImage) {
                  setShowConfirm(true);
                } else {
                  setCustMenuVisible(true);
                }
              }}
            >
              {selectedImage || image ? (
                <View style={styles.image}>
                  <Image
                    source={{
                      uri: selectedImage
                        ? selectedImage
                        : image
                          ? viewImage(image)
                          : undefined,
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                  {imageLoading && (
                    <View style={styles.overlay}>
                      <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.noImageContainer}>
                  <Ionicons
                    name="images-outline"
                    size={50}
                    color={Colors.primary}
                  />
                  <Text style={styles.noImageText}>Click to add image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <SubmitButton
            title="Save Changes"
            style={styles.btnStyle}
            isLoading={isLoading}
          />
        </View>
      </AppForm>
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
      <ConfirmModal
        visible={showConfirm}
        title="Change image"
        message="Are you sure you want to change this image?"
        confirmText="Yes"
        cancelText="No"
        onConfirm={() => {
          setShowConfirm(false);
          setSelectedImage('');
          setCustMenuVisible(true);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </SafeAreaView>
  );
};

export default EditWorkSample;

const styles = StyleSheet.create({
  inputStyle: {
    borderRadius: Sizes.sm,
  },
  btnStyle: {
    borderRadius: Sizes.sm,
    marginVertical: Sizes.md,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Sizes.md,
    width: '100%',
    height: 200,
    borderRadius: Sizes.sm,
    overflow: 'hidden',
    backgroundColor: Colors.gray200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Sizes.sm,
    backgroundColor: 'rgba(0,0,0,0.3)', // semi-transparent dark overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Sizes.md,
    width: '100%',
    height: 200,
    gap: Sizes.sm,
  },
  noImageText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: Colors.primary,
  },
});
