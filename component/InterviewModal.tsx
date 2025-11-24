import { Colors } from '@/constants';
import { formatDate, formatTime } from '@/Utils/Formatting';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface InterviewModalProps {
  visible: boolean;
  onClose: () => void;

  selectedDate: Date;
  setSelectedDate: (date: Date) => void;

  selectedTime: Date;
  setSelectedTime: (date: Date) => void;

  interviewInstructions: string;
  setInterviewInstructions: (text: string) => void;

  onSubmit: () => void;
  loading: boolean;

  isEditing?: boolean;
}

const InterviewModal = ({
  visible,
  onClose,

  selectedDate,
  setSelectedDate,

  selectedTime,
  setSelectedTime,

  interviewInstructions,
  setInterviewInstructions,

  onSubmit,
  loading,

  isEditing = false,
}: InterviewModalProps) => {
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showTimePicker, setShowTimePicker] = React.useState(false);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            {isEditing ? 'Edit Interview' : 'Schedule Interview'}
          </Text>

          <Text style={styles.subtitle}>
            {isEditing
              ? 'Update the interview details below.'
              : 'Select a date, time, and include instructions for the interview.'}
          </Text>

          {/* Date */}
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.inputText}>
              {selectedDate ? formatDate(selectedDate) : 'Select Date'}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="calendar"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setSelectedDate(date);
              }}
            />
          )}

          {/* Time */}
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.inputText}>
              {selectedTime ? formatTime(selectedTime) : 'Select Time'}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={selectedTime || new Date()}
              mode="time"
              display="spinner"
              onChange={(event, time) => {
                setShowTimePicker(false);
                if (time) setSelectedTime(time);
              }}
            />
          )}

          {/* Instructions */}
          <TextInput
            value={interviewInstructions}
            onChangeText={setInterviewInstructions}
            placeholder="Enter interview instructions (Zoom link, location...)"
            placeholderTextColor={Colors.gray600}
            multiline
            style={[styles.input, { height: 110, textAlignVertical: 'top' }]}
          />

          {/* Buttons */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: Colors.gray500 }]}
              onPress={onClose}
            >
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: Colors.success }]}
              onPress={onSubmit}
            >
              <Text style={styles.btnText}>
                {isEditing ? 'Update' : 'Schedule'}
              </Text>
              {loading && (
                <ActivityIndicator size="small" color={Colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default InterviewModal;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray500,
    marginBottom: 15,
  },
  input: {
    backgroundColor: Colors.gray200,
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  inputText: {
    color: Colors.text,
    fontSize: 15,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    gap: 6,
  },
  btnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
