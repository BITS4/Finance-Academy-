import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { T } from '../theme';
import {
  LEVELS,
  getLevelProgress,
  getLevelCompletionPct,
  isLevelUnlocked,
  getTotalXP,
} from '../data/levels';

const XP_RANKS = [
  { min: 0, label: 'Finance Rookie', emoji: '🌱', next: 300 },
  { min: 300, label: 'Analyst Trainee', emoji: '📘', next: 700 },
  { min: 700, label: 'Junior Analyst', emoji: '📊', next: 1200 },
  { min: 1200, label: 'Associate', emoji: '💼', next: 2000 },
  { min: 2000, label: 'VP-level', emoji: '🏦', next: 3500 },
  { min: 3500, label: 'CFA Candidate', emoji: '🏆', next: null },
];

function getRank(xp) {
  for (let i = XP_RANKS.length - 1; i >= 0; i--) {
    if (xp >= XP_RANKS[i].min) return XP_RANKS[i];
  }
  return XP_RANKS[0];
}

export default function ProgressScreen({ progress }) {
  const totalXP = getTotalXP(progress);
  const rank = getRank(totalXP);
  const nextRank = XP_RANKS.find((r) => r.min > totalXP);

  const passedLevels = LEVELS.filter((l) => getLevelProgress(progress, l.id).gatePassed).length;
  const totalLessons = LEVELS.flatMap((l) => l.modules.flatMap((m) => m.lessons)).length;
  const doneLessons = LEVELS.reduce(
    (acc, l) => acc + getLevelProgress(progress, l.id).lessonsCompleted.length,
    0,
  );
  const doneInterviews = LEVELS.filter(
    (l) => getLevelProgress(progress, l.id).interviewCompleted,
  ).length;

  const xpPct = nextRank
    ? Math.round(((totalXP - rank.min) / (nextRank.min - rank.min)) * 100)
    : 100;

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.title}>Прогресс</Text>

      {/* Rank card */}
      <View style={s.rankCard}>
        <View style={s.rankRow}>
          <Text style={s.rankEmoji}>{rank.emoji}</Text>
          <View style={s.rankInfo}>
            <Text style={s.rankLabel}>Текущий ранг</Text>
            <Text style={s.rankName}>{rank.label}</Text>
          </View>
          <View style={s.xpBlock}>
            <Text style={s.xpNum}>{totalXP}</Text>
            <Text style={s.xpLabel}>XP</Text>
          </View>
        </View>
        {nextRank && (
          <>
            <View style={s.rankBarWrap}>
              <View style={s.rankBar}>
                <View style={[s.rankBarFill, { width: `${Math.min(xpPct, 100)}%` }]} />
              </View>
              <Text style={s.rankBarPct}>{xpPct}%</Text>
            </View>
            <Text style={s.rankNext}>
              До «{nextRank.label}»: +{nextRank.min - totalXP} XP
            </Text>
          </>
        )}
      </View>

      {/* Global stats */}
      <View style={s.statsRow}>
        <StatBox icon="🏆" value={`${passedLevels}/5`} label="Уровней пройдено" color={T.gold} />
        <StatBox icon="📖" value={`${doneLessons}/${totalLessons}`} label="Уроков" color={T.blue} />
        <StatBox icon="🎤" value={`${doneInterviews}/5`} label="Интервью" color={T.purple} />
      </View>

      {/* Per-level progress */}
      <Text style={s.sectionTitle}>По уровням</Text>
      {LEVELS.map((level) => {
        const lp = getLevelProgress(progress, level.id);
        const pct = getLevelCompletionPct(progress, level.id);
        const unlocked = isLevelUnlocked(progress, level.id);
        const allLessons = level.modules.flatMap((m) => m.lessons);
        const doneLvl = lp.lessonsCompleted.length;

        return (
          <View
            key={level.id}
            style={[
              s.levelCard,
              { borderLeftColor: level.color, borderLeftWidth: 4 },
              !unlocked && s.levelCardLocked,
            ]}
          >
            {/* Header */}
            <View style={s.levelHeader}>
              <View style={[s.levelIconBox, { backgroundColor: level.colorBg }]}>
                <Text style={s.levelIconText}>{level.icon}</Text>
              </View>
              <View style={s.levelMeta}>
                <Text style={s.levelNum}>Уровень {level.num}</Text>
                <Text style={s.levelTitle} numberOfLines={1}>
                  {level.title}
                </Text>
              </View>
              <Text style={[s.levelPct, { color: unlocked ? level.color : T.faint }]}>
                {unlocked ? `${pct}%` : '🔒'}
              </Text>
            </View>

            {/* Progress bar */}
            {unlocked && (
              <View style={s.levelBar}>
                <View
                  style={[s.levelBarFill, { width: `${pct}%`, backgroundColor: level.color }]}
                />
              </View>
            )}

            {/* Stats row */}
            <View style={s.levelStats}>
              <LevelStat
                icon="📖"
                value={`${doneLvl}/${allLessons.length}`}
                label="Уроков"
                color={doneLvl === allLessons.length ? T.green : T.blue}
              />
              <LevelStat
                icon="🎤"
                value={lp.interviewCompleted ? 'Сдан' : '—'}
                label="Интервью"
                color={lp.interviewCompleted ? T.green : T.sub}
              />
              <LevelStat
                icon="🏁"
                value={lp.gatePassed ? `${lp.gateScore}%` : lp.gateScore ? `${lp.gateScore}%` : '—'}
                label="Gate"
                color={lp.gatePassed ? T.green : lp.gateScore ? T.red : T.sub}
              />
              <LevelStat icon="⚡" value={`${lp.xp || 0}`} label="XP" color={T.gold} />
            </View>

            {/* Status badge */}
            {unlocked && (
              <View
                style={[
                  s.statusBadge,
                  lp.gatePassed
                    ? { backgroundColor: T.greenBg, borderColor: T.green }
                    : pct > 0
                      ? { backgroundColor: level.colorBg, borderColor: level.color }
                      : { backgroundColor: T.card, borderColor: T.border },
                ]}
              >
                <Text
                  style={[
                    s.statusText,
                    { color: lp.gatePassed ? T.green : pct > 0 ? level.color : T.sub },
                  ]}
                >
                  {lp.gatePassed
                    ? '✅ Уровень пройден'
                    : pct === 100 && lp.interviewCompleted
                      ? '🚀 Готов к Gate-экзамену'
                      : pct > 0
                        ? '📖 В процессе'
                        : '▶ Не начат'}
                </Text>
              </View>
            )}

            {/* Module breakdown */}
            {unlocked && pct > 0 && (
              <View style={s.modulesBreakdown}>
                {level.modules.map((module) => {
                  const moduleDone = module.lessons.filter((l) =>
                    lp.lessonsCompleted.includes(l.id),
                  ).length;
                  const modulePct = module.lessons.length
                    ? Math.round((moduleDone / module.lessons.length) * 100)
                    : 0;
                  return (
                    <View key={module.id} style={s.moduleRow}>
                      <Text style={s.moduleName} numberOfLines={1}>
                        {module.title}
                      </Text>
                      <View style={s.moduleMiniBar}>
                        <View
                          style={[
                            s.moduleMiniBarFill,
                            { width: `${modulePct}%`, backgroundColor: level.color },
                          ]}
                        />
                      </View>
                      <Text
                        style={[s.modulePct, { color: modulePct === 100 ? T.green : level.color }]}
                      >
                        {moduleDone}/{module.lessons.length}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {!unlocked && (
              <Text style={s.lockText}>🔒 Сначала пройдите Уровень {level.id - 1}</Text>
            )}
          </View>
        );
      })}

      {/* CFA/ACCA readiness */}
      <View style={s.examCard}>
        <Text style={s.examCardTitle}>🎓 Готовность к экзаменам</Text>
        <View style={s.examRow}>
          <View style={[s.examItem, { borderColor: passedLevels >= 2 ? T.green : T.border }]}>
            <Text style={s.examItemName}>ACCA F3</Text>
            <Text style={[s.examItemStatus, { color: passedLevels >= 2 ? T.green : T.sub }]}>
              {passedLevels >= 2 ? '✅ Готов' : `Уровни 1-2 (${Math.min(passedLevels, 2)}/2)`}
            </Text>
          </View>
          <View style={[s.examItem, { borderColor: passedLevels >= 3 ? T.green : T.border }]}>
            <Text style={s.examItemName}>CFA Level I</Text>
            <Text style={[s.examItemStatus, { color: passedLevels >= 3 ? T.green : T.sub }]}>
              {passedLevels >= 3 ? '✅ Готов' : `Уровни 1-3 (${Math.min(passedLevels, 3)}/3)`}
            </Text>
          </View>
          <View style={[s.examItem, { borderColor: passedLevels >= 5 ? T.gold : T.border }]}>
            <Text style={s.examItemName}>IB Analyst</Text>
            <Text style={[s.examItemStatus, { color: passedLevels >= 5 ? T.gold : T.sub }]}>
              {passedLevels >= 5 ? '🏆 Готов!' : `Все 5 уровней (${passedLevels}/5)`}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function StatBox({ icon, value, label, color }) {
  return (
    <View style={s.statBox}>
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function LevelStat({ icon, value, label, color }) {
  return (
    <View style={s.levelStatItem}>
      <Text style={s.levelStatIcon}>{icon}</Text>
      <Text style={[s.levelStatValue, { color }]}>{value}</Text>
      <Text style={s.levelStatLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  title: { color: T.text, fontSize: 24, fontWeight: '800', marginBottom: 16 },

  rankCard: {
    backgroundColor: T.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: T.border,
  },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  rankEmoji: { fontSize: 36 },
  rankInfo: { flex: 1 },
  rankLabel: { color: T.sub, fontSize: 11 },
  rankName: { color: T.text, fontSize: 17, fontWeight: '800' },
  xpBlock: {
    alignItems: 'center',
    backgroundColor: T.goldBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: T.gold,
  },
  xpNum: { color: T.gold, fontSize: 20, fontWeight: '900' },
  xpLabel: { color: T.gold, fontSize: 9, fontWeight: '700' },
  rankBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  rankBar: { flex: 1, height: 6, backgroundColor: T.border, borderRadius: 3, overflow: 'hidden' },
  rankBarFill: { height: '100%', backgroundColor: T.gold, borderRadius: 3 },
  rankBarPct: { color: T.gold, fontSize: 11, fontWeight: '700', minWidth: 32 },
  rankNext: { color: T.sub, fontSize: 11 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statBox: {
    flex: 1,
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.border,
  },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  statLabel: { color: T.sub, fontSize: 9, textAlign: 'center' },

  sectionTitle: { color: T.text, fontSize: 17, fontWeight: '700', marginBottom: 12 },

  levelCard: {
    backgroundColor: T.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: T.border,
  },
  levelCardLocked: { opacity: 0.5 },
  levelHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  levelIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelIconText: { fontSize: 20 },
  levelMeta: { flex: 1 },
  levelNum: { color: T.faint, fontSize: 10, fontWeight: '700' },
  levelTitle: { color: T.text, fontSize: 13, fontWeight: '700' },
  levelPct: { fontSize: 16, fontWeight: '800' },
  levelBar: {
    height: 5,
    backgroundColor: T.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  levelBarFill: { height: '100%', borderRadius: 3 },

  levelStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  levelStatItem: { alignItems: 'center' },
  levelStatIcon: { fontSize: 14, marginBottom: 2 },
  levelStatValue: { fontSize: 13, fontWeight: '800', marginBottom: 1 },
  levelStatLabel: { color: T.sub, fontSize: 9 },

  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  statusText: { fontSize: 11, fontWeight: '700' },

  modulesBreakdown: { gap: 5, paddingTop: 6, borderTopWidth: 1, borderTopColor: T.border },
  moduleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moduleName: { color: T.sub, fontSize: 10, flex: 1 },
  moduleMiniBar: {
    width: 60,
    height: 3,
    backgroundColor: T.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  moduleMiniBarFill: { height: '100%', borderRadius: 2 },
  modulePct: { fontSize: 10, fontWeight: '700', minWidth: 28, textAlign: 'right' },

  lockText: { color: T.faint, fontSize: 11, fontStyle: 'italic', marginTop: 4 },

  examCard: {
    backgroundColor: T.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: T.border,
  },
  examCardTitle: { color: T.text, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  examRow: { flexDirection: 'row', gap: 8 },
  examItem: {
    flex: 1,
    backgroundColor: T.surface,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  examItemName: { color: T.text, fontSize: 12, fontWeight: '700', marginBottom: 4 },
  examItemStatus: { fontSize: 10, textAlign: 'center', lineHeight: 15 },
});
