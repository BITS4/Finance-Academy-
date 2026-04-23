import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { T } from '../theme';
import { getLevelProgress, getLevelCompletionPct } from '../data/levels';

export default function LevelDetailModal({ level, progress, onClose, onLessonPress, onInterviewPress, onGatePress }) {
  const [expandedModules, setExpandedModules] = useState({ [level.modules[0]?.id]: true });

  if (!level) return null;

  const lp = getLevelProgress(progress, level.id);
  const pct = getLevelCompletionPct(progress, level.id);
  const allLessons = level.modules.flatMap(m => m.lessons);
  const totalLessons = allLessons.length;
  const doneLessons = lp.lessonsCompleted.length;
  const gateReady = doneLessons >= totalLessons && lp.interviewCompleted;

  function toggleModule(id) {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function isLessonDone(lessonId) {
    return lp.lessonsCompleted.includes(lessonId);
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={s.container}>
        {/* Header */}
        <View style={[s.header, { borderBottomColor: level.color + '44' }]}>
          <TouchableOpacity style={s.backBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.backText}>← Назад</Text>
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerIcon}>{level.icon}</Text>
          </View>
          <View style={s.levelBadge}>
            <Text style={[s.levelBadgeText, { color: level.color }]}>Уровень {level.num}</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={[s.hero, { backgroundColor: level.colorBg }]}>
            <Text style={s.heroNum}>{level.num}</Text>
            <Text style={s.heroTitle}>{level.title}</Text>
            <Text style={[s.heroSub, { color: level.color }]}>{level.icon} {level.subtitle}</Text>
            <Text style={s.heroNarrative}>{level.narrative}</Text>
            <View style={[s.challengeBox, { borderColor: level.color + '55' }]}>
              <Text style={s.challengeLabel}>🎯 Главная задача</Text>
              <Text style={[s.challengeText, { color: level.color }]}>{level.challenge}</Text>
            </View>
          </View>

          {/* Target Exam badge */}
          <View style={[s.examBanner, { backgroundColor: level.colorBg }]}>
            <Text style={[s.examBannerText, { color: level.color }]}>🎓 Готовит к: {level.targetExam}</Text>
          </View>

          {/* Progress summary */}
          <View style={s.progressCard}>
            <View style={s.progressRow}>
              <Text style={s.progressLabel}>Прогресс уровня</Text>
              <Text style={[s.progressPct, { color: level.color }]}>{pct}%</Text>
            </View>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: level.color }]} />
            </View>
            <View style={s.statsRow}>
              <MiniStat icon="📖" value={`${doneLessons}/${totalLessons}`} label="Уроков" color={T.blue} />
              <MiniStat icon="🎤" value={lp.interviewCompleted ? '✓' : '–'} label="Interview" color={lp.interviewCompleted ? T.green : T.sub} />
              <MiniStat icon="🏁" value={lp.gatePassed ? `${lp.gateScore}%` : '–'} label="Gate" color={lp.gatePassed ? T.green : T.sub} />
              <MiniStat icon="⚡" value={`${lp.xp || 0}`} label="XP" color={T.gold} />
            </View>
          </View>

          {/* Modules + Lessons */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>📚 Модули и уроки</Text>
            {level.modules.map((module, mIdx) => {
              const isOpen = expandedModules[module.id];
              const moduleDone = module.lessons.filter(l => isLessonDone(l.id)).length;

              return (
                <View key={module.id} style={s.moduleWrap}>
                  <TouchableOpacity
                    style={[s.moduleHeader, { borderLeftColor: level.color }]}
                    onPress={() => toggleModule(module.id)}
                    activeOpacity={0.8}
                  >
                    <View style={s.moduleHeaderLeft}>
                      <Text style={s.moduleTitle}>{module.title}</Text>
                      <Text style={s.moduleContext} numberOfLines={1}>{module.context}</Text>
                    </View>
                    <View style={s.moduleRight}>
                      <Text style={[s.modulePct, { color: level.color }]}>{moduleDone}/{module.lessons.length}</Text>
                      <Text style={[s.chevron, { color: level.color }]}>{isOpen ? '▲' : '▼'}</Text>
                    </View>
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={s.lessonsWrap}>
                      {module.lessons.map((lesson, lIdx) => {
                        const done = isLessonDone(lesson.id);
                        return (
                          <TouchableOpacity
                            key={lesson.id}
                            style={[s.lessonRow, done && s.lessonDone]}
                            onPress={() => onLessonPress && onLessonPress(lesson, level)}
                            activeOpacity={0.75}
                          >
                            <View style={[s.lessonDot, { backgroundColor: done ? T.green : level.color + '44', borderColor: done ? T.green : level.color }]}>
                              <Text style={s.lessonDotText}>{done ? '✓' : lIdx + 1}</Text>
                            </View>
                            <View style={s.lessonInfo}>
                              <Text style={[s.lessonTitle, done && { color: T.sub }]}>{lesson.title}</Text>
                              <Text style={s.lessonMeta}>⏱ {lesson.mins} мин · ⚡ +{lesson.xp} XP</Text>
                            </View>
                            {done
                              ? <Text style={s.doneCheck}>✅</Text>
                              : <View style={[s.startPill, { backgroundColor: level.colorBg }]}>
                                  <Text style={[s.startPillText, { color: level.color }]}>▶</Text>
                                </View>
                            }
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Interview Prep */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>🎤 Тренажёр интервью</Text>
            <TouchableOpacity
              style={[s.interviewCard, { borderColor: lp.interviewCompleted ? T.green : level.color }]}
              onPress={() => onInterviewPress && onInterviewPress(level)}
              activeOpacity={0.8}
            >
              <View style={s.interviewTop}>
                <View style={[s.interviewBadge, { backgroundColor: level.colorBg }]}>
                  <Text style={[s.interviewBadgeText, { color: level.color }]}>{level.interviewQuestion.source}</Text>
                </View>
                {lp.interviewCompleted && (
                  <View style={s.doneBadge}>
                    <Text style={s.doneBadgeText}>✅ Пройдено</Text>
                  </View>
                )}
              </View>
              <Text style={s.interviewRole}>{level.interviewQuestion.role}</Text>
              <Text style={s.interviewQ} numberOfLines={3}>"{level.interviewQuestion.question}"</Text>
              <View style={[s.interviewBtn, { backgroundColor: lp.interviewCompleted ? T.greenBg : level.colorBg, borderColor: lp.interviewCompleted ? T.green : level.color }]}>
                <Text style={[s.interviewBtnText, { color: lp.interviewCompleted ? T.green : level.color }]}>
                  {lp.interviewCompleted ? '🔄 Повторить' : '▶ Начать · +100 XP'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Exam Gate */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>🏁 Экзаменационный Gate</Text>
            <View style={[s.gateCard, { borderColor: lp.gatePassed ? T.gold : gateReady ? level.color : T.border }]}>
              <Text style={s.gateTitle}>{level.examGate.title}</Text>
              <Text style={s.gateDesc}>{level.examGate.description}</Text>
              <View style={s.gateInfo}>
                <GateInfoItem icon="📝" label={`${level.examGate.questions.length} вопросов`} />
                <GateInfoItem icon="🎯" label={`Порог ${level.examGate.passingScore}%`} />
                <GateInfoItem icon="⏱" label={`${level.examGate.timeLimit / 60} мин`} />
              </View>

              {!gateReady && !lp.gatePassed && (
                <View style={s.gateRequire}>
                  <Text style={s.gateRequireText}>
                    {doneLessons < totalLessons
                      ? `⚠️ Сначала завершите все ${totalLessons} урока (осталось ${totalLessons - doneLessons})`
                      : '⚠️ Сначала пройдите тренажёр интервью'}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  s.gateBtn,
                  { backgroundColor: lp.gatePassed ? T.goldBg : gateReady ? level.color : T.border },
                  !gateReady && !lp.gatePassed && s.gateBtnDisabled,
                ]}
                onPress={() => (gateReady || lp.gatePassed) && onGatePress && onGatePress(level)}
                disabled={!gateReady && !lp.gatePassed}
                activeOpacity={0.8}
              >
                <Text style={[s.gateBtnText, { color: lp.gatePassed ? T.gold : gateReady ? '#000' : T.faint }]}>
                  {lp.gatePassed
                    ? `🏆 Пройден: ${lp.gateScore}% · Повторить`
                    : gateReady
                    ? `🚀 Начать финальный тест · +150 XP`
                    : '🔒 Заблокировано'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 48 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function MiniStat({ icon, value, label, color }) {
  return (
    <View style={s.miniStat}>
      <Text style={s.miniStatIcon}>{icon}</Text>
      <Text style={[s.miniStatValue, { color }]}>{value}</Text>
      <Text style={s.miniStatLabel}>{label}</Text>
    </View>
  );
}

function GateInfoItem({ icon, label }) {
  return (
    <View style={s.gateInfoItem}>
      <Text style={s.gateInfoIcon}>{icon}</Text>
      <Text style={s.gateInfoLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  backBtn: { paddingVertical: 4, paddingRight: 8 },
  backText: { color: T.sub, fontSize: 14, fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerIcon: { fontSize: 28 },
  levelBadge: { backgroundColor: T.card, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  levelBadgeText: { fontSize: 12, fontWeight: '700' },

  hero: { padding: 20, marginBottom: 2 },
  heroNum: { color: T.faint, fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  heroTitle: { color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  heroSub: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  heroNarrative: { color: T.sub, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  challengeBox: { backgroundColor: T.card, borderRadius: 12, padding: 12, borderWidth: 1 },
  challengeLabel: { color: T.sub, fontSize: 11, fontWeight: '700', marginBottom: 4 },
  challengeText: { fontSize: 14, fontWeight: '700' },

  examBanner: { paddingHorizontal: 20, paddingVertical: 8, marginBottom: 2 },
  examBannerText: { fontSize: 12, fontWeight: '600' },

  progressCard: { backgroundColor: T.surface, margin: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: T.border },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { color: T.sub, fontSize: 13 },
  progressPct: { fontSize: 16, fontWeight: '700' },
  progressBar: { height: 6, backgroundColor: T.border, borderRadius: 3, overflow: 'hidden', marginBottom: 14 },
  progressFill: { height: '100%', borderRadius: 3 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  miniStat: { alignItems: 'center' },
  miniStatIcon: { fontSize: 16, marginBottom: 3 },
  miniStatValue: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  miniStatLabel: { color: T.sub, fontSize: 10 },

  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: T.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },

  moduleWrap: { marginBottom: 8 },
  moduleHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: T.border, borderLeftWidth: 4,
  },
  moduleHeaderLeft: { flex: 1 },
  moduleTitle: { color: T.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  moduleContext: { color: T.sub, fontSize: 11 },
  moduleRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modulePct: { fontSize: 12, fontWeight: '700' },
  chevron: { fontSize: 12 },

  lessonsWrap: { paddingLeft: 12, paddingTop: 4 },
  lessonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: T.card, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: T.border, marginBottom: 6,
  },
  lessonDone: { opacity: 0.75 },
  lessonDot: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  lessonDotText: { color: T.text, fontSize: 10, fontWeight: '800' },
  lessonInfo: { flex: 1 },
  lessonTitle: { color: T.text, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  lessonMeta: { color: T.sub, fontSize: 11 },
  doneCheck: { fontSize: 18 },
  startPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  startPillText: { fontSize: 12, fontWeight: '700' },

  interviewCard: {
    backgroundColor: T.surface, borderRadius: 16, padding: 16, borderWidth: 2,
  },
  interviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  interviewBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  interviewBadgeText: { fontSize: 11, fontWeight: '700' },
  doneBadge: { backgroundColor: T.greenBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  doneBadgeText: { color: T.green, fontSize: 11, fontWeight: '600' },
  interviewRole: { color: T.sub, fontSize: 11, marginBottom: 6, fontStyle: 'italic' },
  interviewQ: { color: T.text, fontSize: 13, fontStyle: 'italic', lineHeight: 20, marginBottom: 12 },
  interviewBtn: { borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1 },
  interviewBtnText: { fontSize: 13, fontWeight: '700' },

  gateCard: { backgroundColor: T.surface, borderRadius: 16, padding: 16, borderWidth: 2 },
  gateTitle: { color: T.text, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  gateDesc: { color: T.sub, fontSize: 13, lineHeight: 19, marginBottom: 12 },
  gateInfo: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  gateInfoItem: { flex: 1, backgroundColor: T.card, borderRadius: 8, padding: 8, alignItems: 'center' },
  gateInfoIcon: { fontSize: 16, marginBottom: 3 },
  gateInfoLabel: { color: T.sub, fontSize: 10, textAlign: 'center' },
  gateRequire: { backgroundColor: T.redBg, borderRadius: 10, padding: 10, marginBottom: 10 },
  gateRequireText: { color: T.red, fontSize: 12, lineHeight: 18 },
  gateBtn: { borderRadius: 12, padding: 14, alignItems: 'center' },
  gateBtnDisabled: { opacity: 0.5 },
  gateBtnText: { fontSize: 14, fontWeight: '700' },
});
