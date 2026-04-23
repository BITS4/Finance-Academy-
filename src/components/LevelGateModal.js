import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal,
} from 'react-native';
import { T } from '../theme';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LevelGateModal({ level, onClose, onPass }) {
  const [phase, setPhase] = useState('intro'); // intro | quiz | result
  const [cur, setCur] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [retryCount, setRetryCount] = useState(0);

  // Shuffle pool and pick 6 questions on each mount/retry
  const questions = useMemo(() => {
    if (!level?.examGate) return [];
    return shuffleArray([...level.examGate.questions]).slice(0, 6);
  }, [retryCount, level]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!level) return null;

  const gate = level.examGate;
  const totalQ = questions.length;
  const q = cur < totalQ ? questions[cur] : null;

  function confirmAnswer() {
    if (selected === null) return;
    setConfirmed(true);
  }

  function nextQuestion() {
    const newAnswers = [...answers, { isCorrect: selected === q.correct, selected }];
    setAnswers(newAnswers);
    setSelected(null);
    setConfirmed(false);
    if (cur < totalQ - 1) setCur(cur + 1);
    else setPhase('result');
  }

  const correctCount = answers.filter(a => a.isCorrect).length;
  const score = totalQ ? Math.round((correctCount / totalQ) * 100) : 0;
  const passed = score >= gate.passingScore;

  function restart() {
    setRetryCount(c => c + 1);
    setPhase('quiz');
    setCur(0);
    setSelected(null);
    setConfirmed(false);
    setAnswers([]);
  }

  if (phase === 'intro') {
    return (
      <Modal visible animationType="slide" onRequestClose={onClose}>
        <ScrollView style={s.container} contentContainerStyle={s.content}>
          {/* Level badge */}
          <View style={[s.levelBadge, { backgroundColor: level.colorBg, borderColor: level.color }]}>
            <Text style={s.levelBadgeIcon}>{level.icon}</Text>
            <Text style={[s.levelBadgeText, { color: level.color }]}>Уровень {level.num} · {level.title}</Text>
          </View>

          <Text style={s.gateTitle}>{gate.title}</Text>
          <Text style={s.gateDesc}>{gate.description}</Text>

          {/* Stats */}
          <View style={s.statsRow}>
            <StatCard icon="📝" value={`${totalQ}`} label="Вопросов" />
            <StatCard icon="🎯" value={`${gate.passingScore}%`} label="Порог" color={T.gold} />
            <StatCard icon="⏱" value={`${gate.timeLimit / 60} мин`} label="Лимит" />
            <StatCard icon="⚡" value="+150 XP" label="Награда" color={T.gold} />
          </View>

          {/* Rules */}
          <View style={s.rulesCard}>
            <Text style={s.rulesTitle}>📋 Условия перехода:</Text>
            <Text style={s.rulesItem}>✅ Завершены все уроки уровня</Text>
            <Text style={s.rulesItem}>✅ Пройден тренажёр интервью</Text>
            <Text style={s.rulesItem}>🎯 Набери минимум {gate.passingScore}% в финальном тесте</Text>
            <Text style={s.rulesItem}>🔓 Успешное прохождение разблокирует Уровень {level.id + 1}</Text>
          </View>

          {/* Target exam context */}
          <View style={[s.examContext, { borderColor: level.color + '55' }]}>
            <Text style={[s.examContextBadge, { color: level.color }]}>🎓 Этот тест ≈ сложности {level.targetExam}</Text>
          </View>

          <TouchableOpacity style={[s.startBtn, { backgroundColor: level.color }]} onPress={() => setPhase('quiz')} activeOpacity={0.8}>
            <Text style={s.startBtnText}>🚀 Начать финальный тест</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.cancelText}>Вернуться к уровню</Text>
          </TouchableOpacity>
          <View style={{ height: 32 }} />
        </ScrollView>
      </Modal>
    );
  }

  if (phase === 'result') {
    return (
      <Modal visible animationType="slide" onRequestClose={onClose}>
        <ScrollView style={s.container} contentContainerStyle={s.content}>
          {/* Score card */}
          <View style={[s.scoreCard, { backgroundColor: passed ? T.greenBg : T.redBg }]}>
            <Text style={s.scoreEmoji}>
              {score >= 95 ? '🏆' : score >= gate.passingScore ? '✅' : '📚'}
            </Text>
            <Text style={[s.scorePct, { color: passed ? T.green : T.red }]}>{score}%</Text>
            <Text style={s.scoreDetail}>{correctCount} из {totalQ} верных</Text>
            <Text style={[s.scoreVerdict, { color: passed ? T.green : T.red }]}>
              {passed
                ? `✓ Уровень ${level.num} пройден!`
                : `✗ Нужно ${gate.passingScore}% — попробуй ещё`}
            </Text>
          </View>

          {passed && (
            <View style={[s.unlockCard, { borderColor: level.color }]}>
              <Text style={s.unlockEmoji}>🔓</Text>
              <Text style={[s.unlockTitle, { color: level.color }]}>
                {level.id < 5 ? `Уровень ${level.id + 1} разблокирован!` : '🏆 Весь курс пройден!'}
              </Text>
              <Text style={s.unlockSub}>
                {level.id < 5
                  ? `Следующий: ${['', 'Корпоративный учёт', 'Корпоративные финансы', 'Инвестиционный банкинг', 'Карьерный хакинг'][level.id] || ''}`
                  : 'Ты готов к техническим интервью в IB/PE'}
              </Text>
            </View>
          )}

          {/* Questions review */}
          <Text style={s.reviewTitle}>Разбор вопросов:</Text>
          {questions.map((q2, i) => {
            const ans = answers[i];
            if (!ans) return null;
            return (
              <View key={q2.id} style={[s.reviewItem, ans.isCorrect ? s.reviewOk : s.reviewFail]}>
                <View style={s.reviewHeader}>
                  <Text style={s.reviewNum}>#{i + 1}</Text>
                  <Text style={[s.reviewResult, { color: ans.isCorrect ? T.green : T.red }]}>
                    {ans.isCorrect ? '✓ Верно' : '✗ Неверно'}
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

          {passed ? (
            <TouchableOpacity
              style={[s.startBtn, { backgroundColor: level.color }]}
              onPress={() => onPass && onPass(score)}
              activeOpacity={0.8}
            >
              <Text style={s.startBtnText}>
                {level.id < 5 ? `🚀 Перейти к Уровню ${level.id + 1}` : '🏆 Завершить курс'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[s.startBtn, { backgroundColor: level.color }]} onPress={restart} activeOpacity={0.8}>
              <Text style={s.startBtnText}>🔄 Пересдать тест</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.cancelText}>Закрыть</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </Modal>
    );
  }

  // Quiz phase
  const progressPct = totalQ ? (cur / totalQ) * 100 : 0;
  const isCorrect = selected === q?.correct;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={s.container}>
        {/* Header */}
        <View style={[s.quizHeader, { borderBottomColor: level.color + '44' }]}>
          <Text style={[s.quizTitle, { color: level.color }]}>{level.icon} Финальный тест · Уровень {level.num}</Text>
          <Text style={s.quizCount}>{cur + 1}/{totalQ}</Text>
        </View>

        {/* Progress */}
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${progressPct}%`, backgroundColor: level.color }]} />
        </View>

        <ScrollView contentContainerStyle={s.quizContent} showsVerticalScrollIndicator={false}>
          <Text style={s.questionText}>{q?.text}</Text>

          <View style={s.optionsWrap}>
            {q?.opts.map((opt, i) => {
              let optStyle = s.option;
              let textStyle = s.optText;
              if (confirmed) {
                if (i === q.correct) { optStyle = [s.option, s.optCorrect]; textStyle = [s.optText, { color: T.green }]; }
                else if (i === selected) { optStyle = [s.option, s.optWrong]; textStyle = [s.optText, { color: T.red }]; }
              } else if (selected === i) {
                optStyle = [s.option, { borderColor: level.color, backgroundColor: level.colorBg }];
              }
              return (
                <TouchableOpacity
                  key={i} style={optStyle}
                  onPress={() => !confirmed && setSelected(i)}
                  disabled={confirmed} activeOpacity={0.75}
                >
                  <View style={[
                    s.optLetter,
                    confirmed && i === q.correct && { backgroundColor: T.green },
                    confirmed && i === selected && i !== q.correct && { backgroundColor: T.red },
                    !confirmed && selected === i && { backgroundColor: level.color },
                  ]}>
                    <Text style={s.optLetterText}>{['А', 'Б', 'В', 'Г'][i]}</Text>
                  </View>
                  <Text style={textStyle}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {confirmed && (
            <View style={[s.feedback, isCorrect ? s.fbOk : s.fbFail]}>
              <Text style={[s.fbText, { color: isCorrect ? T.green : T.red }]}>
                {isCorrect ? '✅ ' : '❌ '}{q.explanation}
              </Text>
            </View>
          )}

          {!confirmed ? (
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: level.color, opacity: selected === null ? 0.4 : 1 }]}
              onPress={confirmAnswer}
              disabled={selected === null}
              activeOpacity={0.8}
            >
              <Text style={s.actionBtnText}>Проверить ответ</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: T.blue }]}
              onPress={nextQuestion}
              activeOpacity={0.8}
            >
              <Text style={[s.actionBtnText, { color: '#fff' }]}>
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

function StatCard({ icon, value, label, color }) {
  return (
    <View style={s.statCard}>
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={[s.statValue, color && { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 20, paddingTop: 56 },

  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1,
    alignSelf: 'flex-start', marginBottom: 16,
  },
  levelBadgeIcon: { fontSize: 16 },
  levelBadgeText: { fontSize: 12, fontWeight: '700' },
  gateTitle: { color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  gateDesc: { color: T.sub, fontSize: 14, lineHeight: 21, marginBottom: 16 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: T.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: T.border },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { color: T.text, fontSize: 14, fontWeight: '800', marginBottom: 2 },
  statLabel: { color: T.sub, fontSize: 10, textAlign: 'center' },

  rulesCard: { backgroundColor: T.surface, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: T.border },
  rulesTitle: { color: T.text, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  rulesItem: { color: T.sub, fontSize: 13, marginBottom: 6, lineHeight: 19 },

  examContext: { borderRadius: 10, padding: 10, borderWidth: 1, marginBottom: 20, alignSelf: 'flex-start' },
  examContextBadge: { fontSize: 12, fontWeight: '600' },

  startBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 },
  startBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', padding: 10 },
  cancelText: { color: T.sub, fontSize: 14 },

  // Result
  scoreCard: { borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 16 },
  scoreEmoji: { fontSize: 52, marginBottom: 10 },
  scorePct: { fontSize: 48, fontWeight: '900' },
  scoreDetail: { color: T.sub, fontSize: 14, marginTop: 4 },
  scoreVerdict: { fontSize: 17, fontWeight: '700', marginTop: 8 },

  unlockCard: {
    backgroundColor: T.card, borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 16, borderWidth: 2,
  },
  unlockEmoji: { fontSize: 40, marginBottom: 8 },
  unlockTitle: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  unlockSub: { color: T.sub, fontSize: 13, textAlign: 'center' },

  reviewTitle: { color: T.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  reviewItem: { borderRadius: 14, padding: 14, marginBottom: 10 },
  reviewOk: { backgroundColor: T.greenBg },
  reviewFail: { backgroundColor: T.redBg },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewNum: { color: T.sub, fontSize: 12, fontWeight: '700' },
  reviewResult: { fontSize: 12, fontWeight: '700' },
  reviewQ: { color: T.text, fontSize: 13, fontWeight: '600', lineHeight: 19, marginBottom: 6 },
  reviewWrong: { color: T.red, fontSize: 12, marginBottom: 4 },
  reviewCorrect: { color: T.green, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  reviewExplain: { color: T.sub, fontSize: 12, lineHeight: 18 },

  // Quiz
  quizHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 52, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1,
  },
  quizTitle: { fontSize: 13, fontWeight: '700', flex: 1 },
  quizCount: { color: T.sub, fontSize: 13 },
  progressBar: { height: 4, backgroundColor: T.border },
  progressFill: { height: '100%' },
  quizContent: { padding: 20 },
  questionText: { color: T.text, fontSize: 16, fontWeight: '600', lineHeight: 25, marginBottom: 20 },
  optionsWrap: { gap: 10, marginBottom: 20 },
  option: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: T.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: T.border,
  },
  optCorrect: { borderColor: T.green, backgroundColor: T.greenBg },
  optWrong: { borderColor: T.red, backgroundColor: T.redBg },
  optLetter: { width: 32, height: 32, borderRadius: 8, backgroundColor: T.card, alignItems: 'center', justifyContent: 'center' },
  optLetterText: { color: T.text, fontSize: 12, fontWeight: '700' },
  optText: { color: T.sub, fontSize: 14, flex: 1, lineHeight: 20 },
  feedback: { borderRadius: 14, padding: 14, marginBottom: 16 },
  fbOk: { backgroundColor: T.greenBg },
  fbFail: { backgroundColor: T.redBg },
  fbText: { fontSize: 13, lineHeight: 20 },
  actionBtn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  actionBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
});
