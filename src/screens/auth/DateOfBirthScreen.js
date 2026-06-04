import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';

function DateOfBirthScreen({ navigation, route }) {
  const params = route.params || {};
  const [dob, setDob] = useState(new Date(2000, 0, 1));
  const [showPicker, setShowPicker] = useState(false);

  function handleContinue() {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    if (age < 13) {
      Alert.alert('Too young', 'You must be at least 13 to use AiaCon.');
      return;
    }
    navigation.navigate('Gender', { ...params, dob: dob.toISOString() });
  }

  function formatDate(d) {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.step}>Step 3 of 6</Text>
      <Text style={styles.title}>When were you born?</Text>
      <Text style={styles.subtitle}>Your age won't be visible publicly.</Text>

      <TouchableOpacity style={styles.datePicker} onPress={() => setShowPicker(true)}>
        <Ionicons name="calendar-outline" size={20} color={Colors.accent} />
        <Text style={styles.dateText}>{formatDate(dob)}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={dob}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          minimumDate={new Date(1920, 0, 1)}
          onChange={(event, selectedDate) => {
            setShowPicker(Platform.OS === 'ios');
            if (selectedDate) setDob(selectedDate);
          }}
          themeVariant="dark"
        />
      )}

      <TouchableOpacity style={styles.btn} onPress={handleContinue}>
        <Text style={styles.btnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 24, paddingTop: 70 },
  back: { position: 'absolute', top: 50, left: 20 },
  step: { color: Colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 12, marginTop: 20, fontFamily: 'FiraCode-Regular' },
  title: { color: Colors.text, fontSize: 26, fontWeight: '700', marginBottom: 6, fontFamily: 'FiraCode-Regular' },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginBottom: 28, fontFamily: 'FiraCode-Regular' },
  datePicker: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 28,
  },
  dateText: { color: Colors.text, fontSize: 16, marginLeft: 12, fontFamily: 'FiraCode-Regular' },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: Colors.text, fontSize: 16, fontWeight: '700', fontFamily: 'FiraCode-Regular' },
});

export default DateOfBirthScreen;
