import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { T } from '../theme';

const { width } = Dimensions.get('window');

export default function LessonModal({ lesson, course, isDone, onClose, onDone }) {
  const [showVideo, setShowVideo] = useState(false);

  // Simple markdown renderer
  function renderContent(text) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <Text key={i} style={s.h2}>{line.slice(3)}</Text>;
      if (line.startsWith('**') && line.endsWith('**')) return <Text key={i} style={s.bold}>{line.slice(2, -2)}</Text>;
      if (line.startsWith('• ')) return <Text key={i} style={s.bullet}>• {line.slice(2)}</Text>;
      if (line.startsWith('− ') || line.startsWith('= ')) return <Text key={i} style={s.formula}>{line}</Text>;
      if (line.trim() === '') return <View key={i} style={{ height: 8 }} />;
      return <Text key={i} style={s.para}>{line}</Text>;
    });
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={onClose} style={s.backBtn}>
            <Text style={s.backText}>‹ Назад</Text>
          </TouchableOpacity>
          <View style={s.headerRight}>
            <Text style={s.mins}>⏱ {lesson.mins} мин</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>{lesson.title}</Text>

          {/* Video toggle */}
          {lesson.videoId && (
            <TouchableOpacity
              style={[s.videoBtn, { borderColor: course.color }]}
              onPress={() => setShowVideo(!showVideo)}
            >
              <Text style={s.videoBtnIcon}>{showVideo ? '⏸' : '▶'}</Text>
              <Text style={[s.videoBtnText, { color: course.color }]}>
                {showVideo ? 'Скрыть видео' : 'Смотреть видео к уроку'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Video player */}
          {showVideo && lesson.videoId && (
            <View style={s.videoWrap}>
              <WebView
                source={{ uri: `https://www.youtube.com/embed/${lesson.videoId}?autoplay=1` }}
                style={s.webview}
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction={false}
              />
            </View>
          )}

          {/* Content */}
          <View style={s.lessonContent}>
            {renderContent(lesson.content)}
          </View>

          {/* Done button */}
          <TouchableOpacity
            style={[s.doneBtn, isDone && s.doneBtnDone]}
            onPress={isDone ? onClose : onDone}
          >
            <Text style={s.doneBtnText}>
              {isDone ? '✓ Урок уже пройден' : '✓ Урок завершён — Продолжить'}
            </Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderColor: T.border,
  },
  backBtn: {},
  backText: { color: T.gold, fontSize: 17 },
  headerRight: {},
  mins: { color: T.sub, fontSize: 13 },
  content: { padding: 20 },
  title: { color: T.text, fontSize: 22, fontWeight: '700', marginBottom: 20, lineHeight: 30 },
  videoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 12,
    borderWidth: 1, backgroundColor: T.surface,
    marginBottom: 16,
  },
  videoBtnIcon: { fontSize: 20 },
  videoBtnText: { fontSize: 14, fontWeight: '600' },
  videoWrap: {
    borderRadius: 12, overflow: 'hidden',
    marginBottom: 20, height: (width - 40) * 9 / 16,
  },
  webview: { flex: 1 },
  lessonContent: { marginBottom: 24 },
  h2: { color: T.gold, fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  bold: { color: T.text, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  bullet: { color: T.sub, fontSize: 14, lineHeight: 24, marginBottom: 4, marginLeft: 8 },
  formula: {
    color: T.text, fontSize: 13,
    fontFamily: 'monospace',
    backgroundColor: T.card, padding: 10,
    borderRadius: 8, marginBottom: 4,
  },
  para: { color: T.sub, fontSize: 14, lineHeight: 24, marginBottom: 4 },
  doneBtn: {
    backgroundColor: T.gold, borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  doneBtnDone: { backgroundColor: T.surface, borderWidth: 1, borderColor: T.border },
  doneBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
});
