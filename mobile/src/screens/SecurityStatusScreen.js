import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const STATUS_BADGES = [
  {
    id: 'target-sdk',
    label: 'Android 14+ Target',
    badge: 'API 34+ Ready',
    tone: 'info',
    detail: 'Baseline configuration targeting Android 14+ security model.'
  },
  {
    id: 'runtime-shield',
    label: 'Runtime Integrity Shield',
    badge: 'Placeholder',
    tone: 'pending',
    detail: 'Tamper and debugger checks will be wired in Days 2–4.'
  },
  {
    id: 'policy-sync',
    label: 'Policy Synchronization',
    badge: 'Placeholder',
    tone: 'pending',
    detail: 'Server-driven enterprise policy enforcement pending.'
  },
  {
    id: 'screen-guard',
    label: 'Capture Protection',
    badge: 'Placeholder',
    tone: 'pending',
    detail: 'FLAG_SECURE screenshot/recording policy badge placeholder.'
  }
];

export default function SecurityStatusScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Security Status</Text>
        <Text style={styles.sectionSubtitle}>
          SecuroPOP Android 14+ protection badges (Day 1 placeholders)
        </Text>

        {STATUS_BADGES.map((item) => (
          <View key={item.id} style={styles.badgeCard}>
            <View style={styles.badgeHeader}>
              <Text style={styles.badgeLabel}>{item.label}</Text>
              <View
                style={[
                  styles.pill,
                  item.tone === 'info' ? styles.pillInfo : styles.pillPending
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    item.tone === 'info' ? styles.pillTextInfo : styles.pillTextPending
                  ]}
                >
                  {item.badge}
                </Text>
              </View>
            </View>
            <Text style={styles.badgeDetail}>{item.detail}</Text>
          </View>
        ))}
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
  pillTextPending: {
    color: '#cbd5e1'
  },
  badgeDetail: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 19
  }
});
