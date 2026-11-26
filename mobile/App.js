import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppHomeScreen from './src/screens/AppHomeScreen';
import SecurityStatusScreen from './src/screens/SecurityStatusScreen';

const TABS = [
  { id: 'home', label: 'App Home', Component: AppHomeScreen },
  { id: 'status', label: 'Security Status', Component: SecurityStatusScreen }
];

export default function App() {
  const [activeTabId, setActiveTabId] = useState(TABS[0].id);
  const currentTab = TABS.find((tab) => tab.id === activeTabId) || TABS[0];
  const ActiveScreen = currentTab.Component;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.appTitle}>SecuroPOP</Text>
        <Text style={styles.appSubtitle}>Android 14+ Protected Workspace</Text>
      </View>

      <View style={styles.content}>
        <ActiveScreen />
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = tab.id === currentTab.id;
          return (
            <Pressable
              key={tab.id}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTabId(tab.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  header: {
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc'
  },
  appSubtitle: {
    fontSize: 12,
    color: '#38bdf8',
    marginTop: 2
  },
  content: {
    flex: 1
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: 'transparent'
  },
  tabButtonActive: {
    borderTopColor: '#38bdf8'
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8'
  },
  tabLabelActive: {
    color: '#38bdf8'
  }
});
