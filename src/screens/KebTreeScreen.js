import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { T } from '../theme';
import { KEB_SECTIONS, getTopicMaxScore, getTopicPassScore } from '../data/kebData';

export default function KebTreeScreen({ progress, onTopicPress }) {
  const [expanded, setExpanded] = useState({ [KEB_SECTIONS[0].id]: true });
  const kebProgress = progress?.kebTopics || {};

  function toggleSection(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function getTopicStatus(topicId) {
    const p = kebProgress[topicId];
    if (!p) return 'locked';
    if (p.examPassed) return 'completed';
    if (p.lessonsStarted) return 'inprogress';
    return 'locked';
  }

  // Тема доступна если предыдущая в том же разделе сдана (или это первая)
  function isTopicUnlocked(section, topicIndex) {
    if (topicIndex === 0) {
      // Первая тема первого раздела всегда открыта
      // Первые темы других разделов — открыты если предыдущий раздел начат
      return true;
    }
    const prevTopicId = section.topics[topicIndex - 1].id;
    return kebProgress[prevTopicId]?.examPassed === true;
  }

  function getSectionStats(section) {
    const total = section.topics.length;
    const done = section.topics.filter((t) => kebProgress[t.id]?.examPassed).length;
    return { total, done };
  }

  function getTotalStats() {
    const allTopics = KEB_SECTIONS.flatMap((s) => s.topics);
    const done = allTopics.filter((t) => kebProgress[t.id]?.examPassed).length;
    return { total: allTopics.length, done };
  }

  const { total, done } = getTotalStats();
  const overallPct = total ? Math.round((done / total) * 100) : 0;

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>КЭБ — Путь к сертификату</Text>
        <Text style={s.sub}>Квалификационный экзамен бухгалтера · ИПБ России</Text>
      </View>

      {/* Overall progress */}
      <View style={s.overallCard}>
        <View style={s.overallTop}>
          <Text style={s.overallLabel}>Общий прогресс</Text>
          <Text style={s.overallPct}>{overallPct}%</Text>
        </View>
        <View style={s.overallBar}>
          <View style={[s.overallFill, { width: `${overallPct}%` }]} />
        </View>
        <Text style={s.overallSub}>
          {done} из {total} тем сдано · Проходной балл 80%
        </Text>

        {/* Section pills */}
        <View style={s.sectionPills}>
          {KEB_SECTIONS.map((section) => {
            const { total: st, done: sd } = getSectionStats(section);
            const allDone = sd === st;
            return (
              <View
                key={section.id}
                style={[
                  s.pill,
                  allDone && { backgroundColor: section.color + '33', borderColor: section.color },
                ]}
              >
                <Text style={s.pillIcon}>{section.icon}</Text>
                <Text style={[s.pillText, { color: allDone ? section.color : T.sub }]}>
                  {sd}/{st}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Legend */}
      <View style={s.legend}>
        <LegendItem color={T.green} label="Сдано" />
        <LegendItem color={T.gold} label="В процессе" />
        <LegendItem color={T.sub} label="Заблокировано" />
      </View>

      {/* Sections tree */}
      {KEB_SECTIONS.map((section) => {
        const { total: st, done: sd } = getSectionStats(section);
        const isOpen = expanded[section.id];
        const sectionPct = st ? Math.round((sd / st) * 100) : 0;

        return (
          <View key={section.id} style={s.sectionWrap}>
            {/* Section header */}
            <TouchableOpacity
              style={[s.sectionHeader, { borderLeftColor: section.color }]}
              onPress={() => toggleSection(section.id)}
              activeOpacity={0.8}
            >
              <View style={[s.sectionIconWrap, { backgroundColor: section.colorBg }]}>
                <Text style={s.sectionIcon}>{section.icon}</Text>
              </View>
              <View style={s.sectionInfo}>
                <Text style={s.sectionNum}>Раздел {section.number}</Text>
                <Text style={s.sectionTitle} numberOfLines={2}>
                  {section.title}
                </Text>
                <View style={s.sectionBarWrap}>
                  <View style={s.sectionBar}>
                    <View
                      style={[
                        s.sectionBarFill,
                        { width: `${sectionPct}%`, backgroundColor: section.color },
                      ]}
                    />
                  </View>
                  <Text style={[s.sectionPct, { color: section.color }]}>
                    {sd}/{st}
                  </Text>
                </View>
              </View>
              <Text style={[s.chevron, { color: section.color }]}>{isOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {/* Topics list */}
            {isOpen && (
              <View style={s.topicsWrap}>
                {section.topics.map((topic, tIdx) => {
                  const status = getTopicStatus(topic.id);
                  const unlocked = isTopicUnlocked(section, tIdx);
                  const isLocked = !unlocked && status === 'locked';
                  const p = kebProgress[topic.id];
                  const maxScore = getTopicMaxScore(topic);
                  const passScore = getTopicPassScore(topic);

                  let statusColor = T.sub;
                  let statusIcon = '🔒';
                  let statusLabel = 'Заблокировано';
                  if (status === 'completed') {
                    statusColor = T.green;
                    statusIcon = '✅';
                    statusLabel = `Сдано ${p.examScore}%`;
                  } else if (status === 'inprogress') {
                    statusColor = T.gold;
                    statusIcon = '📖';
                    statusLabel = 'В процессе';
                  } else if (!isLocked) {
                    statusIcon = '🔓';
                    statusLabel = 'Доступно';
                    statusColor = T.text;
                  }

                  // Is this the last topic in its section?
                  const isLast = tIdx === section.topics.length - 1;

                  return (
                    <View key={topic.id} style={s.topicRow}>
                      {/* Tree line */}
                      <View style={s.treeLine}>
                        <View
                          style={[
                            s.treeVert,
                            isLast && s.treeVertLast,
                            { backgroundColor: section.color + '44' },
                          ]}
                        />
                        <View style={[s.treeHoriz, { backgroundColor: section.color + '44' }]} />
                        <View
                          style={[
                            s.treeNode,
                            {
                              backgroundColor:
                                status === 'completed'
                                  ? T.green
                                  : status === 'inprogress'
                                    ? T.gold
                                    : isLocked
                                      ? T.border
                                      : section.color,
                            },
                          ]}
                        >
                          {status === 'completed' && <Text style={s.treeNodeText}>✓</Text>}
                          {status !== 'completed' && <Text style={s.treeNodeText}>{tIdx + 1}</Text>}
                        </View>
                      </View>

                      {/* Topic card */}
                      <TouchableOpacity
                        style={[
                          s.topicCard,
                          status === 'completed' && s.topicCardDone,
                          status === 'inprogress' && { borderColor: T.gold },
                          !isLocked && status === 'locked' && { borderColor: section.color },
                          isLocked && s.topicCardLocked,
                        ]}
                        onPress={() => !isLocked && onTopicPress && onTopicPress(topic, section)}
                        disabled={isLocked}
                        activeOpacity={0.75}
                      >
                        <View style={s.topicTop}>
                          <Text style={s.topicIcon}>{topic.icon}</Text>
                          <View style={s.topicInfo}>
                            <Text
                              style={[s.topicTitle, isLocked && { color: T.faint }]}
                              numberOfLines={2}
                            >
                              {topic.title}
                            </Text>
                            <View style={s.topicMeta}>
                              <Text style={[s.topicStatus, { color: statusColor }]}>
                                {statusIcon} {statusLabel}
                              </Text>
                              <Text style={s.topicQcount}>
                                · {topic.questions.length} вопр. · макс. {maxScore} б.
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Score bar if attempted */}
                        {p?.lastScore != null && (
                          <View style={s.scoreBarWrap}>
                            <View style={s.scoreBar}>
                              <View
                                style={[
                                  s.scoreBarFill,
                                  {
                                    width: `${Math.round((p.lastScore / maxScore) * 100)}%`,
                                    backgroundColor: p.examPassed ? T.green : T.red,
                                  },
                                ]}
                              />
                              <View style={[s.scoreTarget, { left: '80%' }]} />
                            </View>
                            <Text style={[s.scoreText, { color: p.examPassed ? T.green : T.red }]}>
                              {p.lastScore}/{maxScore} · нужно {passScore}
                            </Text>
                          </View>
                        )}

                        {isLocked && (
                          <Text style={s.lockHint}>
                            Сначала сдайте: «{section.topics[tIdx - 1]?.title}»
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}

      {/* KEB exam readiness */}
      <View style={s.readinessCard}>
        <Text style={s.readinessTitle}>🎓 Готовность к КЭБ</Text>
        <Text style={s.readinessSub}>
          {overallPct >= 100
            ? 'Все темы сданы! Вы готовы к официальному экзамену КЭБ.'
            : overallPct >= 80
              ? 'Отличный прогресс! Ещё немного и можно идти на КЭБ.'
              : overallPct >= 50
                ? 'Хороший старт. Продолжайте — до КЭБ осталось ' + (total - done) + ' тем.'
                : 'Начните с первой темы и двигайтесь постепенно.'}
        </Text>
        <View style={s.readinessBar}>
          <View style={[s.readinessFill, { width: `${overallPct}%` }]} />
          <View style={s.readinessThreshold} />
        </View>
        <Text style={s.readinessHint}>▲ 80% = рекомендуемый уровень для сдачи КЭБ</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function LegendItem({ color, label }) {
  return (
    <View style={s.legendItem}>
      <View style={[s.legendDot, { backgroundColor: color }]} />
      <Text style={s.legendLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 20 },
  header: { marginBottom: 16 },
  title: { color: T.text, fontSize: 22, fontWeight: '700', marginBottom: 4 },
  sub: { color: T.sub, fontSize: 12 },

  overallCard: {
    backgroundColor: T.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: T.border,
  },
  overallTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  overallLabel: { color: T.sub, fontSize: 13 },
  overallPct: { color: T.gold, fontSize: 20, fontWeight: '700' },
  overallBar: {
    height: 8,
    backgroundColor: T.border,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  overallFill: { height: '100%', backgroundColor: T.gold, borderRadius: 4 },
  overallSub: { color: T.faint, fontSize: 11, marginBottom: 14 },
  sectionPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: T.card,
    borderWidth: 1,
    borderColor: T.border,
  },
  pillIcon: { fontSize: 14 },
  pillText: { fontSize: 12, fontWeight: '600' },

  legend: { flexDirection: 'row', gap: 16, marginBottom: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { color: T.sub, fontSize: 11 },

  sectionWrap: { marginBottom: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: T.border,
    borderLeftWidth: 4,
  },
  sectionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIcon: { fontSize: 22 },
  sectionInfo: { flex: 1 },
  sectionNum: { color: T.faint, fontSize: 11, fontWeight: '600', marginBottom: 2 },
  sectionTitle: { color: T.text, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  sectionBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionBar: {
    flex: 1,
    height: 4,
    backgroundColor: T.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  sectionBarFill: { height: '100%', borderRadius: 2 },
  sectionPct: { fontSize: 12, fontWeight: '600' },
  chevron: { fontSize: 12, fontWeight: '700' },

  topicsWrap: { paddingLeft: 16, paddingTop: 4 },
  topicRow: { flexDirection: 'row', gap: 0, marginBottom: 8 },
  treeLine: { width: 32, alignItems: 'center', position: 'relative' },
  treeVert: { position: 'absolute', left: 15, top: 0, bottom: 0, width: 2 },
  treeVertLast: { bottom: '50%' },
  treeHoriz: { position: 'absolute', top: '50%', left: 15, right: 0, height: 2 },
  treeNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    zIndex: 1,
  },
  treeNodeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  topicCard: {
    flex: 1,
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: T.border,
  },
  topicCardDone: { borderColor: T.green + '66', backgroundColor: T.greenBg + '44' },
  topicCardLocked: { opacity: 0.5 },
  topicTop: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  topicIcon: { fontSize: 20, marginTop: 1 },
  topicInfo: { flex: 1 },
  topicTitle: { color: T.text, fontSize: 13, fontWeight: '600', marginBottom: 4, lineHeight: 18 },
  topicMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  topicStatus: { fontSize: 11, fontWeight: '600' },
  topicQcount: { color: T.faint, fontSize: 11 },

  scoreBarWrap: { marginTop: 8 },
  scoreBar: {
    height: 5,
    backgroundColor: T.border,
    borderRadius: 3,
    overflow: 'visible',
    marginBottom: 4,
    position: 'relative',
  },
  scoreBarFill: { height: '100%', borderRadius: 3 },
  scoreTarget: { position: 'absolute', top: -2, width: 2, height: 9, backgroundColor: T.gold },
  scoreText: { fontSize: 11, fontWeight: '600' },
  lockHint: { color: T.faint, fontSize: 10, marginTop: 6, fontStyle: 'italic' },

  readinessCard: {
    backgroundColor: T.goldBg,
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: T.gold,
  },
  readinessTitle: { color: T.gold, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  readinessSub: { color: T.sub, fontSize: 13, lineHeight: 20, marginBottom: 14 },
  readinessBar: {
    height: 10,
    backgroundColor: T.border,
    borderRadius: 5,
    overflow: 'visible',
    marginBottom: 6,
    position: 'relative',
  },
  readinessFill: { height: '100%', backgroundColor: T.gold, borderRadius: 5 },
  readinessThreshold: {
    position: 'absolute',
    left: '80%',
    top: -3,
    width: 3,
    height: 16,
    backgroundColor: T.green,
    borderRadius: 2,
  },
  readinessHint: { color: T.green, fontSize: 10, fontWeight: '600' },
});
