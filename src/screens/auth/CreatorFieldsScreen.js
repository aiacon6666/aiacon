import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { saveUserProfile, getCurrentUser } from '../../services/backend';

const FIELDS = ['Music','Dance','Comedy','Art','Fashion','Sports','Gaming','Education','Food','Travel','Photography','Tech','Beauty','Fitness','Other'];

export default function CreatorFieldsScreen({ navigation }) {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggle = (field) => {
    if (selected.includes(field)) setSelected(selected.filter(f => f !== field));
    else setSelected([...selected, field]);
  };

  const next = async () => {
    setLoading(true);
    try {
      const user = getCurrentUser();
      if (user) {
        await saveUserProfile(user.uid, { creatorFields: selected });
      }
      navigation.navigate('AccountType');
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What do you create?</Text>
      <Text style={styles.sub}>Select all that apply</Text>
      <View style={styles.grid}>
        {FIELDS.map(field => (
          <TouchableOpacity key={field} style={[styles.chip, selected.includes(field) && styles.chipSelected]} onPress={() => toggle(field)}>
            <Text style={[styles.chipText, selected.includes(field) && styles.chipTextSelected]}>{field}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={[styles.btn, loading && {opacity:0.6}]} onPress={next} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Saving...' : 'Continue'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('AccountType')}>
        <Text style={styles.skipLink}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A14', padding: 24 },
  title: { color: '#FFF', fontSize: 28, fontWeight: '200', textAlign: 'center', marginTop: 40, marginBottom: 8 },
  sub: { color: '#666', textAlign: 'center', marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 30 },
  chip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 24, backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#333' },
  chipSelected: { borderColor: '#0047AB', backgroundColor: '#1A1A40' },
  chipText: { color: '#AAA', fontSize: 14 },
  chipTextSelected: { color: '#FFF', fontWeight: '600' },
  btn: { backgroundColor: '#0047AB', padding: 16, borderRadius: 14, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 18 },
  skipLink: { color: '#00FFFF', textAlign: 'center', marginTop: 16, fontSize: 15 },
});
