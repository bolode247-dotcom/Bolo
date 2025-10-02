import { Colors, Sizes } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { useFormikContext } from 'formik';
import React, { useState } from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

type PickerItem = {
  id: string | number;
  label: string;
};

interface DropdownPickerProps {
  name: string;
  label?: string;
  data: PickerItem[];
  placeholder?: string;
  containerStyle?: ViewStyle;
  inputContainer?: ViewStyle;
  labelStyle?: TextStyle;
  error?: string;
}

export default function DropdownPicker({
  name,
  label,
  data,
  placeholder = 'Select…',
  containerStyle,
  labelStyle,
  error,
  inputContainer,
}: DropdownPickerProps) {
  const formikContext = useFormikContext<Record<string, any>>();
  const formik = name ? formikContext : undefined;

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(
    data.map((d) => ({ label: d.label, value: d.id })),
  );

  const value = formik?.values[name] ?? null;

  const displayError =
    error || (name && formik?.touched[name] && formik?.errors[name]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <DropDownPicker
        mode="SIMPLE"
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={(callbackOrValue) => {
          const newValue =
            typeof callbackOrValue === 'function'
              ? callbackOrValue(formik?.values[name])
              : callbackOrValue;
          formik?.setFieldValue(name, newValue);
        }}
        setItems={setItems}
        placeholder={placeholder}
        style={[styles.dropdown, inputContainer]}
        dropDownContainerStyle={styles.dropdownContainer}
        listItemContainerStyle={{ justifyContent: 'flex-start' }}
        textStyle={styles.input}
        listMode="SCROLLVIEW"
        maxHeight={200}
        scrollViewProps={{
          nestedScrollEnabled: true,
        }}
        ArrowDownIconComponent={({ style }) => (
          <Ionicons name="chevron-down" size={24} color={Colors.gray600} />
        )}
        ArrowUpIconComponent={({ style }) => (
          <Ionicons name="chevron-up" size={24} color={Colors.gray600} />
        )}
      />

      {displayError ? (
        <Text style={styles.error}>{displayError as string}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8, width: '100%' },
  label: {
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
    color: Colors.gray800,
    marginBottom: 4,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.gray600,
    borderRadius: 9999,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    height: 50,
  },
  dropdownContainer: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray600,
    borderRadius: 12,
  },
  input: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#54585fff',
  },
  error: {
    color: Colors.danger,
    fontSize: Sizes.sm,
    marginTop: 4,
    paddingHorizontal: Sizes.lg,
  },
});
