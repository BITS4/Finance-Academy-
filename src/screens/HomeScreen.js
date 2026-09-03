import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { T } from '../theme';
import {
  LEVELS,
  getLevelProgress,
  getLevelCompletionPct,
  isLevelUnlocked,
  getTotalXP,
} from '../data/levels';

const XP_RANKS = [
  { min: 0, label: 'Finance Rookie', emoji: '🌱' },
  { min: 300, label: 'Analyst Trainee', emoji: '📘' },
  { min: 700, label: 'Junior Analyst', emoji: '📊' },
  { min: 1200, label: 'Associate', emoji: '💼' },
  { min: 2000, label: 'VP-level', emoji: '🏦' },
  { min: 3500, label: 'CFA Candidate', emoji: '🏆' },
];

function getRank(xp) {
  for (let i = XP_RANKS.length - 1; i >= 0; i--) {
    if (xp >= XP_RANKS[i].min) return XP_RANKS[i];
  }
  return XP_RANKS[0];
}

function getNextRank(xp) {
  for (let i = 0; i < XP_RANKS.length; i++) {
    if (xp < XP_RANKS[i].min) return XP_RANKS[i];
  }
  return null;
}

export default function HomeScreen({ progress, onLevelPress }) {
  const totalXP = getTotalXP(progress);
  const rank = getRank(totalXP);
  const nextRank = getNextRank(totalXP);
  const xpToNext = nextRank ? nextRank.min - totalXP : 0;
  const xpPct = nextRank
    ? Math.round(
        ((totalXP - (getRank(totalXP)?.min || 0)) / (nextRank.min - (getRank(totalXP)?.min || 0))) *
          100,
      )
    : 100;

  const totalLevels = LEVELS.length;
  const passedLevels = LEVELS.filter((l) => getLevelProgress(progress, l.id).gatePassed).length;

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.appName}>FinanceAcademy</Text>
          <Text style={s.appSub}>Путь от 0 до IB Analyst</Text>
        </View>
        <View style={s.xpBadge}>
          <Text style={s.xpNum}>{totalXP}</Text>
          <Text style={s.xpLabel}>XP</Text>
        </View>
      </View>

      {/* Rank card */}
      <View style={s.rankCard}>
        <View style={s.rankLeft}>
          <Text style={s.rankEmoji}>{rank.emoji}</Text>
          <View>
            <Text style={s.rankLabel}>Ваш ранг</Text>
            <Text style={s.rankName}>{rank.label}</Text>
          </View>
        </View>
        {nextRank && (
          <View style={s.rankRight}>
            <Text style={s.nextLabel}>До «{nextRank.label}»</Text>
            <Text style={s.nextXP}>+{xpToNext} XP</Text>
          </View>
        )}
      </View>

      {/* XP progress bar */}
      {nextRank && (
        <View style={s.xpBarWrap}>
          <View style={s.xpBar}>
            <View style={[s.xpBarFill, { width: `${Math.min(xpPct, 100)}%` }]} />
          </View>
          <Text style={s.xpBarPct}>{xpPct}%</Text>
        </View>
      )}

      {/* Overall stats */}
      <View style={s.statsRow}>
        <StatChip
          icon="🏆"
          value={`${passedLevels}/${totalLevels}`}
          label="Уровней пройдено"
          color={T.gold}
        />
        <StatChip icon="⚡" value={`${totalXP}`} label="Total XP" color={T.purple} />
        <StatChip icon="🎯" value={`CFA/ACCA`} label="Целевой экзамен" color={T.green} />
      </View>

      {/* Path title */}
      <View style={s.pathHeader}>
        <Text style={s.pathTitle}>Карьерный путь</Text>
        <Text style={s.pathSub}>
          От основ до IB Analyst · Junior-уровень за {totalLevels} уровней
        </Text>
      </View>

      {/* Level nodes */}
      {LEVELS.map((level) => {
        const lp = getLevelProgress(progress, level.id);
        const pct = getLevelCompletionPct(progress, level.id);
        const unlocked = isLevelUnlocked(progress, level.id);
        const passed = lp.gatePassed;

        const allLessons = level.modules.flatMap((m) => m.lessons);
        const doneLessons = lp.lessonsCompleted.length;

        return (
          <View key={level.id}>
            {/* Connector line from previous level */}
            {level.id > 1 && (
              <View style={s.connector}>
                <View style={[s.connLine, { backgroundColor: passed ? T.gold : T.border }]} />
                {passed && <Text style={s.connCheck}>✓</Text>}
              </View>
            )}

            {/* Level card */}
            <TouchableOpacity
              style={[
                s.levelCard,
                { borderColor: unlocked ? level.color : T.border },
                passed && s.levelCardPassed,
                !unlocked && s.levelCardLocked,
              ]}
              onPress={() => unlocked && onLevelPress && onLevelPress(level)}
              disabled={!unlocked}
              activeOpacity={0.8}
            >
              {/* Lock overlay for locked levels */}
              {!unlocked && (
                <View style={s.lockOverlay}>
                  <Text style={s.lockIcon}>🔒</Text>
                  <Text style={s.lockText}>Сначала пройдите Уровень {level.id - 1}</Text>
                </View>
              )}

              {/* Top row */}
              <View style={s.levelTop}>
                <View
                  style={[
                    s.levelNumBadge,
                    { backgroundColor: level.colorBg, borderColor: level.color },
                  ]}
                >
                  <Text style={[s.levelNum, { color: level.color }]}>{level.num}</Text>
                </View>
                <View style={s.levelTitleWrap}>
                  <Text style={[s.levelTitle, !unlocked && { color: T.faint }]}>{level.title}</Text>
                  <Text
                    style={[s.levelSub, { color: unlocked ? level.color : T.faint }]}
                    numberOfLines={1}
                  >
                    {level.icon} {level.subtitle}
                  </Text>
                </View>
                <View style={[s.levelIconCircle, { backgroundColor: level.colorBg }]}>
                  <Text style={s.levelIconEmoji}>{level.icon}</Text>
                </View>
              </View>

              {/* Narrative */}
              {unlocked && (
                <Text style={s.levelNarrative} numberOfLines={2}>
                  {level.narrative}
                </Text>
              )}

              {/* Target exam */}
              {unlocked && (
                <View style={s.examBadge}>
                  <Text style={[s.examBadgeText, { color: level.color }]}>
                    🎓 {level.targetExam}
                  </Text>
                </View>
              )}

              {/* Progress */}
              {unlocked && (
                <View style={s.levelProgress}>
                  <View style={s.progressRow}>
                    <Text style={s.progressLabel}>
                      {doneLessons}/{allLessons.length} уроков
                      {lp.interviewCompleted ? ' · 🎤 Interview ✓' : ''}
                      {passed ? ' · 🏁 Gate ✓' : ''}
                    </Text>
                    <Text style={[s.progressPct, { color: level.color }]}>{pct}%</Text>
                  </View>
                  <View style={s.progressBar}>
                    <View
                      style={[s.progressFill, { width: `${pct}%`, backgroundColor: level.color }]}
                    />
                  </View>
                </View>
              )}

              {/* Status badge */}
              <View style={s.statusRow}>
                {passed ? (
                  <View
                    style={[s.statusBadge, { backgroundColor: T.greenBg, borderColor: T.green }]}
                  >
                    <Text style={[s.statusText, { color: T.green }]}>
                      ✅ Уровень пройден · {lp.gateScore}%
                    </Text>
                  </View>
                ) : unlocked && pct > 0 ? (
                  <View
                    style={[
                      s.statusBadge,
                      { backgroundColor: level.colorBg, borderColor: level.color },
                    ]}
                  >
                    <Text style={[s.statusText, { color: level.color }]}>📖 В процессе</Text>
                  </View>
                ) : unlocked ? (
                  <View style={[s.statusBadge, { backgroundColor: T.card, borderColor: T.border }]}>
                    <Text style={[s.statusText, { color: T.sub }]}>▶ Начать уровень</Text>
                  </View>
                ) : null}
                {unlocked && (
                  <Text style={[s.xpReward, { color: level.color }]}>+{level.xpTotal} XP</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        );
      })}

      {/* Completion */}
      {passedLevels === totalLevels && (
        <View style={s.certCard}>
          <Text style={s.certEmoji}>🏆</Text>
          <Text style={s.certTitle}>Junior Analyst — достигнут!</Text>
          <Text style={s.certSub}>
            Все 5 уровней пройдены. Ты готов к техническим интервью в IB.
          </Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function StatChip({ icon, value, label, color }) {
  return (
    <View style={[s.chip, { borderColor: color + '55' }]}>
      <Text style={s.chipIcon}>{icon}</Text>
      <Text style={[s.chipValue, { color }]}>{value}</Text>
      <Text style={s.chipLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 20, paddingTop: 56 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  appName: { color: T.text, fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  appSub: { color: T.sub, fontSize: 12, marginTop: 2 },
  xpBadge: {
    backgroundColor: T.goldBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.gold,
  },
  xpNum: { color: T.gold, fontSize: 18, fontWeight: '800' },
  xpLabel: { color: T.gold, fontSize: 9, fontWeight: '700' },

  rankCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: T.border,
  },
  rankLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankEmoji: { fontSize: 32 },
  rankLabel: { color: T.sub, fontSize: 11 },
  rankName: { color: T.text, fontSize: 16, fontWeight: '700' },
  rankRight: { alignItems: 'flex-end' },
  nextLabel: { color: T.sub, fontSize: 11 },
  nextXP: { color: T.gold, fontSize: 14, fontWeight: '700' },

  xpBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  xpBar: { flex: 1, height: 6, backgroundColor: T.border, borderRadius: 3, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: T.gold, borderRadius: 3 },
  xpBarPct: { color: T.gold, fontSize: 11, fontWeight: '700', minWidth: 34, textAlign: 'right' },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  chip: {
    flex: 1,
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  chipIcon: { fontSize: 18, marginBottom: 4 },
  chipValue: { fontSize: 13, fontWeight: '800', marginBottom: 2 },
  chipLabel: { color: T.sub, fontSize: 9, textAlign: 'center' },

  pathHeader: { marginBottom: 16 },
  pathTitle: { color: T.text, fontSize: 18, fontWeight: '700' },
  pathSub: { color: T.sub, fontSize: 12, marginTop: 2 },

  connector: { alignItems: 'center', height: 32, justifyContent: 'center' },
  connLine: { width: 2, height: 20, borderRadius: 1 },
  connCheck: { position: 'absolute', color: T.gold, fontSize: 10, fontWeight: '800' },

  levelCard: {
    backgroundColor: T.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: T.border,
  },
  levelCardPassed: { borderColor: T.gold + '88' },
  levelCardLocked: { opacity: 0.55 },

  lockOverlay: { alignItems: 'center', paddingVertical: 8, marginBottom: 8 },
  lockIcon: { fontSize: 28, marginBottom: 4 },
  lockText: { color: T.faint, fontSize: 12, textAlign: 'center' },

  levelTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  levelNumBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  levelNum: { fontSize: 14, fontWeight: '900' },
  levelTitleWrap: { flex: 1 },
  levelTitle: { color: T.text, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  levelSub: { fontSize: 12, fontWeight: '600' },
  levelIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelIconEmoji: { fontSize: 24 },

  levelNarrative: { color: T.sub, fontSize: 12, lineHeight: 18, marginBottom: 8 },

  examBadge: {
    backgroundColor: T.card,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  examBadgeText: { fontSize: 11, fontWeight: '600' },

  levelProgress: { marginBottom: 10 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progressLabel: { color: T.sub, fontSize: 11 },
  progressPct: { fontSize: 12, fontWeight: '700' },
  progressBar: { height: 5, backgroundColor: T.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '600' },
  xpReward: { fontSize: 13, fontWeight: '800' },

  certCard: {
    backgroundColor: T.goldBg,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 2,
    borderColor: T.gold,
  },
  certEmoji: { fontSize: 52, marginBottom: 10 },
  certTitle: { color: T.gold, fontSize: 18, fontWeight: '800', marginBottom: 6 },
  certSub: { color: T.sub, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
