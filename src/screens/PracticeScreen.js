import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal,
} from 'react-native';
import { T } from '../theme';
import { PRACTICE } from '../data/practiceQuestions';

export default function PracticeScreen({ courseId, courseTitle, courseColor, courseBg, onClose, onComplete }) {
  const questions = PRACTICE[courseId] || [];
  const [cur, setCur] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [phase, setPhase] = useState('quiz'); // quiz | summary

  const q = questions.length > 0 ? questions[cur] : null;
  const progress = questions.length > 0 ? cur / questions.length : 0;

  if (questions.length === 0) {
    return (
      <Modal visible animationType="slide" onRequestClose={onClose}>
        <View style={s.container}>
          <View style={s.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={s.back}>‹ Выход</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>{courseTitle}</Text>
            <Text style={s.headerCount} />
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <Text style={{ color: T.sub, fontSize: 15, textAlign: 'center' }}>
              Для этого курса пока нет практических вопросов.
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  function confirm() {
    if (selected === null) return;
    setConfirmed(true);
  }

  function goNext() {
    const newAnswers = [...answers, {
      isCorrect: selected === q.correct,
      selected,
      correct: q.correct,
    }];
    setAnswers(newAnswers);
    setSelected(null);
    setConfirmed(false);

    if (cur < questions.length - 1) {
      setCur(cur + 1);
    } else {
      setPhase('summary');
    }
  }

  function getFeedback() {
    if (!confirmed || selected === null || !q) return null;
    const isCorrect = selected === q.correct;
    const isAlmost = q.almost?.includes(selected);
    if (isCorrect) return { type: 'correct', msg: '✅ Правильно!\n\n' + q.explanation };
    if (isAlmost) return { type: 'almost', msg: '🟡 Почти верно!\n\n' + (q.almostMsg || '') + '\n\n' + q.explanation };
    return { type: 'wrong', msg: '❌ Неверно.\n\n' + q.explanation };
  }

  const feedback = getFeedback();
  const score = answers.filter(a => a.isCorrect).length;
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;

  if (phase === 'summary') {
    return (
      <Modal visible animationType="slide" onRequestClose={onClose}>
        <ScrollView style={s.container} contentContainerStyle={s.content}>
          <View style={[s.summaryCard, { backgroundColor: courseBg }]}>
            <Text style={s.summaryEmoji}>{pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚'}</Text>
            <Text style={[s.summaryScore, { color: courseColor }]}>{score}/{questions.length}</Text>
            <Text style={s.summaryLabel}>{pct >= 80 ? 'Отлично!' : pct >= 60 ? 'Хороший результат' : 'Нужна практика'}</Text>
          </View>

          <Text style={s.reviewTitle}>Разбор задач</Text>
          {questions.map((q2, i) => {
            const ans = answers[i];
            if (!ans) return null;
            return (
              <View key={q2.id} style={[s.reviewItem, ans.isCorrect ? s.reviewOk : s.reviewFail]}>
                <Text style={s.reviewQ}>{i + 1}. {q2.q}</Text>
                <Text style={ans.isCorrect ? s.ansOk : s.ansFail}>
                  Ваш ответ: {q2.opts[ans.selected]}
                </Text>
                {!ans.isCorrect && (
                  <Text style={s.ansCorrect}>✓ Правильно: {q2.opts[ans.correct]}</Text>
                )}
                {q2.formula && <Text style={s.formula}>📐 {q2.formula}</Text>}
                <Text style={s.explain}>{q2.explanation}</Text>
              </View>
            );
          })}

          <TouchableOpacity style={[s.doneBtn, { backgroundColor: courseColor }]} onPress={() => onComplete(pct)}>
            <Text style={s.doneBtnText}>Завершить практику</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </Modal>
    );
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={s.back}>‹ Выход</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle} numberOfLines={1}>{courseTitle}</Text>
          <Text style={s.headerCount}>{cur + 1}/{questions.length}</Text>
        </View>

        {/* Progress */}
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${(cur / questions.length) * 100}%`, backgroundColor: courseColor }]} />
        </View>

        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Type badge */}
          <View style={[s.typeBadge, { backgroundColor: courseBg }]}>
            <Text style={[s.typeBadgeText, { color: courseColor }]}>
              {q.type === 'calc' ? '🧮 Расчётная задача' : q.type === 'entry' ? '📝 Составить проводку' : '💬 Выбор ответа'}
            </Text>
          </View>

          {/* Formula hint */}
          {q.formula && (
            <View style={s.formulaBox}>
              <Text style={s.formulaBoxText}>{q.formula}</Text>
            </View>
          )}

          {/* Question */}
          <Text style={s.question}>{q.q}</Text>

          {/* Options */}
          <View style={s.options}>
            {q.opts.map((opt, i) => {
              let optStyle = s.option;
              let textStyle = s.optText;
              if (confirmed) {
                if (i === q.correct) { optStyle = [s.option, s.optCorrect]; textStyle = [s.optText, { color: T.green }]; }
                else if (i === selected) { optStyle = [s.option, s.optWrong]; textStyle = [s.optText, { color: T.red }]; }
              } else if (selected === i) {
                optStyle = [s.option, { borderColor: courseColor, backgroundColor: courseBg }];
              }
              return (
                <TouchableOpacity
                  key={i} style={optStyle}
                  onPress={() => !confirmed && setSelected(i)}
                  disabled={confirmed} activeOpacity={0.7}
                >
                  <View style={[s.letter,
                    confirmed && i === q.correct && { backgroundColor: T.green },
                    confirmed && i === selected && i !== q.correct && { backgroundColor: T.red },
                    !confirmed && selected === i && { backgroundColor: courseColor },
                  ]}>
                    <Text style={s.letterText}>{['А', 'Б', 'В', 'Г'][i]}</Text>
                  </View>
                  <Text style={textStyle}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Feedback */}
          {feedback && (
            <View style={[s.feedback,
              feedback.type === 'correct' ? s.fbCorrect :
              feedback.type === 'almost' ? s.fbAlmost : s.fbWrong
            ]}>
              <Text style={[s.feedbackText,
                { color: feedback.type === 'correct' ? T.green : feedback.type === 'almost' ? T.gold : T.red }
              ]}>
                {feedback.msg}
              </Text>
            </View>
          )}

          {/* Buttons */}
          {!confirmed ? (
            <TouchableOpacity
              style={[s.btn, { backgroundColor: courseColor }, selected === null && s.btnDisabled]}
              onPress={confirm} disabled={selected === null}
            >
              <Text style={s.btnText}>Проверить ответ</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[s.btn, s.btnNext]} onPress={goNext}>
              <Text style={[s.btnText, { color: '#fff' }]}>
                {cur < questions.length - 1 ? 'Следующая задача →' : 'Посмотреть итоги →'}
              </Text>
            </TouchableOpacity>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 20, paddingBottom: 12,
  },
  back: { color: T.gold, fontSize: 17 },
  headerTitle: { color: T.text, fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'center' },
  headerCount: { color: T.sub, fontSize: 13 },
  progressBar: { height: 4, backgroundColor: T.border, marginBottom: 0 },
  progressFill: { height: '100%' },
  scrollContent: { padding: 20 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
  typeBadgeText: { fontSize: 12, fontWeight: '600' },
  formulaBox: { backgroundColor: T.card, borderRadius: 10, padding: 12, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: T.gold },
  formulaBoxText: { color: T.gold, fontSize: 13, fontFamily: 'monospace' },
  question: { color: T.text, fontSize: 17, fontWeight: '600', lineHeight: 28, marginBottom: 24 },
  options: { gap: 10, marginBottom: 20 },
  option: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: T.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: T.border,
  },
  optCorrect: { borderColor: T.green, backgroundColor: T.greenBg },
  optWrong: { borderColor: T.red, backgroundColor: T.redBg },
  letter: { width: 34, height: 34, borderRadius: 8, backgroundColor: T.card, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  letterText: { color: T.text, fontSize: 13, fontWeight: '700' },
  optText: { color: T.sub, fontSize: 14, flex: 1, lineHeight: 22 },
  feedback: { borderRadius: 14, padding: 16, marginBottom: 16 },
  fbCorrect: { backgroundColor: T.greenBg },
  fbAlmost: { backgroundColor: T.goldBg },
  fbWrong: { backgroundColor: T.redBg },
  feedbackText: { fontSize: 14, lineHeight: 22 },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnNext: { backgroundColor: T.blue },
  btnText: { color: '#000', fontSize: 15, fontWeight: '700' },

  // Summary
  content: { padding: 20 },
  summaryCard: { borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 24 },
  summaryEmoji: { fontSize: 52, marginBottom: 10 },
  summaryScore: { fontSize: 44, fontWeight: '700' },
  summaryLabel: { color: T.sub, fontSize: 15, marginTop: 4 },
  reviewTitle: { color: T.text, fontSize: 17, fontWeight: '600', marginBottom: 14 },
  reviewItem: { borderRadius: 14, padding: 16, marginBottom: 12 },
  reviewOk: { backgroundColor: T.greenBg },
  reviewFail: { backgroundColor: T.redBg },
  reviewQ: { color: T.text, fontSize: 13, fontWeight: '600', marginBottom: 8, lineHeight: 20 },
  ansOk: { color: T.green, fontSize: 13, marginBottom: 4 },
  ansFail: { color: T.red, fontSize: 13, marginBottom: 4 },
  ansCorrect: { color: T.green, fontSize: 13, marginBottom: 8, fontWeight: '600' },
  formula: { color: T.gold, fontSize: 12, fontFamily: 'monospace', marginBottom: 6 },
  explain: { color: T.sub, fontSize: 13, lineHeight: 20 },
  doneBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  doneBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
});
