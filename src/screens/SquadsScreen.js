import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';

function SquadsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Squads</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.emoji}>👥</Text>
        <Text style={styles.heading}>No Squads Yet</Text>
        <Text style={styles.sub}>Create a squad to chat and collaborate with your crew.</Text>
        <TouchableOpacity style={styles.btn}>
          <Ionicons name="add" size={20} color={Colors.text} />
          <Text style={styles.btnText}>Create Squad</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { color: Colors.text, fontSize: 18, fontWeight: '700', marginLeft: 12, fontFamily: 'FiraCode-Regular' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emoji: { fontSize: 60, marginBottom: 16 },
  heading: { color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: 8, fontFamily: 'FiraCode-Regular' },
  sub: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24, fontFamily: 'FiraCode-Regular' },
  btn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: 14, paddingHorizontal: 22, paddingVertical: 12 },
  btnText: { color: Colors.text, fontWeight: '700', marginLeft: 8, fontFamily: 'FiraCode-Regular' },
});

export default SquadsScreen;
