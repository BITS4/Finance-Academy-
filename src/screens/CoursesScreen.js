import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { T } from '../theme';
import { KEB_SECTIONS, getTopicMaxScore, getTopicPassScore } from '../data/kebData';

export default function CoursesScreen({ progress, onTopicPress }) {
  const [expanded, setExpanded] = useState({ [KEB_SECTIONS[0].id]: true });
  const kebProgress = progress?.kebTopics || {};

  const allTopics = KEB_SECTIONS.flatMap((s) => s.topics);
  const passed = allTopics.filter((t) => kebProgress[t.id]?.examPassed).length;

  function toggle(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function getStatus(topicId) {
    const p = kebProgress[topicId];
    if (p?.examPassed) return 'completed';
    if (p?.lessonsStarted) return 'inprogress';
    return 'locked';
  }

  function isUnlocked(section, idx) {
    if (idx === 0) return true;
    return kebProgress[section.topics[idx - 1].id]?.examPassed === true;
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Каталог курсов КЭБ</Text>
        <Text style={s.sub}>6 разделов · {allTopics.length} тем · ИПБ России</Text>
        <View style={s.statsRow}>
          <View style={s.statPill}>
            <Text style={s.statNum}>{passed}</Text>
            <Text style={s.statLabel}>сдано</Text>
          </View>
          <View style={s.statPill}>
            <Text style={[s.statNum, { color: T.sub }]}>{allTopics.length - passed}</Text>
            <Text style={s.statLabel}>осталось</Text>
          </View>
          <View style={s.overallBarWrap}>
            <View style={s.overallBar}>
              <View
                style={[
                  s.overallFill,
                  {
                    width: `${allTopics.length ? Math.round((passed / allTopics.length) * 100) : 0}%`,
                  },
                ]}
              />
            </View>
            <Text style={s.overallPct}>
              {allTopics.length ? Math.round((passed / allTopics.length) * 100) : 0}%
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={s.list}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
      >
        {KEB_SECTIONS.map((section) => {
          const sectionPassed = section.topics.filter((t) => kebProgress[t.id]?.examPassed).length;
          const sectionPct = Math.round((sectionPassed / section.topics.length) * 100);
          const isOpen = expanded[section.id];

          return (
            <View key={section.id} style={s.sectionWrap}>
              {/* Section row */}
              <TouchableOpacity
                style={[s.sectionRow, { borderLeftColor: section.color, borderLeftWidth: 4 }]}
                onPress={() => toggle(section.id)}
                activeOpacity={0.8}
              >
                <View style={[s.sectionIconBox, { backgroundColor: section.colorBg }]}>
                  <Text style={s.sectionIcon}>{section.icon}</Text>
                </View>
                <View style={s.sectionMeta}>
                  <View style={s.sectionTopRow}>
                    <Text style={s.sectionNum}>Раздел {section.number}</Text>
                    {sectionPassed === section.topics.length && (
                      <View style={s.doneBadge}>
                        <Text style={s.doneBadgeText}>✓ Сдан</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.sectionTitle}>{section.title}</Text>
                  <View style={s.sectionBarRow}>
                    <View style={s.sectionBar}>
                      <View
                        style={[
                          s.sectionBarFill,
                          { width: `${sectionPct}%`, backgroundColor: section.color },
                        ]}
                      />
                    </View>
                    <Text style={[s.sectionBarLabel, { color: section.color }]}>
                      {sectionPassed}/{section.topics.length}
                    </Text>
                  </View>
                </View>
                <Text style={[s.chevron, { color: section.color }]}>{isOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {/* Topics */}
              {isOpen && (
                <View style={s.topicsWrap}>
                  {section.topics.map((topic, tIdx) => {
                    const status = getStatus(topic.id);
                    const unlocked = isUnlocked(section, tIdx);
                    const locked = !unlocked;
                    const p = kebProgress[topic.id];
                    const maxScore = getTopicMaxScore(topic);
                    const passScore = getTopicPassScore(topic);
                    const isLast = tIdx === section.topics.length - 1;

                    let statusIcon = '🔒';
                    let statusColor = T.faint;
                    let statusText = 'Заблокировано';
                    if (status === 'completed') {
                      statusIcon = '✅';
                      statusColor = T.green;
                      statusText = `Сдано · ${p.examScore}%`;
                    } else if (status === 'inprogress') {
                      statusIcon = '📖';
                      statusColor = T.gold;
                      statusText = 'В процессе';
                    } else if (!locked) {
                      statusIcon = '🔓';
                      statusColor = T.text;
                      statusText = 'Доступно';
                    }

                    return (
                      <View key={topic.id} style={s.topicRow}>
                        {/* Tree line */}
                        <View style={s.tree}>
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
                              s.treeDot,
                              {
                                backgroundColor:
                                  status === 'completed'
                                    ? T.green
                                    : status === 'inprogress'
                                      ? T.gold
                                      : locked
                                        ? T.border
                                        : section.color,
                              },
                            ]}
                          >
                            <Text style={s.treeDotText}>
                              {status === 'completed' ? '✓' : tIdx + 1}
                            </Text>
                          </View>
                        </View>

                        {/* Topic card */}
                        <TouchableOpacity
                          style={[
                            s.topicCard,
                            status === 'completed' && s.topicCardDone,
                            status === 'inprogress' && { borderColor: T.gold },
                            !locked && status === 'locked' && { borderColor: section.color + '88' },
                            locked && s.topicCardLocked,
                          ]}
                          onPress={() => !locked && onTopicPress(topic, section)}
                          disabled={locked}
                          activeOpacity={0.75}
                        >
                          {/* Top row */}
                          <View style={s.topicTop}>
                            <Text style={s.topicIcon}>{topic.icon}</Text>
                            <View style={s.topicInfo}>
                              <Text
                                style={[s.topicTitle, locked && { color: T.faint }]}
                                numberOfLines={2}
                              >
                                {topic.title}
                              </Text>
                              <Text style={[s.topicStatusText, { color: statusColor }]}>
                                {statusIcon} {statusText}
                              </Text>
                            </View>
                          </View>

                          {/* Stats row */}
                          <View style={s.topicStats}>
                            <View style={[s.statChip, { backgroundColor: section.colorBg }]}>
                              <Text style={[s.statChipText, { color: section.color }]}>
                                {topic.questions.length} вопросов
                              </Text>
                            </View>
                            <View style={[s.statChip, { backgroundColor: T.card }]}>
                              <Text style={s.statChipText}>макс. {maxScore} б.</Text>
                            </View>
                            <View style={[s.statChip, { backgroundColor: T.goldBg }]}>
                              <Text style={[s.statChipText, { color: T.gold }]}>
                                нужно {passScore} б.
                              </Text>
                            </View>
                          </View>

                          {/* Score bar */}
                          {p?.lastScore != null && (
                            <View style={s.scoreWrap}>
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
                                <View style={s.scoreLine} />
                              </View>
                              <Text
                                style={[s.scoreText, { color: p.examPassed ? T.green : T.red }]}
                              >
                                {p.lastScore}/{maxScore}
                              </Text>
                            </View>
                          )}

                          {/* Difficulty breakdown */}
                          <View style={s.diffRow}>
                            {[1, 2, 3].map((d) => {
                              const cnt = topic.questions.filter((q) => q.difficulty === d).length;
                              if (!cnt) return null;
                              const colors = { 1: T.green, 2: T.gold, 3: T.red };
                              const labels = { 1: 'лёгк.', 2: 'средн.', 3: 'сложн.' };
                              return (
                                <View key={d} style={s.diffChip}>
                                  <View style={[s.diffDot, { backgroundColor: colors[d] }]} />
                                  <Text style={s.diffText}>
                                    {cnt} {labels[d]}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>

                          {locked && (
                            <Text style={s.lockMsg}>
                              🔒 Сдайте: «{section.topics[tIdx - 1]?.title}»
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
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: { padding: 20, paddingBottom: 12 },
  title: { color: T.text, fontSize: 22, fontWeight: '700', marginBottom: 4 },
  sub: { color: T.sub, fontSize: 12, marginBottom: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statPill: { alignItems: 'center' },
  statNum: { color: T.gold, fontSize: 18, fontWeight: '700' },
  statLabel: { color: T.faint, fontSize: 10 },
  overallBarWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  overallBar: {
    flex: 1,
    height: 6,
    backgroundColor: T.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  overallFill: { height: '100%', backgroundColor: T.gold, borderRadius: 3 },
  overallPct: { color: T.gold, fontSize: 13, fontWeight: '700' },

  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, gap: 10 },

  sectionWrap: {},
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: T.border,
  },
  sectionIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIcon: { fontSize: 22 },
  sectionMeta: { flex: 1 },
  sectionTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  sectionNum: { color: T.faint, fontSize: 11, fontWeight: '600' },
  doneBadge: {
    backgroundColor: T.greenBg,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  doneBadgeText: { color: T.green, fontSize: 10, fontWeight: '700' },
  sectionTitle: { color: T.text, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  sectionBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionBar: {
    flex: 1,
    height: 4,
    backgroundColor: T.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  sectionBarFill: { height: '100%', borderRadius: 2 },
  sectionBarLabel: { fontSize: 11, fontWeight: '700' },
  chevron: { fontSize: 12, fontWeight: '700' },

  topicsWrap: { paddingLeft: 14, paddingTop: 6 },
  topicRow: { flexDirection: 'row', marginBottom: 8 },

  tree: { width: 30, position: 'relative', alignItems: 'center' },
  treeVert: { position: 'absolute', left: 14, top: 0, bottom: 0, width: 2 },
  treeVertLast: { bottom: '50%' },
  treeHoriz: { position: 'absolute', top: '50%', left: 14, right: 0, height: 2 },
  treeDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    zIndex: 1,
  },
  treeDotText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  topicCard: {
    flex: 1,
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: T.border,
  },
  topicCardDone: { borderColor: T.green + '55' },
  topicCardLocked: { opacity: 0.4 },

  topicTop: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 10 },
  topicIcon: { fontSize: 20, marginTop: 1 },
  topicInfo: { flex: 1 },
  topicTitle: { color: T.text, fontSize: 13, fontWeight: '600', lineHeight: 18, marginBottom: 3 },
  topicStatusText: { fontSize: 11, fontWeight: '600' },

  topicStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  statChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statChipText: { color: T.sub, fontSize: 10, fontWeight: '600' },

  scoreWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  scoreBar: {
    flex: 1,
    height: 5,
    backgroundColor: T.border,
    borderRadius: 3,
    overflow: 'visible',
    position: 'relative',
  },
  scoreBarFill: { height: '100%', borderRadius: 3 },
  scoreLine: {
    position: 'absolute',
    left: '80%',
    top: -2,
    width: 2,
    height: 9,
    backgroundColor: T.gold,
  },
  scoreText: { fontSize: 11, fontWeight: '700' },

  diffRow: { flexDirection: 'row', gap: 10 },
  diffChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  diffDot: { width: 6, height: 6, borderRadius: 3 },
  diffText: { color: T.faint, fontSize: 10 },

  lockMsg: { color: T.faint, fontSize: 10, marginTop: 8, fontStyle: 'italic' },
});
