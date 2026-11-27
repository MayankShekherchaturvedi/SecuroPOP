import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { POLICY_OPTIONS, usePolicy } from '../context/PolicyContext';

export default function ApkStudioScreen() {
  const { policy, isLoaded, togglePolicy, enabledCount, totalCount } = usePolicy();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>APK Studio</Text>
        <Text style={styles.sectionSubtitle}>
          Configure Android 14+ runtime guardrails and inspect APK packages on-device
        </Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Security Policy Layers</Text>
            <Text style={styles.countBadge}>
              {isLoaded ? `${enabledCount}/${totalCount} Active` : 'Loading...'}
            </Text>
          </View>

          {POLICY_OPTIONS.map((option) => {
            const enabled = Boolean(policy[option.key]);
            return (
              <View key={option.key} style={styles.toggleRow}>
                <View style={styles.toggleTextWrap}>
                  <Text style={styles.toggleLabel}>{option.label}</Text>
                  <Text style={styles.toggleDescription}>{option.description}</Text>
                </View>
                <Switch
                  value={enabled}
                  onValueChange={() => togglePolicy(option.key)}
                  trackColor={{ false: '#334155', true: '#0284c7' }}
                  thumbColor={enabled ? '#38bdf8' : '#cbd5e1'}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  scrollContent: {
    padding: 16,
    gap: 14
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc'
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#94a3b8'
  },
  card: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    gap: 12
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc'
  },
  countBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12
  },
  toggleTextWrap: {
    flex: 1,
    gap: 2
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc'
  },
  toggleDescription: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 17
  }
});
