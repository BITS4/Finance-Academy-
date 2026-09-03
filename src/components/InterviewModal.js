import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { T } from '../theme';

export default function InterviewModal({ level, onClose, onComplete }) {
  const [phase, setPhase] = useState('intro'); // intro | thinking | reveal | model
  const [hintsShown, setHintsShown] = useState(0);
  const [hypothesesSelected, setHypothesesSelected] = useState([]);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef = useRef(null);

  const q = level?.interviewQuestion;
  const timeLimit = q?.timeLimit ?? 0;

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev >= timeLimit) {
            clearInterval(intervalRef.current);
            setTimerRunning(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning, timeLimit]);

  if (!q) return null;

  function startThinking() {
    setPhase('thinking');
    setTimer(0);
    setTimerRunning(true);
  }

  function showReveal() {
    setTimerRunning(false);
    setPhase('reveal');
  }

  function toggleHypothesis(id) {
    setHypothesesSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  const timerPct = Math.min((timer / q.timeLimit) * 100, 100);
  const timerColor = timerPct > 90 ? T.red : timerPct > 70 ? T.gold : T.green;

  const correctSelected = q.correctHypotheses
    ? q.correctHypotheses.filter((h) => hypothesesSelected.includes(h.id)).length
    : 0;

  if (phase === 'intro') {
    return (
      <Modal visible animationType="slide" onRequestClose={onClose}>
        <ScrollView style={s.container} contentContainerStyle={s.content}>
          {/* Source badge */}
          <View
            style={[s.sourceBadge, { backgroundColor: level.colorBg, borderColor: level.color }]}
          >
            <Text style={[s.sourceText, { color: level.color }]}>🏢 {q.source}</Text>
          </View>

          <Text style={s.roleText}>{q.role}</Text>
          <Text style={s.introTitle}>Тренажёр интервью</Text>

          {/* The question */}
          <View style={[s.questionCard, { borderColor: level.color }]}>
            <Text style={s.questionLabel}>Вопрос интервьюера:</Text>
            <Text style={s.questionText}>"{q.question}"</Text>
          </View>

          {/* Timer info */}
          <View style={s.timerInfo}>
            <View style={s.timerInfoItem}>
              <Text style={s.timerInfoIcon}>⏱</Text>
              <Text style={s.timerInfoText}>Лимит: {formatTime(q.timeLimit)}</Text>
            </View>
            <View style={s.timerInfoItem}>
              <Text style={s.timerInfoIcon}>💡</Text>
              <Text style={s.timerInfoText}>{q.hints.length} подсказок</Text>
            </View>
            <View style={s.timerInfoItem}>
              <Text style={s.timerInfoIcon}>⚡</Text>
              <Text style={s.timerInfoText}>+100 XP</Text>
            </View>
          </View>

          {/* How to use */}
          <View style={s.howToCard}>
            <Text style={s.howToTitle}>Как работает тренажёр:</Text>
            <Text style={s.howToStep}>1️⃣ Прочитай вопрос и нажми «Начать» — пойдёт таймер</Text>
            <Text style={s.howToStep}>2️⃣ Думай и формулируй ответ (вслух или мысленно)</Text>
            <Text style={s.howToStep}>3️⃣ Открывай подсказки по одной, если застрял</Text>
            <Text style={s.howToStep}>4️⃣ Сравни с эталонным ответом senior banker'а</Text>
          </View>

          <TouchableOpacity
            style={[s.startBtn, { backgroundColor: level.color }]}
            onPress={startThinking}
            activeOpacity={0.8}
          >
            <Text style={s.startBtnText}>▶ Начать таймер — Отвечай!</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.cancelText}>Вернуться</Text>
          </TouchableOpacity>
          <View style={{ height: 32 }} />
        </ScrollView>
      </Modal>
    );
  }

  if (phase === 'thinking') {
    return (
      <Modal visible animationType="none" onRequestClose={onClose}>
        <View style={s.container}>
          {/* Timer */}
          <View style={s.timerTop}>
            <Text style={[s.timerBig, { color: timerColor }]}>{formatTime(timer)}</Text>
            <Text style={s.timerMax}>/ {formatTime(q.timeLimit)}</Text>
          </View>
          <View style={s.timerBarWrap}>
            <View style={s.timerBar}>
              <View
                style={[s.timerBarFill, { width: `${timerPct}%`, backgroundColor: timerColor }]}
              />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={s.thinkingContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Question reminder */}
            <View style={[s.questionCardSmall, { borderColor: level.color }]}>
              <Text style={s.questionTextSmall}>"{q.question}"</Text>
            </View>

            {/* Hints section */}
            <View style={s.hintsSection}>
              <Text style={s.hintsTitle}>💡 Подсказки (по одной):</Text>
              {q.hints.map((hint, i) => {
                const shown = i < hintsShown;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      s.hintCard,
                      shown
                        ? { borderColor: level.color, backgroundColor: level.colorBg }
                        : s.hintCardHidden,
                    ]}
                    onPress={() => {
                      if (!shown) setHintsShown(i + 1);
                    }}
                    activeOpacity={shown ? 1 : 0.8}
                  >
                    {shown ? (
                      <Text style={[s.hintText, { color: level.color }]}>💡 {hint}</Text>
                    ) : (
                      <Text style={s.hintHiddenText}>Подсказка {i + 1} — нажми, чтобы открыть</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Hypothesis builder (if applicable) */}
            {q.correctHypotheses && (
              <View style={s.hypothesesSection}>
                <Text style={s.hypothesesTitle}>🧠 Выбери свои гипотезы:</Text>
                <Text style={s.hypothesesSub}>Отметь что считаешь правильными причинами</Text>
                {q.correctHypotheses.map((h) => (
                  <TouchableOpacity
                    key={h.id}
                    style={[
                      s.hypothesisCard,
                      hypothesesSelected.includes(h.id) && {
                        borderColor: level.color,
                        backgroundColor: level.colorBg,
                      },
                    ]}
                    onPress={() => toggleHypothesis(h.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        s.hypothesisCheck,
                        hypothesesSelected.includes(h.id) && { backgroundColor: level.color },
                      ]}
                    >
                      {hypothesesSelected.includes(h.id) && (
                        <Text style={s.hypothesisCheckMark}>✓</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        s.hypothesisText,
                        hypothesesSelected.includes(h.id) && { color: level.color },
                      ]}
                    >
                      {h.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[s.revealBtn, { backgroundColor: level.color }]}
              onPress={showReveal}
              activeOpacity={0.8}
            >
              <Text style={s.revealBtnText}>Показать ответ →</Text>
            </TouchableOpacity>
            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </Modal>
    );
  }

  if (phase === 'reveal' || phase === 'model') {
    return (
      <Modal visible animationType="slide" onRequestClose={onClose}>
        <ScrollView style={s.container} contentContainerStyle={s.content}>
          {/* Your result */}
          {q.correctHypotheses && hypothesesSelected.length > 0 && (
            <View
              style={[s.scoreCard, { backgroundColor: correctSelected >= 2 ? T.greenBg : T.redBg }]}
            >
              <Text style={[s.scoreEmoji]}>
                {correctSelected >= 3 ? '🏆' : correctSelected >= 2 ? '✅' : '📚'}
              </Text>
              <Text style={[s.scorePct, { color: correctSelected >= 2 ? T.green : T.red }]}>
                {correctSelected}/{q.correctHypotheses.length} гипотез
              </Text>
              <Text style={[s.scoreLabel, { color: correctSelected >= 2 ? T.green : T.red }]}>
                {correctSelected >= 2 ? 'Отличное структурирование!' : 'Нужно ещё практики'}
              </Text>
              <Text style={s.timeTaken}>⏱ Ответил за: {formatTime(timer)}</Text>
            </View>
          )}

          {/* Correct hypotheses review */}
          {q.correctHypotheses && (
            <View style={s.hypoReview}>
              <Text style={s.hypoReviewTitle}>✅ Правильные гипотезы:</Text>
              {q.correctHypotheses.map((h) => {
                const wasSelected = hypothesesSelected.includes(h.id);
                return (
                  <View
                    key={h.id}
                    style={[s.hypoReviewCard, wasSelected ? s.hypoCorrect : s.hypoMissed]}
                  >
                    <View style={s.hypoReviewTop}>
                      <Text style={[s.hypoReviewIcon]}>{wasSelected ? '✅' : '📝'}</Text>
                      <Text style={[s.hypoReviewText, { color: wasSelected ? T.green : T.text }]}>
                        {h.title}
                      </Text>
                    </View>
                    <Text style={s.hypoCheck}>🔍 Как проверить: {h.check}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Model answer */}
          <View style={[s.modelCard, { borderColor: level.color }]}>
            <View style={s.modelHeader}>
              <Text style={s.modelIcon}>👔</Text>
              <View>
                <Text style={[s.modelTitle, { color: level.color }]}>Эталонный ответ</Text>
                <Text style={s.modelSource}>{q.source} — Senior Banker</Text>
              </View>
            </View>
            <Text style={s.modelText}>{q.modelAnswer}</Text>
          </View>

          {/* Tips for improvement */}
          <View style={s.tipsCard}>
            <Text style={s.tipsTitle}>💡 Советы по структуре ответа:</Text>
            <Text style={s.tipsBody}>
              • Начинай с фреймворка: "Я бы разбил проблему на X и Y..."\n• Используй числа и
              конкретные метрики\n• Показывай причинно-следственные связи\n• Финиши с чёткой
              рекомендацией
            </Text>
          </View>

          <TouchableOpacity
            style={[s.startBtn, { backgroundColor: level.color }]}
            onPress={() => {
              onComplete && onComplete();
            }}
            activeOpacity={0.8}
          >
            <Text style={s.startBtnText}>✅ Завершить · +100 XP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.cancelBtn}
            onPress={() => {
              setPhase('intro');
              setTimer(0);
              setHintsShown(0);
              setHypothesesSelected([]);
            }}
            activeOpacity={0.7}
          >
            <Text style={s.cancelText}>🔄 Повторить</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </Modal>
    );
  }

  return null;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 20, paddingTop: 56 },

  sourceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  sourceText: { fontSize: 12, fontWeight: '700' },
  roleText: { color: T.sub, fontSize: 12, fontStyle: 'italic', marginBottom: 6 },
  introTitle: { color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 16 },

  questionCard: {
    backgroundColor: T.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  questionLabel: { color: T.sub, fontSize: 11, fontWeight: '700', marginBottom: 6 },
  questionText: { color: T.text, fontSize: 15, fontStyle: 'italic', lineHeight: 24 },

  timerInfo: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  timerInfoItem: {
    flex: 1,
    backgroundColor: T.surface,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.border,
  },
  timerInfoIcon: { fontSize: 18, marginBottom: 3 },
  timerInfoText: { color: T.sub, fontSize: 11, textAlign: 'center' },

  howToCard: {
    backgroundColor: T.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: T.border,
  },
  howToTitle: { color: T.text, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  howToStep: { color: T.sub, fontSize: 13, marginBottom: 6, lineHeight: 19 },

  startBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 },
  startBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', padding: 10 },
  cancelText: { color: T.sub, fontSize: 14 },

  // Thinking phase
  timerTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingTop: 52,
    paddingBottom: 8,
  },
  timerBig: { fontSize: 52, fontWeight: '900', letterSpacing: 2 },
  timerMax: { color: T.sub, fontSize: 16, marginLeft: 8 },
  timerBarWrap: { paddingHorizontal: 20, marginBottom: 16 },
  timerBar: { height: 6, backgroundColor: T.border, borderRadius: 3, overflow: 'hidden' },
  timerBarFill: { height: '100%', borderRadius: 3 },
  thinkingContent: { padding: 20 },

  questionCardSmall: {
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  questionTextSmall: { color: T.sub, fontSize: 13, fontStyle: 'italic', lineHeight: 20 },

  hintsSection: { marginBottom: 16 },
  hintsTitle: { color: T.text, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  hintCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: T.border,
    marginBottom: 8,
  },
  hintCardHidden: { borderColor: T.border, backgroundColor: T.surface },
  hintText: { fontSize: 13, lineHeight: 20 },
  hintHiddenText: { color: T.faint, fontSize: 12, fontStyle: 'italic' },

  hypothesesSection: { marginBottom: 16 },
  hypothesesTitle: { color: T.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  hypothesesSub: { color: T.sub, fontSize: 12, marginBottom: 10 },
  hypothesisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: T.border,
    marginBottom: 8,
  },
  hypothesisCheck: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: T.card,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hypothesisCheckMark: { color: '#000', fontSize: 12, fontWeight: '800' },
  hypothesisText: { color: T.text, fontSize: 13, flex: 1, lineHeight: 19 },

  revealBtn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  revealBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },

  // Result
  scoreCard: { borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },
  scoreEmoji: { fontSize: 48, marginBottom: 8 },
  scorePct: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  scoreLabel: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  timeTaken: { color: T.sub, fontSize: 12 },

  hypoReview: { marginBottom: 16 },
  hypoReviewTitle: { color: T.text, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  hypoReviewCard: { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 8 },
  hypoCorrect: { backgroundColor: T.greenBg, borderColor: T.green + '66' },
  hypoMissed: { backgroundColor: T.surface, borderColor: T.border },
  hypoReviewTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  hypoReviewIcon: { fontSize: 16 },
  hypoReviewText: { fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 19 },
  hypoCheck: { color: T.sub, fontSize: 12, lineHeight: 18 },

  modelCard: {
    backgroundColor: T.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  modelHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  modelIcon: { fontSize: 28 },
  modelTitle: { fontSize: 15, fontWeight: '800' },
  modelSource: { color: T.sub, fontSize: 11 },
  modelText: { color: T.text, fontSize: 13, lineHeight: 22 },

  tipsCard: {
    backgroundColor: T.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  tipsTitle: { color: T.text, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  tipsBody: { color: T.sub, fontSize: 12, lineHeight: 20 },
});
