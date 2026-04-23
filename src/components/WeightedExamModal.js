import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal,
} from 'react-native';
import { T } from '../theme';
import { getTopicMaxScore, getTopicPassScore, calcWeightedScore } from '../data/kebData';

const DIFF_LABEL = { 1: '● Лёгкий', 2: '●● Средний', 3: '●●● Сложный' };
const DIFF_COLOR = { 1: T.green, 2: T.gold, 3: T.red };
const DIFF_POINTS = { 1: '1 балл', 2: '2 балла', 3: '3 балла' };

export default function WeightedExamModal({ topic, section, onClose, onPass }) {
  const [phase, setPhase] = useState('intro'); // intro | quiz | result
  const [cur, setCur] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState([]);

  const questions = topic.questions;
  const totalQ = questions.length;
  const maxScore = getTopicMaxScore(topic);
  const passScore = getTopicPassScore(topic);
  const q = cur < totalQ ? questions[cur] : null;

  function confirm() {
    if (selected === null) return;
    setConfirmed(true);
  }

  function goNext() {
    const newAnswers = [...answers, {
      isCorrect: selected === q.correct,
      selected,
      correct: q.correct,
      difficulty: q.difficulty,
    }];
    setAnswers(newAnswers);
    setSelected(null);
    setConfirmed(false);
    if (cur < totalQ - 1) setCur(cur + 1);
    else setPhase('result');
  }

  const earned = calcWeightedScore(topic, answers);
  const pct = maxScore ? Math.round((earned / maxScore) * 100) : 0;
  const passed = earned >= passScore;

  if (phase === 'intro') {
    return (
      <Modal visible animationType="slide" onRequestClose={onClose}>
        <ScrollView style={s.container} contentContainerStyle={s.introContent}>
          <View style={[s.topicBadge, { backgroundColor: section.colorBg }]}>
            <Text style={s.topicBadgeIcon}>{topic.icon}</Text>
            <Text style={[s.topicBadgeText, { color: section.color }]}>{section.title} · Раздел {section.number}</Text>
          </View>

          <Text style={s.introTitle}>{topic.title}</Text>
          <Text style={s.introDesc}>Тест по теме с взвешенными баллами</Text>

          <View style={s.infoCards}>
            <InfoCard icon="📝" label="Вопросов" value={`${totalQ}`} />
            <InfoCard icon="🎯" label="Макс. баллов" value={`${maxScore}`} />
            <InfoCard icon="✅" label="Нужно набрать" value={`${passScore} б. (80%)`} color={T.gold} />
          </View>

          {/* Difficulty breakdown */}
          <View style={s.diffCard}>
            <Text style={s.diffTitle}>Распределение вопросов:</Text>
            {[1, 2, 3].map(d => {
              const count = questions.filter(q => q.difficulty === d).length;
              if (!count) return null;
              return (
                <View key={d} style={s.diffRow}>
                  <Text style={[s.diffLabel, { color: DIFF_COLOR[d] }]}>{DIFF_LABEL[d]}</Text>
                  <Text style={s.diffCount}>{count} вопр. × {DIFF_POINTS[d]}</Text>
                </View>
              );
            })}
          </View>

          {/* Content preview */}
          <View style={s.contentCard}>
            <Text style={s.contentTitle}>📖 Материал темы</Text>
            <Text style={s.contentText} numberOfLines={8}>{topic.content.replace(/#{1,3} /g, '').replace(/\*\*/g, '')}</Text>
          </View>

          <TouchableOpacity style={[s.startBtn, { backgroundColor: section.color }]} onPress={() => setPhase('quiz')}>
            <Text style={s.startBtnText}>Начать экзамен →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
            <Text style={s.cancelBtnText}>Вернуться к плану</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    );
  }

  if (phase === 'result') {
    const finalPct = maxScore ? Math.round((earned / maxScore) * 100) : 0;
    const finalPassed = earned >= passScore;
    return (
      <Modal visible animationType="slide" onRequestClose={onClose}>
        <ScrollView style={s.container} contentContainerStyle={s.introContent}>
          {/* Score card */}
          <View style={[s.scoreCard, { backgroundColor: finalPassed ? T.greenBg : T.redBg }]}>
            <Text style={s.scoreEmoji}>{finalPct >= 95 ? '🏆' : finalPct >= 80 ? '✅' : '📚'}</Text>
            <Text style={[s.scorePct, { color: finalPassed ? T.green : T.red }]}>{finalPct}%</Text>
            <Text style={s.scorePoints}>{earned} из {maxScore} баллов</Text>
            <Text style={[s.scoreVerdict, { color: finalPassed ? T.green : T.red }]}>
              {finalPassed ? '✓ Тема сдана!' : `✗ Нужно ${passScore} б. — попробуйте ещё`}
            </Text>
          </View>

          {/* Weighted score breakdown */}
          <View style={s.breakdownCard}>
            <Text style={s.breakdownTitle}>Результат по сложности:</Text>
            {[1, 2, 3].map(d => {
              const qs = questions.filter(q => q.difficulty === d);
              if (!qs.length) return null;
              const earned_d = answers.filter((a, i) => questions[i]?.difficulty === d && a.isCorrect).length;
              return (
                <View key={d} style={s.breakdownRow}>
                  <Text style={[s.breakdownDiff, { color: DIFF_COLOR[d] }]}>{DIFF_LABEL[d]}</Text>
                  <Text style={s.breakdownResult}>{earned_d}/{qs.length} верных × {d}б = {earned_d * d}/{qs.length * d}б</Text>
                </View>
              );
            })}
          </View>

          {/* Detailed review */}
          <Text style={s.reviewTitle}>Разбор вопросов:</Text>
          {questions.map((q2, i) => {
            const ans = answers[i];
            if (!ans) return null;
            return (
              <View key={q2.id} style={[s.reviewItem, ans.isCorrect ? s.reviewOk : s.reviewFail]}>
                <View style={s.reviewHeader}>
                  <Text style={[s.reviewNum]}>#{i + 1}</Text>
                  <View style={[s.diffPill, { backgroundColor: DIFF_COLOR[q2.difficulty] + '33' }]}>
                    <Text style={[s.diffPillText, { color: DIFF_COLOR[q2.difficulty] }]}>
                      {DIFF_LABEL[q2.difficulty]} · {q2.difficulty}б
                    </Text>
                  </View>
                  <Text style={[s.pointsEarned, { color: ans.isCorrect ? T.green : T.red }]}>
                    {ans.isCorrect ? `+${q2.difficulty}б` : '+0б'}
                  </Text>
                </View>
                <Text style={s.reviewQ}>{q2.text}</Text>
                {!ans.isCorrect && (
                  <Text style={s.reviewWrong}>Ваш ответ: {q2.opts[ans.selected]}</Text>
                )}
                <Text style={s.reviewCorrect}>✓ {q2.opts[q2.correct]}</Text>
                <Text style={s.reviewExplain}>{q2.explanation}</Text>
              </View>
            );
          })}

          {finalPassed ? (
            <TouchableOpacity style={[s.startBtn, { backgroundColor: T.green }]} onPress={() => onPass(finalPct, earned, maxScore)}>
              <Text style={s.startBtnText}>Сохранить результат →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[s.startBtn, { backgroundColor: section.color }]} onPress={() => {
              setAnswers([]); setCur(0); setSelected(null); setConfirmed(false); setPhase('quiz');
            }}>
              <Text style={s.startBtnText}>🔄 Пересдать</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
            <Text style={s.cancelBtnText}>Закрыть</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </Modal>
    );
  }

  // Quiz phase
  const progress = totalQ > 0 ? cur / totalQ : 0;
  const feedback = (() => {
    if (!confirmed || !q) return null;
    const isCorrect = selected === q.correct;
    if (isCorrect) return { type: 'correct', msg: '✅ Правильно! ' + q.explanation };
    return { type: 'wrong', msg: '❌ Неверно. ' + q.explanation };
  })();

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={s.container}>
        {/* Header */}
        <View style={[s.quizHeader, { borderBottomColor: section.color + '44' }]}>
          <Text style={[s.quizTitle, { color: section.color }]}>{topic.icon} {topic.title}</Text>
          <Text style={s.quizCount}>{cur + 1}/{totalQ}</Text>
        </View>

        {/* Progress bar */}
        <View style={s.progBar}>
          <View style={[s.progFill, { width: `${(cur / totalQ) * 100}%`, backgroundColor: section.color }]} />
        </View>

        <ScrollView contentContainerStyle={s.quizContent} showsVerticalScrollIndicator={false}>
          {/* Difficulty badge */}
          {q && (
            <View style={[s.diffBadge, { backgroundColor: DIFF_COLOR[q.difficulty] + '22' }]}>
              <Text style={[s.diffBadgeText, { color: DIFF_COLOR[q.difficulty] }]}>
                {DIFF_LABEL[q.difficulty]} · стоит {q.difficulty} {q.difficulty === 1 ? 'балл' : q.difficulty < 5 ? 'балла' : 'баллов'}
              </Text>
            </View>
          )}

          <Text style={s.question}>{q?.text}</Text>

          <View style={s.options}>
            {q?.opts.map((opt, i) => {
              let optStyle = s.option;
              let textStyle = s.optText;
              if (confirmed) {
                if (i === q.correct) { optStyle = [s.option, s.optCorrect]; textStyle = [s.optText, { color: T.green }]; }
                else if (i === selected) { optStyle = [s.option, s.optWrong]; textStyle = [s.optText, { color: T.red }]; }
              } else if (selected === i) {
                optStyle = [s.option, { borderColor: section.color, backgroundColor: section.colorBg }];
              }
              return (
                <TouchableOpacity
                  key={i} style={optStyle}
                  onPress={() => !confirmed && setSelected(i)}
                  disabled={confirmed} activeOpacity={0.75}
                >
                  <View style={[s.letter,
                    confirmed && i === q.correct && { backgroundColor: T.green },
                    confirmed && i === selected && i !== q.correct && { backgroundColor: T.red },
                    !confirmed && selected === i && { backgroundColor: section.color },
                  ]}>
                    <Text style={s.letterText}>{['А', 'Б', 'В', 'Г'][i]}</Text>
                  </View>
                  <Text style={textStyle}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {feedback && (
            <View style={[s.feedback, feedback.type === 'correct' ? s.fbOk : s.fbFail]}>
              <Text style={[s.fbText, { color: feedback.type === 'correct' ? T.green : T.red }]}>
                {feedback.msg}
              </Text>
            </View>
          )}

          {!confirmed ? (
            <TouchableOpacity
              style={[s.btn, { backgroundColor: section.color }, selected === null && s.btnDisabled]}
              onPress={confirm} disabled={selected === null}
            >
              <Text style={s.btnText}>Проверить ответ</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[s.btn, { backgroundColor: T.blue }]} onPress={goNext}>
              <Text style={[s.btnText, { color: '#fff' }]}>
                {cur < totalQ - 1 ? 'Следующий →' : 'Завершить тест →'}
              </Text>
            </TouchableOpacity>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function InfoCard({ icon, label, value, color }) {
  return (
    <View style={s.infoCard}>
      <Text style={s.infoIcon}>{icon}</Text>
      <Text style={s.infoValue} numberOfLines={1}>{value}</Text>
      <Text style={s.infoLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  introContent: { padding: 20 },
  topicBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 16 },
  topicBadgeIcon: { fontSize: 16 },
  topicBadgeText: { fontSize: 12, fontWeight: '600' },
  introTitle: { color: T.text, fontSize: 22, fontWeight: '700', marginBottom: 6 },
  introDesc: { color: T.sub, fontSize: 14, marginBottom: 20 },
  infoCards: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  infoCard: { flex: 1, backgroundColor: T.surface, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: T.border },
  infoIcon: { fontSize: 22, marginBottom: 6 },
  infoValue: { color: T.text, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  infoLabel: { color: T.sub, fontSize: 11, textAlign: 'center' },
  diffCard: { backgroundColor: T.surface, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: T.border },
  diffTitle: { color: T.text, fontSize: 14, fontWeight: '600', marginBottom: 12 },
  diffRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  diffLabel: { fontSize: 13, fontWeight: '600' },
  diffCount: { color: T.sub, fontSize: 13 },
  contentCard: { backgroundColor: T.card, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: T.border },
  contentTitle: { color: T.text, fontSize: 14, fontWeight: '600', marginBottom: 10 },
  contentText: { color: T.sub, fontSize: 12, lineHeight: 18 },
  startBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 },
  startBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelBtnText: { color: T.sub, fontSize: 14 },

  // Score
  scoreCard: { borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 20 },
  scoreEmoji: { fontSize: 56, marginBottom: 10 },
  scorePct: { fontSize: 52, fontWeight: '700' },
  scorePoints: { color: T.sub, fontSize: 14, marginTop: 4 },
  scoreVerdict: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  breakdownCard: { backgroundColor: T.surface, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: T.border },
  breakdownTitle: { color: T.text, fontSize: 14, fontWeight: '600', marginBottom: 12 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  breakdownDiff: { fontSize: 13, fontWeight: '600' },
  breakdownResult: { color: T.sub, fontSize: 12 },
  reviewTitle: { color: T.text, fontSize: 16, fontWeight: '600', marginBottom: 14 },
  reviewItem: { borderRadius: 14, padding: 14, marginBottom: 10 },
  reviewOk: { backgroundColor: T.greenBg },
  reviewFail: { backgroundColor: T.redBg },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  reviewNum: { color: T.sub, fontSize: 12, fontWeight: '700' },
  diffPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  diffPillText: { fontSize: 11, fontWeight: '600' },
  pointsEarned: { marginLeft: 'auto', fontSize: 13, fontWeight: '700' },
  reviewQ: { color: T.text, fontSize: 13, fontWeight: '600', lineHeight: 18, marginBottom: 6 },
  reviewWrong: { color: T.red, fontSize: 12, marginBottom: 4 },
  reviewCorrect: { color: T.green, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  reviewExplain: { color: T.sub, fontSize: 12, lineHeight: 18 },

  // Quiz
  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 52, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  quizTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  quizCount: { color: T.sub, fontSize: 13 },
  progBar: { height: 4, backgroundColor: T.border },
  progFill: { height: '100%' },
  quizContent: { padding: 20 },
  diffBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
  diffBadgeText: { fontSize: 12, fontWeight: '700' },
  question: { color: T.text, fontSize: 17, fontWeight: '600', lineHeight: 26, marginBottom: 24 },
  options: { gap: 10, marginBottom: 20 },
  option: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: T.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: T.border },
  optCorrect: { borderColor: T.green, backgroundColor: T.greenBg },
  optWrong: { borderColor: T.red, backgroundColor: T.redBg },
  letter: { width: 32, height: 32, borderRadius: 8, backgroundColor: T.card, alignItems: 'center', justifyContent: 'center' },
  letterText: { color: T.text, fontSize: 12, fontWeight: '700' },
  optText: { color: T.sub, fontSize: 14, flex: 1, lineHeight: 20 },
  feedback: { borderRadius: 14, padding: 14, marginBottom: 16 },
  fbOk: { backgroundColor: T.greenBg },
  fbFail: { backgroundColor: T.redBg },
  fbText: { fontSize: 14, lineHeight: 22 },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#000', fontSize: 15, fontWeight: '700' },
});
