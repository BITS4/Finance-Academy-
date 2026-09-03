import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { T } from '../theme';
import { getCourseLessons, getCourseProgress } from '../data/courses';
import LessonModal from './LessonModal';
import AssessmentModal from './AssessmentModal';
import ExamModal from './ExamModal';

export default function CourseModal({ course, progress, onClose, onProgressUpdate, onPractice }) {
  const [activeSub, setActiveSub] = useState(null); // 'lesson' | 'assessment' | 'exam'
  const [selectedLesson, setSelectedLesson] = useState(null);

  if (!course) return null;
  const p = progress[course.id] || { lessons: [], examScore: null };
  const pct = getCourseProgress(progress, course.id);
  const lessons = getCourseLessons(course);

  function openLesson(lesson) {
    setSelectedLesson(lesson);
    setActiveSub('lesson');
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={s.container}>
        {/* Header */}
        <View style={[s.header, { borderBottomColor: T.border }]}>
          <TouchableOpacity onPress={onClose} style={s.backBtn}>
            <Text style={s.backText}>‹ Назад</Text>
          </TouchableOpacity>
          <View style={[s.iconWrap, { backgroundColor: course.colorBg }]}>
            <Text style={s.icon}>{course.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{course.title}</Text>
            <View style={s.meta}>
              <Text style={[s.level, { color: course.levelColor }]}>{course.level}</Text>
              <Text style={s.dot}>·</Text>
              <Text style={s.hours}>{course.hours}ч</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {/* Progress */}
          <View style={s.progressCard}>
            <View style={s.progressTop}>
              <Text style={s.progressLabel}>Прогресс курса</Text>
              <Text style={[s.progressPct, { color: course.color }]}>{pct}%</Text>
            </View>
            <View style={s.bar}>
              <View style={[s.barFill, { width: `${pct}%`, backgroundColor: course.color }]} />
            </View>
            <Text style={s.progressSub}>
              {p.lessons.length} из {lessons.length} уроков пройдено
            </Text>
          </View>

          {/* Action buttons */}
          <View style={s.actions}>
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: T.blueBg, borderColor: T.blue }]}
              onPress={() => {
                onClose();
                onPractice && onPractice(course);
              }}
            >
              <Text style={s.actionIcon}>🧮</Text>
              <Text style={[s.actionText, { color: T.blue }]}>Практические задачи</Text>
              <Text style={s.actionSub}>Расчёты и проводки</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: course.colorBg, borderColor: course.color }]}
              onPress={() => setActiveSub('assessment')}
            >
              <Text style={s.actionIcon}>🧠</Text>
              <Text style={[s.actionText, { color: course.color }]}>Тест знаний</Text>
              <Text style={s.actionSub}>Оценить уровень</Text>
            </TouchableOpacity>
            {pct === 100 && p.examScore == null && (
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: T.goldBg, borderColor: T.gold }]}
                onPress={() => setActiveSub('exam')}
              >
                <Text style={s.actionIcon}>🏆</Text>
                <Text style={[s.actionText, { color: T.gold }]}>Финальный экзамен</Text>
                <Text style={s.actionSub}>Получить сертификат</Text>
              </TouchableOpacity>
            )}
            {p.examScore != null && (
              <View style={[s.certCard, { backgroundColor: T.goldBg }]}>
                <Text style={s.certText}>🏆 Сертификат получен!</Text>
                <Text style={s.certScore}>Результат: {p.examScore}%</Text>
              </View>
            )}
          </View>

          {/* Modules */}
          <Text style={s.modulesTitle}>Программа курса</Text>
          {course.modules.map((mod) => (
            <View key={mod.id} style={s.module}>
              <View style={s.modHeader}>
                <Text style={s.modIcon}>{mod.icon}</Text>
                <Text style={s.modTitle}>{mod.title}</Text>
              </View>
              {mod.lessons.map((lesson) => {
                const done = p.lessons.includes(lesson.id);
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[s.lessonRow, done && s.lessonDone]}
                    onPress={() => openLesson(lesson)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        s.lessonCheck,
                        done && { backgroundColor: T.green, borderColor: T.green },
                      ]}
                    >
                      {done && <Text style={s.checkMark}>✓</Text>}
                    </View>
                    <View style={s.lessonInfo}>
                      <Text style={[s.lessonTitle, done && { color: T.sub }]}>{lesson.title}</Text>
                      <View style={s.lessonMeta}>
                        <Text style={s.lessonMins}>⏱ {lesson.mins} мин</Text>
                        {lesson.videoId && <Text style={s.lessonVid}>▶ Видео</Text>}
                      </View>
                    </View>
                    <Text style={s.lessonArrow}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Sub-modals */}
        {activeSub === 'lesson' && selectedLesson && (
          <LessonModal
            lesson={selectedLesson}
            course={course}
            isDone={p.lessons.includes(selectedLesson.id)}
            onClose={() => setActiveSub(null)}
            onDone={async () => {
              await onProgressUpdate('lesson', course.id, selectedLesson.id);
              setActiveSub(null);
            }}
          />
        )}
        {activeSub === 'assessment' && (
          <AssessmentModal course={course} onClose={() => setActiveSub(null)} />
        )}
        {activeSub === 'exam' && (
          <ExamModal
            course={course}
            onClose={() => setActiveSub(null)}
            onDone={async (score) => {
              await onProgressUpdate('exam', course.id, null, score);
              setActiveSub(null);
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: { paddingRight: 4 },
  backText: { color: T.gold, fontSize: 17 },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 24 },
  title: { color: T.text, fontSize: 15, fontWeight: '700' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  level: { fontSize: 12, fontWeight: '600' },
  dot: { color: T.faint, fontSize: 12 },
  hours: { color: T.sub, fontSize: 12 },
  content: { padding: 20 },
  progressCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { color: T.sub, fontSize: 13 },
  progressPct: { fontSize: 16, fontWeight: '700' },
  bar: {
    height: 6,
    backgroundColor: T.border,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
  progressSub: { color: T.sub, fontSize: 12 },
  actions: { gap: 10, marginBottom: 24 },
  actionBtn: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: { fontSize: 24 },
  actionText: { fontSize: 14, fontWeight: '600' },
  actionSub: { color: T.sub, fontSize: 12, marginLeft: 'auto' },
  certCard: { padding: 16, borderRadius: 14, alignItems: 'center' },
  certText: { color: T.gold, fontSize: 16, fontWeight: '700' },
  certScore: { color: T.sub, fontSize: 13, marginTop: 4 },
  modulesTitle: { color: T.text, fontSize: 17, fontWeight: '600', marginBottom: 14 },
  module: { marginBottom: 16 },
  modHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  modIcon: { fontSize: 18 },
  modTitle: { color: T.text, fontSize: 14, fontWeight: '600' },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: T.border,
    gap: 12,
  },
  lessonDone: { borderColor: T.border, opacity: 0.8 },
  lessonCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  lessonInfo: { flex: 1 },
  lessonTitle: { color: T.text, fontSize: 14, fontWeight: '500', marginBottom: 4 },
  lessonMeta: { flexDirection: 'row', gap: 10 },
  lessonMins: { color: T.sub, fontSize: 12 },
  lessonVid: { color: T.blue, fontSize: 12 },
  lessonArrow: { color: T.sub, fontSize: 20 },
});
