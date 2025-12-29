import { addWorkSample } from '@/appwriteFuncs/appwriteWorkFuncs';
import ConfirmModal from '@/component/ConfirmModal';
import CustomMenu from '@/component/CustomMenu';
import AppForm from '@/component/Form/AppForm';
import FormField from '@/component/Form/FormField';
import SubmitButton from '@/component/Form/SubmitButton';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import { useToast } from '@/context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  caption: Yup.string()
    .required('Caption is required')
    .label('Caption')
    .max(300, 'Caption cannot exceed 300 characters'),
});

const AddPost = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [custMenuVisible, setCustMenuVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAddPost = async (values: any) => {
    if (!selectedImage) {
      return showToast('Please select an image', 'error');
    }
    try {
      setIsLoading(true);
      await addWorkSample(user?.workers?.$id, values.caption, selectedImage);
      showToast('Post added successfully', 'success');
      router.back();
    } catch (error: any) {
      console.error('Error adding post:', error);
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setCustMenuVisible(false);
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
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
      quality: 0.5,
    });

    console.log(result);

    if (!result.canceled) {
      setCustMenuVisible(false);
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
    }
  };
  return (
    <SafeAreaView
      edges={['bottom']}
      style={{ flex: 1, padding: Sizes.sm, backgroundColor: Colors.background }}
    >
      <AppForm
        initialValues={{
          caption: '',
        }}
        onSubmit={handleAddPost}
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
              {selectedImage ? (
                <View style={styles.image}>
                  <Image
                    source={{ uri: selectedImage }}
                    style={{ width: '100%', height: '100%' }}
                  />
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
            title="Create Post"
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

export default AddPost;

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
