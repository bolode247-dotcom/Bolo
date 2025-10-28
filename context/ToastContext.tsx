import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useContext, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '../constants';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (
    message: string,
    type: 'success' | 'error' | 'info',
    duration?: number,
  ) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info',
    duration = 5000,
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => removeToast(id), duration);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.toastWrapper}>
        {toasts.map((toast, index) => (
          <ToastItemComp
            key={toast.id}
            toast={toast}
            index={index}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const ToastItemComp = ({
  toast,
  index,
  onDismiss,
}: {
  toast: ToastItem;
  index: number;
  onDismiss: () => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const pan = useRef(new Animated.ValueXY()).current;

  const icon =
    toast.type === 'success'
      ? 'checkmark-circle'
      : toast.type === 'error'
        ? 'alert-circle'
        : 'information-circle';

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
      onPanResponderMove: (_, g) => {
        pan.setValue({ x: g.dx, y: 0 });
      },
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > 100) {
          Animated.timing(pan, {
            toValue: { x: SCREEN_WIDTH, y: 0 },
            duration: 300,
            useNativeDriver: true,
          }).start(onDismiss);
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.toastContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateX: slideAnim },
            ...pan.getTranslateTransform(),
          ],
          top: index * 60, // ✅ stacking positioning
        },
      ]}
    >
      <Ionicons
        name={icon as any}
        size={22}
        color={
          toast.type === 'error'
            ? Colors.danger
            : toast.type === 'info'
              ? Colors.secondaryDark
              : Colors.primaryDark
        }
        style={{ marginRight: 8 }}
      />
      <Text style={styles.toastText}>{toast.message}</Text>
    </Animated.View>
  );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    right: 10,
    top: 40,
    width: '85%',
    zIndex: 9999,
  },
  toastContainer: {
    position: 'absolute',
    right: 0,
    backgroundColor: Colors.gray300,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    elevation: 8,
  },
  toastText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
});
