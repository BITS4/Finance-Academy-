import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { T } from '../theme';
import { ASSESSMENT_QUESTIONS } from '../data/questions';
import { calculateQuizResult } from '../domain/assessment';

export default function AssessmentModal({ course, onClose }) {
  const questions = ASSESSMENT_QUESTIONS[course.id] || [];
  const [cur, setCur] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [phase, setPhase] = useState('quiz');
  const [results, setResults] = useState(null);

  function next() {
    if (selected === null) return;
    const ans = [
      ...answers,
      { selected, correct: questions[cur].correct, topic: questions[cur].topic },
    ];
    setAnswers(ans);
    setSelected(null);
    if (cur < questions.length - 1) {
      setCur(cur + 1);
    } else {
      const result = calculateQuizResult(ans);
      setResults({ score: result.score, total: questions.length, weak: result.weakTopics });
      setPhase('results');
    }
  }

  const q = questions[cur];

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>🧠 Тест знаний</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={s.close}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {phase === 'quiz' && q && (
            <View>
              <View style={s.bars}>
                {questions.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      s.bar,
                      {
                        backgroundColor:
                          i < cur ? course.color : i === cur ? course.color + '70' : T.border,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={s.qNum}>
                Вопрос {cur + 1} из {questions.length}
              </Text>
              <Text style={s.question}>{q.q}</Text>
              <View style={s.options}>
                {q.opts.map((opt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      s.option,
                      selected === i && {
                        borderColor: course.color,
                        backgroundColor: course.colorBg,
                      },
                    ]}
                    onPress={() => setSelected(i)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        s.dot,
                        selected === i && {
                          backgroundColor: course.color,
                          borderColor: course.color,
                        },
                      ]}
                    >
                      {selected === i && <View style={s.dotInner} />}
                    </View>
                    <Text style={[s.optText, selected === i && { color: T.text }]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[
                  s.btn,
                  { backgroundColor: course.color },
                  selected === null && s.btnDisabled,
                ]}
                onPress={next}
                disabled={selected === null}
              >
                <Text style={s.btnText}>
                  {cur < questions.length - 1 ? 'Следующий →' : 'Завершить тест'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'results' && results && (
            <View>
              <View style={[s.scoreCard, { backgroundColor: course.colorBg }]}>
                <Text style={s.scoreEmoji}>
                  {results.score >= 4 ? '🎉' : results.score >= 3 ? '👍' : '📚'}
                </Text>
                <Text style={[s.scoreNum, { color: course.color }]}>
                  {results.score}/{results.total}
                </Text>
                <Text style={s.scoreLabel}>правильных ответов</Text>
              </View>
              {results.weak.length > 0 ? (
                <View style={s.weakCard}>
                  <Text style={s.weakTitle}>📌 Темы для изучения:</Text>
                  {results.weak.map((w, i) => (
                    <View key={i} style={s.weakRow}>
                      <Text style={s.weakBullet}>•</Text>
                      <Text style={s.weakText}>{w}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={s.perfectCard}>
                  <Text style={s.perfectText}>✨ Отлично! Все темы освоены на базовом уровне.</Text>
                </View>
              )}
              <TouchableOpacity
                style={[s.btn, { backgroundColor: course.color }]}
                onPress={onClose}
              >
                <Text style={s.btnText}>Перейти к курсу</Text>
              </TouchableOpacity>
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
  bars: { flexDirection: 'row', gap: 4, marginBottom: 20 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  qNum: { color: T.sub, fontSize: 13, marginBottom: 10 },
  question: { color: T.text, fontSize: 17, fontWeight: '500', lineHeight: 26, marginBottom: 24 },
  options: { gap: 10, marginBottom: 28 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  optText: { color: T.sub, fontSize: 14, flex: 1 },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#000', fontSize: 15, fontWeight: '700' },
  scoreCard: { borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 20 },
  scoreEmoji: { fontSize: 52, marginBottom: 12 },
  scoreNum: { fontSize: 44, fontWeight: '700' },
  scoreLabel: { color: T.sub, fontSize: 15, marginTop: 4 },
  weakCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: T.border,
  },
  weakTitle: { color: T.text, fontSize: 15, fontWeight: '600', marginBottom: 12 },
  weakRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  weakBullet: { color: T.gold, fontSize: 18, lineHeight: 22 },
  weakText: { color: T.sub, fontSize: 14, flex: 1, lineHeight: 22 },
  perfectCard: { backgroundColor: T.greenBg, borderRadius: 14, padding: 18, marginBottom: 24 },
  perfectText: { color: T.green, fontSize: 15, fontWeight: '600' },
});
