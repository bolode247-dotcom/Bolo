import {
    BottomSheetModal,
    BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useRef } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const BottomSheetTest = () => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const openSheet = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Bottom Sheet Debug Test</Text>

        <Button title="Open Sheet" onPress={openSheet} />

        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={['30%']}
          backgroundStyle={{ backgroundColor: '#fff' }}
        >
          <View style={styles.sheetContent}>
            <Text style={styles.sheetText}>✅ Bottom Sheet Working!</Text>
          </View>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sheetContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BottomSheetTest;
