import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

function GenderScreen({ navigation, route }) {
  const params = route.params || {};
  const [selected, setSelected] = useState('');

  function handleContinue() {
    navigation.navigate('Persona', { ...params, gender: selected || 'Prefer not to say' });
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.step}>Step 4 of 6</Text>
      <Text style={styles.title}>How do you identify?</Text>
      <Text style={styles.subtitle}>This helps personalize your experience.</Text>

      {GENDERS.map(g => {
        const isSelected = selected === g;
        return (
          <TouchableOpacity
            key={g}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => setSelected(g)}
          >
            <Text style={[styles.optionText, isSelected && { color: Colors.text }]}>{g}</Text>
            {isSelected && <Ionicons name="checkmark-circle" size={22} color={Colors.accent} />}
          </TouchableOpacity>
        );
      })}

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
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 15,
    marginBottom: 12, borderWidth: 1, borderColor: Colors.border,
  },
  optionSelected: { borderColor: Colors.accent, backgroundColor: 'rgba(159,122,234,0.1)' },
  optionText: { color: Colors.textSecondary, fontSize: 15, fontFamily: 'FiraCode-Regular' },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  btnText: { color: Colors.text, fontSize: 16, fontWeight: '700', fontFamily: 'FiraCode-Regular' },
});

export default GenderScreen;
