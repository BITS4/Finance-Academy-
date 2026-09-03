import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { T } from '../theme';
import { EXAM_QUESTIONS } from '../data/questions';

export default function ExamModal({ course, onClose, onDone }) {
  const questions = EXAM_QUESTIONS[course.id] || [];
  const [cur, setCur] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [phase, setPhase] = useState('quiz');
  const [results, setResults] = useState(null);
  const [review, setReview] = useState([]);

  function next() {
    if (selected === null) return;
    const ans = [...answers, { sel: selected, correct: questions[cur].correct }];
    setAnswers(ans);
    setSelected(null);
    if (cur < questions.length - 1) {
      setCur(cur + 1);
    } else {
      const score = Math.round(
        (ans.filter((a) => a.sel === a.correct).length / questions.length) * 100,
      );
      setReview(
        questions.map((q, i) => ({
          q: q.q,
          opts: q.opts,
          sel: ans[i].sel,
          correct: q.correct,
          explanation: q.explanation,
          ok: ans[i].sel === q.correct,
        })),
      );
      setResults({ score });
      setPhase('results');
    }
  }

  const q = questions[cur];

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>🏆 Финальный экзамен</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={s.close}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {phase === 'quiz' && q && (
            <View>
              <View style={s.qHeader}>
                <Text style={s.qNum}>
                  Вопрос {cur + 1} / {questions.length}
                </Text>
                <View style={s.miniBar}>
                  <View
                    style={[s.miniBarFill, { width: `${((cur + 1) / questions.length) * 100}%` }]}
                  />
                </View>
              </View>
              <Text style={s.question}>{q.q}</Text>
              <View style={s.options}>
                {q.opts.map((opt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[s.option, selected === i && s.optionSelected]}
                    onPress={() => setSelected(i)}
                    activeOpacity={0.7}
                  >
                    <View style={[s.letter, selected === i && s.letterSelected]}>
                      <Text style={[s.letterText, selected === i && { color: '#000' }]}>
                        {['А', 'Б', 'В', 'Г'][i]}
                      </Text>
                    </View>
                    <Text style={[s.optText, selected === i && { color: T.text }]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[s.btn, selected === null && s.btnDisabled]}
                onPress={next}
                disabled={selected === null}
              >
                <Text style={s.btnText}>
                  {cur < questions.length - 1 ? 'Следующий →' : 'Завершить экзамен'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'results' && results && (
            <View>
              <View style={[s.scoreCard, results.score >= 70 ? s.scorePass : s.scoreFail]}>
                <Text style={s.scoreEmoji}>
                  {results.score >= 90 ? '🏆' : results.score >= 70 ? '✅' : '📚'}
                </Text>
                <Text style={s.scoreNum}>{results.score}%</Text>
                <Text style={s.scoreVerdict}>
                  {results.score >= 90
                    ? 'Отлично!'
                    : results.score >= 70
                      ? 'Зачёт!'
                      : 'Нужна доработка'}
                </Text>
              </View>

              {results.score >= 70 && (
                <View style={s.certCard}>
                  <Text style={s.certTitle}>🎓 Сертификат получен!</Text>
                  <Text style={s.certCourse}>«{course.title}»</Text>
                  <TouchableOpacity style={s.certBtn} onPress={() => onDone(results.score)}>
                    <Text style={s.certBtnText}>Сохранить сертификат</Text>
                  </TouchableOpacity>
                </View>
              )}

              {results.score < 70 && (
                <TouchableOpacity
                  style={s.retryBtn}
                  onPress={() => {
                    setAnswers([]);
                    setCur(0);
                    setSelected(null);
                    setPhase('quiz');
                  }}
                >
                  <Text style={s.retryText}>🔄 Пересдать экзамен</Text>
                </TouchableOpacity>
              )}

              <Text style={s.reviewTitle}>Разбор ответов</Text>
              {review.map((item, i) => (
                <View key={i} style={[s.reviewItem, item.ok ? s.reviewOk : s.reviewFail]}>
                  <Text style={s.reviewQ}>
                    {i + 1}. {item.q}
                  </Text>
                  <Text style={item.ok ? s.ansOk : s.ansFail}>
                    Ваш ответ: {item.opts[item.sel]}
                  </Text>
                  {!item.ok && (
                    <Text style={s.correct}>✓ Правильно: {item.opts[item.correct]}</Text>
                  )}
                  <Text style={s.explain}>{item.explanation}</Text>
                </View>
              ))}

              <TouchableOpacity style={s.closeBtn} onPress={onClose}>
                <Text style={s.closeBtnText}>Закрыть</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: T.border,
  },
  title: { color: T.text, fontSize: 20, fontWeight: '700' },
  close: { color: T.sub, fontSize: 24 },
  content: { padding: 20, flexGrow: 1 },
  qHeader: { marginBottom: 20 },
  qNum: { color: T.sub, fontSize: 13, marginBottom: 8 },
  miniBar: { height: 4, backgroundColor: T.border, borderRadius: 2, overflow: 'hidden' },
  miniBarFill: { height: '100%', backgroundColor: T.gold, borderRadius: 2 },
  question: { color: T.text, fontSize: 17, fontWeight: '500', lineHeight: 26, marginBottom: 24 },
  options: { gap: 10, marginBottom: 28 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: T.border,
  },
  optionSelected: { borderColor: T.gold, backgroundColor: T.goldBg },
  letter: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: T.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterSelected: { backgroundColor: T.gold },
  letterText: { color: T.sub, fontSize: 14, fontWeight: '700' },
  optText: { color: T.sub, fontSize: 14, flex: 1 },
  btn: { backgroundColor: T.gold, borderRadius: 14, padding: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#000', fontSize: 15, fontWeight: '700' },
  scoreCard: { borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 20 },
  scorePass: { backgroundColor: T.greenBg },
  scoreFail: { backgroundColor: T.redBg },
  scoreEmoji: { fontSize: 52, marginBottom: 12 },
  scoreNum: { color: T.text, fontSize: 48, fontWeight: '700' },
  scoreVerdict: { color: T.sub, fontSize: 16, marginTop: 4 },
  certCard: {
    backgroundColor: T.goldBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.gold,
  },
  certTitle: { color: T.gold, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  certCourse: { color: T.text, fontSize: 14, marginBottom: 16, textAlign: 'center' },
  certBtn: {
    backgroundColor: T.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  certBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  retryBtn: {
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: T.border,
  },
  retryText: { color: T.text, fontSize: 15, fontWeight: '600' },
  reviewTitle: { color: T.text, fontSize: 17, fontWeight: '600', marginBottom: 14 },
  reviewItem: { borderRadius: 12, padding: 14, marginBottom: 10 },
  reviewOk: { backgroundColor: T.greenBg },
  reviewFail: { backgroundColor: T.redBg },
  reviewQ: { color: T.text, fontSize: 13, fontWeight: '600', marginBottom: 8, lineHeight: 20 },
  ansOk: { color: T.green, fontSize: 13, marginBottom: 4 },
  ansFail: { color: T.red, fontSize: 13, marginBottom: 4 },
  correct: { color: T.green, fontSize: 13, marginBottom: 8 },
  explain: { color: T.sub, fontSize: 12, lineHeight: 18 },
  closeBtn: {
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: T.border,
  },
  closeBtnText: { color: T.text, fontSize: 15, fontWeight: '600' },
});
