import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, images, Sizes } from '../constants';

const LoadingScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={
            typeof images.logo === 'string' ? { uri: images.logo } : images.logo
          }
          resizeMode="contain"
        />
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>from Uniforge</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 160, // Adjust the logo size to your preference
    height: 160,
  },
  spinnerContainer: {
    marginTop: Sizes.xsm,
    alignItems: 'center',
  },
  footerContainer: {
    position: 'absolute',
    bottom: '10%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.gray500,
    fontFamily: 'PoppinsBold',
  },
});

export default LoadingScreen;
