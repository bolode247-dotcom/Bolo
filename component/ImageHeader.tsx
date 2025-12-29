import Colors from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ImageHeader = ({
  onDelete,
  onEdit,
}: {
  onDelete: () => void;
  onEdit: () => void;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        top: insets.top + 8,
        right: 16,
        flexDirection: 'row',
        gap: 20,
        zIndex: 10,
      }}
    >
      <Pressable onPress={onEdit}>
        <MaterialCommunityIcons
          name="pencil-outline"
          size={22}
          color={Colors.white}
        />
      </Pressable>

      <Pressable onPress={onDelete}>
        <Ionicons name="trash-outline" size={22} color={Colors.white} />
      </Pressable>
    </View>
  );
};

export default ImageHeader;
