import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ImageFooter = ({ caption }: { caption?: string }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        padding: 16,
        paddingBottom: insets.bottom + 8, // <— avoids jump
      }}
    >
      <Text style={{ color: 'white', textAlign: 'center' }}>
        {caption || ''}
      </Text>
    </View>
  );
};

export default ImageFooter;
