import EmptyState from '@/component/EmptyState';
import { Colors } from '@/constants';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Verify = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.background,
      }}
    >
      <EmptyState
        title="Not Available"
        subtitle="This feature is not available yet"
        icon="reload"
      />
    </SafeAreaView>
  );
};

export default Verify;

const styles = StyleSheet.create({});
