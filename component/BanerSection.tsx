import { Colors, Sizes } from '@/constants';
import { recruiterSlides, workerSlides } from '@/constants/banaData';

import { useAuth } from '@/context/authContex';
import React from 'react';
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
const { width } = Dimensions.get('window');

const BannerSection = () => {
  const { user } = useAuth();
  const role = user?.role; // "worker" or "recruiterBarner"

  const slides = role === 'worker' ? workerSlides : recruiterSlides;
  const backgroundImage =
    role === 'worker'
      ? require('@/assets/images/recruiterBarner.png')
      : require('@/assets/images/workerBarner.png');

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.banner}
      imageStyle={styles.bannerImage}
    >
      <Carousel
        width={width}
        height={180} // match ImageBackground height
        autoPlay
        autoPlayInterval={5000}
        loop
        pagingEnabled // ensures one full slide per swipe
        data={slides}
        renderItem={({ item }) => (
          <View style={styles.overlayContent}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.description}</Text>
            {item.button && (
              <TouchableOpacity
                style={styles.button}
                onPress={item.button.onPress}
              >
                <Text style={styles.buttonText}>{item.button.text}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </ImageBackground>
  );
};

export default BannerSection;

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: 180,
    marginVertical: Sizes.md,
    justifyContent: 'center',
    overflow: 'hidden', // no peek
  },
  overlayContent: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: Sizes.md,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: Sizes.md,
    overflow: 'hidden',
  },
  bannerImage: {
    borderRadius: Sizes.sm,
    resizeMode: 'cover',
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
