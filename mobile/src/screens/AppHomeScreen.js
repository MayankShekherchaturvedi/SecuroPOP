import { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  View
} from 'react-native';

const INITIAL_NOTES = [
  {
    id: 'note-1',
    title: 'Q4 Security Review',
    body: 'Confirm Android 14+ target SDK compliance across all internal builds.',
    updatedAt: 'Today, 09:30'
  },
  {
    id: 'note-2',
    title: 'Enterprise VPN Policy',
    body: 'Corporate notes sync requires device lock and SecuroPOP runtime check.',
    updatedAt: 'Yesterday'
  },
  {
    id: 'note-3',
    title: 'Incident Escalation Contacts',
    body: 'On-call SecOps channel: #secops-mobile-response.',
    updatedAt: 'Nov 24'
  }
];

export default function AppHomeScreen() {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [titleInput, setTitleInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');

  function handleAddNote() {
    const cleanTitle = titleInput.trim();
    const cleanBody = bodyInput.trim();
    if (!cleanTitle || !cleanBody) {
      return;
    }

    const newNote = {
      id: `note-${Date.now()}`,
      title: cleanTitle,
      body: cleanBody,
      updatedAt: 'Just now'
    };

    setNotes([newNote, ...notes]);
    setTitleInput('');
    setBodyInput('');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Corporate Notes</Text>
        <Text style={styles.sectionSubtitle}>
          Sample enterprise app protected by SecuroPOP (Android 14+)
        </Text>

        <View style={styles.composerCard}>
          <TextInput
            style={styles.input}
            placeholder="Note title"
            placeholderTextColor="#64748b"
            value={titleInput}
            onChangeText={setTitleInput}
          />
          <TextInput
            style={[styles.input, styles.bodyInput]}
            placeholder="Write a corporate note..."
            placeholderTextColor="#64748b"
            value={bodyInput}
            onChangeText={setBodyInput}
            multiline
          />
          <Pressable style={styles.addButton} onPress={handleAddNote}>
            <Text style={styles.addButtonText}>Add Note</Text>
          </Pressable>
        </View>

        {notes.map((note) => (
          <View key={note.id} style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.noteMeta}>{note.updatedAt}</Text>
            </View>
            <Text style={styles.noteBody}>{note.body}</Text>
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
  composerCard: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 8
  },
  input: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    color: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14
  },
  bodyInput: {
    minHeight: 60,
    textAlignVertical: 'top'
  },
  addButton: {
    backgroundColor: '#38bdf8',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center'
  },
  addButtonText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 14
  },
  noteCard: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    gap: 6
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
    flex: 1
  },
  noteMeta: {
    fontSize: 12,
    color: '#94a3b8'
  },
  noteBody: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 19
  }
});
