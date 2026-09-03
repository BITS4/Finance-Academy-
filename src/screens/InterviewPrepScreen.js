import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { T } from '../theme';
import { LEVELS, getLevelProgress, isLevelUnlocked } from '../data/levels';

export default function InterviewPrepScreen({ progress, onInterviewPress }) {
  const totalDone = LEVELS.filter(
    (l) => getLevelProgress(progress, l.id).interviewCompleted,
  ).length;

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Тренажёр интервью</Text>
        <Text style={s.sub}>Реальные вопросы Goldman, McKinsey, JP Morgan</Text>
      </View>

      {/* Stats */}
      <View style={s.statsCard}>
        <View style={s.statItem}>
          <Text style={s.statNum}>
            {totalDone}/{LEVELS.length}
          </Text>
          <Text style={s.statLabel}>Пройдено</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={[s.statNum, { color: T.gold }]}>{totalDone * 100}</Text>
          <Text style={s.statLabel}>XP заработано</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={[s.statNum, { color: T.green }]}>5</Text>
          <Text style={s.statLabel}>Банков/компаний</Text>
        </View>
      </View>

      {/* Tip */}
      <View style={s.tipCard}>
        <Text style={s.tipIcon}>💡</Text>
        <Text style={s.tipText}>
          Отвечай вслух — это критически важно. Структура ответа на бумаге ≠ уверенный ответ на
          интервью.
        </Text>
      </View>

      {/* Interview cards */}
      {LEVELS.map((level) => {
        const lp = getLevelProgress(progress, level.id);
        const unlocked = isLevelUnlocked(progress, level.id);
        const done = lp.interviewCompleted;
        const q = level.interviewQuestion;

        return (
          <TouchableOpacity
            key={level.id}
            style={[
              s.card,
              { borderColor: done ? T.green : unlocked ? level.color : T.border },
              !unlocked && s.cardLocked,
            ]}
            onPress={() => unlocked && onInterviewPress && onInterviewPress(level)}
            disabled={!unlocked}
            activeOpacity={0.8}
          >
            {/* Top: level + company */}
            <View style={s.cardTop}>
              <View
                style={[s.levelPill, { backgroundColor: level.colorBg, borderColor: level.color }]}
              >
                <Text style={s.levelPillIcon}>{level.icon}</Text>
                <Text style={[s.levelPillText, { color: level.color }]}>Уровень {level.num}</Text>
              </View>
              <View style={[s.companyPill, { backgroundColor: T.card }]}>
                <Text style={s.companyText}>{q.source}</Text>
              </View>
              {done && (
                <View style={s.donePill}>
                  <Text style={s.doneText}>✅</Text>
                </View>
              )}
              {!unlocked && (
                <View style={s.lockPill}>
                  <Text style={s.lockText}>🔒</Text>
                </View>
              )}
            </View>

            {/* Role */}
            <Text style={s.roleText}>{q.role}</Text>

            {/* Question */}
            <Text style={s.questionText} numberOfLines={3}>
              "{q.question}"
            </Text>

            {/* Type + timer */}
            <View style={s.cardMeta}>
              <View style={[s.typePill, { backgroundColor: level.colorBg }]}>
                <Text style={[s.typeText, { color: level.color }]}>
                  {{
                    hypothesis: '🌳 Гипотезы',
                    chain: '🔗 Цепочка',
                    market_impact: '📈 Рынок',
                    technical: '🔧 Техника',
                    pitch: '🎯 Питч',
                  }[q.type] || q.type}
                </Text>
              </View>
              <Text style={s.timerText}>⏱ {Math.floor(q.timeLimit / 60)} мин</Text>
              {!done && <Text style={[s.xpText, { color: level.color }]}>+100 XP</Text>}
            </View>

            {/* Action */}
            {unlocked && (
              <View style={[s.actionRow, { borderTopColor: level.color + '33' }]}>
                <Text style={[s.actionText, { color: done ? T.green : level.color }]}>
                  {done ? '🔄 Повторить вопрос' : '▶ Начать тренажёр'}
                </Text>
              </View>
            )}

            {!unlocked && <Text style={s.lockedHint}>Сначала пройдите Уровень {level.id - 1}</Text>}
          </TouchableOpacity>
        );
      })}

      {/* Pro tip */}
      <View style={s.proTipCard}>
        <Text style={s.proTipTitle}>🏆 Совет от Senior Analyst</Text>
        <Text style={s.proTipText}>
          На Superday в Goldman Sachs каждый раунд — это не экзамен. Это разговор двух
          профессионалов. Твоя задача: показать структуру мышления, а не угадать «правильный» ответ.
          Ошибиться в расчётах и объяснить логику — лучше, чем дать правильный ответ без понимания.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 20, paddingTop: 56 },

  header: { marginBottom: 16 },
  title: { color: T.text, fontSize: 24, fontWeight: '800' },
  sub: { color: T.sub, fontSize: 13, marginTop: 4 },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: T.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { color: T.text, fontSize: 22, fontWeight: '900' },
  statLabel: { color: T.sub, fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: T.border },

  tipCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: T.goldBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: T.gold,
  },
  tipIcon: { fontSize: 20 },
  tipText: { color: T.gold, fontSize: 12, lineHeight: 19, flex: 1 },

  card: {
    backgroundColor: T.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  cardLocked: { opacity: 0.55 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  levelPillIcon: { fontSize: 12 },
  levelPillText: { fontSize: 11, fontWeight: '700' },
  companyPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  companyText: { color: T.sub, fontSize: 11, fontWeight: '600' },
  donePill: { marginLeft: 'auto' },
  doneText: { fontSize: 18 },
  lockPill: { marginLeft: 'auto' },
  lockText: { fontSize: 18 },

  roleText: { color: T.faint, fontSize: 11, fontStyle: 'italic', marginBottom: 6 },
  questionText: {
    color: T.text,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 21,
    marginBottom: 10,
  },

  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 11, fontWeight: '600' },
  timerText: { color: T.sub, fontSize: 12 },
  xpText: { fontSize: 12, fontWeight: '700', marginLeft: 'auto' },

  actionRow: { marginTop: 12, paddingTop: 10, borderTopWidth: 1 },
  actionText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  lockedHint: {
    color: T.faint,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },

  proTipCard: {
    backgroundColor: T.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: T.borderHi,
  },
  proTipTitle: { color: T.gold, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  proTipText: { color: T.sub, fontSize: 13, lineHeight: 20 },
});
