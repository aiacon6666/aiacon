import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Colors from '../theme/colors';

function SectionTabs({ tabs, active, onSelect }) {
  const indicatorPos = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(indicatorPos, {
      toValue: active,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [active]);

  return (
    <View style={styles.container}>
      {tabs.map((tab, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.tab, active === i && styles.activeTab]}
          onPress={() => onSelect(i)}
        >
          <Text style={[styles.tabText, active === i && styles.activeText]}>{tab}</Text>
        </TouchableOpacity>
      ))}
      <Animated.View
        style={[
          styles.indicator,
          {
            transform: [
              {
                translateX: indicatorPos.interpolate({
                  inputRange: [0, tabs.length - 1],
                  outputRange: [0, (tabs.length - 1) * (100 / tabs.length)],
                }),
              },
            ],
            width: `${100 / tabs.length}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    position: 'relative',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {},
  tabText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  activeText: {
    color: Colors.text,
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});

export default SectionTabs;
