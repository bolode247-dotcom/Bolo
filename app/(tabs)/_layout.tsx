import { useAuth } from '@/context/authContex';
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TabsLayout = () => {
  const { user } = useAuth();
  console.log('user', user);
  return (
    <SafeAreaView>
      <Text>welcome {user?.name}</Text>
    </SafeAreaView>
  );
};

export default TabsLayout;
