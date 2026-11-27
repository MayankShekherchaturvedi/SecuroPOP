import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { POLICY_OPTIONS, usePolicy } from '../context/PolicyContext';
import {
  buildReadinessChecklist,
  getSampleApkProfile,
  inspectApkFile
} from '../utils/apkInspector';

const CHECKLIST_BADGE_MAP = {
  pass: { label: 'PASS', pillStyle: 'badgePass', textStyle: 'badgePassText' },
  warn: { label: 'REVIEW', pillStyle: 'badgeWarn', textStyle: 'badgeWarnText' },
  fail: { label: 'FAIL', pillStyle: 'badgeFail', textStyle: 'badgeFailText' }
};

export default function ApkStudioScreen() {
  const { policy, isLoaded, togglePolicy, enabledCount, totalCount } = usePolicy();
  const [inspection, setInspection] = useState(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSelectApk() {
    setErrorMessage('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.android.package-archive', '*/*'],
        copyToCacheDirectory: true
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setIsInspecting(true);
      const report = await inspectApkFile(result.assets[0]);
      setInspection(report);
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to inspect selected APK file.');
    } finally {
      setIsInspecting(false);
    }
  }

  function handleLoadSample() {
    setErrorMessage('');
    setInspection(getSampleApkProfile());
  }

  const checklist = buildReadinessChecklist(inspection, enabledCount, totalCount);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>APK Studio</Text>
        <Text style={styles.sectionSubtitle}>
          Configure Android 14+ runtime guardrails and inspect APK packages on-device
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>On-Device APK Inspector</Text>
          <Text style={styles.helperText}>
            Pick a local `.apk` file to verify its ZIP/APK signature and SHA-256 hash, or
            load the sample profile for offline demos.
          </Text>

          <View style={styles.buttonGroup}>
            <Pressable
              style={[styles.primaryButton, isInspecting && styles.buttonDisabled]}
              onPress={handleSelectApk}
              disabled={isInspecting}
            >
              {isInspecting ? (
                <ActivityIndicator color="#0f172a" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Select APK File</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={handleLoadSample}
              disabled={isInspecting}
            >
              <Text style={styles.secondaryButtonText}>Load Sample APK Profile</Text>
            </Pressable>
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {inspection ? (
            <View style={styles.resultBox}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Source</Text>
                <Text style={styles.sourceTag}>
                  {inspection.source === 'sample' ? 'Sample Demo Profile' : 'Device File'}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>File Name</Text>
                <Text style={styles.resultValue}>{inspection.fileName}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>File Size</Text>
                <Text style={styles.resultValue}>{inspection.formattedSize}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>APK/ZIP Signature</Text>
                <View
                  style={[
                    styles.statusPill,
                    inspection.validZipSignature ? styles.badgePass : styles.badgeFail
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      inspection.validZipSignature
                        ? styles.badgePassText
                        : styles.badgeFailText
                    ]}
                  >
                    {inspection.validZipSignature ? 'Valid PK Header' : 'Invalid Header'}
                  </Text>
                </View>
              </View>
              <View style={styles.hashBlock}>
                <Text style={styles.resultLabel}>SHA-256 Digest</Text>
                <Text style={styles.hashValue} selectable>
                  {inspection.sha256}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {checklist.length > 0 ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Android 14+ Readiness Checklist</Text>
              <Text style={styles.countBadge}>API 34+</Text>
            </View>

            {checklist.map((item) => {
              const badge = CHECKLIST_BADGE_MAP[item.status] || CHECKLIST_BADGE_MAP.warn;
              return (
                <View key={item.id} style={styles.checklistRow}>
                  <View style={styles.checklistTop}>
                    <Text style={styles.checklistTitle}>{item.title}</Text>
                    <View style={[styles.statusPill, styles[badge.pillStyle]]}>
                      <Text style={[styles.statusPillText, styles[badge.textStyle]]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.checklistDetail}>{item.detail}</Text>
                </View>
              );
            })}
          </View>
        ) : null}

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
  helperText: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18
  },
  buttonGroup: {
    gap: 8
  },
  primaryButton: {
    backgroundColor: '#38bdf8',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryButton: {
    backgroundColor: '#0f172a',
    borderColor: '#38bdf8',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonDisabled: {
    opacity: 0.7
  },
  primaryButtonText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 14
  },
  secondaryButtonText: {
    color: '#38bdf8',
    fontWeight: '600',
    fontSize: 13
  },
  errorText: {
    fontSize: 12,
    color: '#fca5a5'
  },
  resultBox: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 10
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  resultLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600'
  },
  resultValue: {
    fontSize: 13,
    color: '#f8fafc',
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right'
  },
  sourceTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38bdf8'
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700'
  },
  badgePass: {
    backgroundColor: 'rgba(34, 197, 94, 0.16)'
  },
  badgePassText: {
    color: '#86efac'
  },
  badgeWarn: {
    backgroundColor: 'rgba(245, 158, 11, 0.16)'
  },
  badgeWarnText: {
    color: '#fcd34d'
  },
  badgeFail: {
    backgroundColor: 'rgba(239, 68, 68, 0.16)'
  },
  badgeFailText: {
    color: '#fca5a5'
  },
  hashBlock: {
    gap: 4
  },
  hashValue: {
    fontSize: 11,
    color: '#cbd5e1',
    fontFamily: 'monospace'
  },
  checklistRow: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
    gap: 4
  },
  checklistTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  checklistTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f8fafc',
    flex: 1
  },
  checklistDetail: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 17
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
