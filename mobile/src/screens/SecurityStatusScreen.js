import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { POLICY_OPTIONS, usePolicy } from '../context/PolicyContext';

export default function SecurityStatusScreen() {
  const { policy, enabledCount, totalCount } = usePolicy();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Security Status</Text>
        <Text style={styles.sectionSubtitle}>
          Active SecuroPOP policy configuration ({enabledCount}/{totalCount} enabled)
        </Text>

        <View style={styles.badgeCard}>
          <View style={styles.badgeHeader}>
            <Text style={styles.badgeLabel}>Android 14+ Target</Text>
            <View style={[styles.pill, styles.pillInfo]}>
              <Text style={[styles.pillText, styles.pillTextInfo]}>API 34+ Ready</Text>
            </View>
          </View>
          <Text style={styles.badgeDetail}>
            Baseline configuration targeting the Android 14+ security model.
          </Text>
        </View>

        {POLICY_OPTIONS.map((option) => {
          const enabled = Boolean(policy[option.key]);
          return (
            <View key={option.key} style={styles.badgeCard}>
              <View style={styles.badgeHeader}>
                <Text style={styles.badgeLabel}>{option.label}</Text>
                <View
                  style={[styles.pill, enabled ? styles.pillActive : styles.pillPending]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      enabled ? styles.pillTextActive : styles.pillTextPending
                    ]}
                  >
                    {enabled ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <Text style={styles.badgeDetail}>{option.description}</Text>
            </View>
          );
        })}
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
    gap: 12
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc'
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 4
  },
  badgeCard: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    gap: 6
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  badgeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
    flex: 1
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1
  },
  pillInfo: {
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
    borderColor: 'rgba(56, 189, 248, 0.4)'
  },
  pillActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
    borderColor: 'rgba(34, 197, 94, 0.4)'
  },
  pillPending: {
    backgroundColor: 'rgba(148, 163, 184, 0.14)',
    borderColor: '#475569'
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600'
  },
  pillTextInfo: {
    color: '#38bdf8'
  },
  pillTextActive: {
    color: '#86efac'
  },
  pillTextPending: {
    color: '#cbd5e1'
  },
  badgeDetail: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 19
  }
});
