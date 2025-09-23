import { useAuth } from '@/context/authContex';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Index = () => {
  const { user } = useAuth();
  return (
    <View>
      <Text>welcome {user?.fullName}</Text>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({});
