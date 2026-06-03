import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';

const DateOfBirthScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, email, username, fullName } = route.params;
  const [date, setDate] = useState(new Date(2000, 0, 1));
  const [showPicker, setShowPicker] = useState(false);

  const onChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050A30' }}>
      <LinearGradient colors={['#050A30', '#0A0A14']} style={{ flex: 1, padding: 24 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={28} color="#9F7AEA" />
        </TouchableOpacity>
        <Text style={{ fontSize: 32, color: '#FFF', fontWeight: '700', marginBottom: 8 }}>Date of birth</Text>
        <Text style={{ color: '#aaa', marginBottom: 32 }}>This helps personalize your experience</Text>

        <TouchableOpacity onPress={() => setShowPicker(true)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Ionicons name="calendar-outline" size={20} color="#888" />
          <Text style={{ color: '#FFF', marginLeft: 12, flex: 1 }}>{date.toDateString()}</Text>
          <Ionicons name="chevron-down" size={20} color="#888" />
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onChange} />
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Gender', { userId, email, username, fullName, dob: date })} style={{ marginTop: 32, backgroundColor: '#5B4BFF', borderRadius: 30, height: 56, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Next</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default DateOfBirthScreen;
