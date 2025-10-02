import { Ionicons } from '@expo/vector-icons';

export interface SubmitButtonProps {
  title: string;
  isLoading?: boolean;
  style?: object;
  IconRight?: keyof typeof Ionicons.glyphMap;
  IconLeft?: React.ElementType;
  disabled?: boolean;
}
