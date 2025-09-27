import { Colors, Sizes } from '@/constants';
import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const BanerSection = () => {
  return (
    <ImageBackground
      source={require('@/assets/images/workerBarner.png')} // replace with your banner image
      style={styles.banner}
      imageStyle={styles.bannerImage}
    >
      <View style={styles.overlayContent}>
        <Text style={styles.title}>Find the Best Workers</Text>
        <Text style={styles.subtitle}>
          Connect with top talent quickly and easily.
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default BanerSection;

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: 180, // adjust as needed
    marginVertical: Sizes.md,
    justifyContent: 'center',
  },
  bannerImage: {
    borderRadius: Sizes.sm,
    resizeMode: 'cover',
  },
  overlayContent: {
    borderRadius: Sizes.sm,
    flex: 1,
    justifyContent: 'center',
    paddingLeft: Sizes.lg,
    paddingRight: Sizes.sm,
    alignItems: 'flex-start', // ensures everything stays to the left
    backgroundColor: 'rgba(0,0,0,0.3)', // optional subtle overlay for text contrast
  },
  title: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Sizes.xsm,
  },
  subtitle: {
    color: Colors.white,
    fontSize: 14,
    marginBottom: Sizes.sm,
    maxWidth: '70%', // keep text from colliding with the right-side image
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Sizes.xsm,
    paddingHorizontal: Sizes.md,
    borderRadius: Sizes.sm,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
