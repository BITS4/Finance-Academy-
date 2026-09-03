import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { T } from '../theme';
import { DIAGNOSTIC, determineLevel } from '../data/diagnostic';
import { saveDiagnosticAnswers } from '../storage';

export default function DiagnosticScreen({ onComplete }) {
  const [cur, setCur] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [phase, setPhase] = useState('intro'); // intro | quiz | result

  const q = DIAGNOSTIC[cur];
  const progress = (cur / DIAGNOSTIC.length) * 100;

  function confirm() {
    if (selected === null) return;
    setConfirmed(true);
  }

  function goNext() {
    const newAnswers = [
      ...answers,
      {
        questionId: q.id,
        selectedIndex: selected,
        isCorrect: selected === q.correct,
      },
    ];
    setAnswers(newAnswers);
    setSelected(null);
    setConfirmed(false);

    if (cur < DIAGNOSTIC.length - 1) {
      setCur(cur + 1);
    } else {
      const level = determineLevel(newAnswers);
      const score = newAnswers.filter((a) => a.isCorrect).length;
      setPhase('result');
      saveDiagnosticAnswers(newAnswers);
      setTimeout(() => onComplete(level, score, newAnswers), 100);
    }
  }

  function getFeedback() {
    if (!confirmed || selected === null) return null;
    const isCorrect = selected === q.correct;
    const isAlmost = q.almost?.includes(selected);

    if (isCorrect) return { type: 'correct', msg: '✅ Правильно! ' + q.explanation };
    if (isAlmost) return { type: 'almost', msg: '🟡 Почти! ' + q.almostMsg };
    return { type: 'wrong', msg: '❌ Неверно. ' + q.explanation };
  }

  const feedback = getFeedback();

  if (phase === 'intro') {
    return (
      <View style={s.intro}>
        <Text style={s.introEmoji}>🎯</Text>
        <Text style={s.introTitle}>Диагностика уровня</Text>
        <Text style={s.introDesc}>
          Ответьте на {DIAGNOSTIC.length} вопросов — мы определим ваш уровень и составим
          персональный план обучения.
        </Text>
        <View style={s.introTips}>
          <Tip icon="🧮" text="Есть расчётные задачи — держите калькулятор" />
          <Tip icon="💡" text="После каждого ответа — объяснение" />
          <Tip icon="⏱️" text="Занимает ~5 минут" />
        </View>
        <TouchableOpacity style={s.startBtn} onPress={() => setPhase('quiz')}>
          <Text style={s.startBtnText}>Начать диагностику →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Progress */}
      <View style={s.progressWrap}>
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={s.progressText}>
          {cur + 1} / {DIAGNOSTIC.length}
        </Text>
      </View>

      {/* Type badge */}
      <View style={[s.typeBadge, q.type === 'calc' ? s.typeBadgeCalc : s.typeBadgeChoice]}>
        <Text style={s.typeBadgeText}>
          {q.type === 'calc'
            ? '🧮 Расчётная задача'
            : q.type === 'entry'
              ? '📝 Составить проводку'
              : '💬 Выбор ответа'}
        </Text>
      </View>

      {/* Formula hint for calc */}
      {q.formula && (
        <View style={s.formulaHint}>
          <Text style={s.formulaText}>{q.formula}</Text>
        </View>
      )}

      {/* Question */}
      <Text style={s.question}>{q.q}</Text>

      {/* Options */}
      <View style={s.options}>
        {q.opts.map((opt, i) => {
          let style = s.option;
          let textStyle = s.optText;
          if (confirmed) {
            if (i === q.correct) {
              style = [s.option, s.optCorrect];
              textStyle = [s.optText, s.optTextCorrect];
            } else if (i === selected && i !== q.correct) {
              style = [s.option, s.optWrong];
              textStyle = [s.optText, s.optTextWrong];
            }
          } else if (selected === i) {
            style = [s.option, s.optSelected];
          }

          return (
            <TouchableOpacity
              key={i}
              style={style}
              onPress={() => !confirmed && setSelected(i)}
              disabled={confirmed}
              activeOpacity={0.7}
            >
              <View
                style={[
                  s.optLetter,
                  confirmed && i === q.correct && s.optLetterCorrect,
                  confirmed && i === selected && i !== q.correct && s.optLetterWrong,
                  !confirmed && selected === i && s.optLetterSelected,
                ]}
              >
                <Text style={s.optLetterText}>{['А', 'Б', 'В', 'Г'][i]}</Text>
              </View>
              <Text style={textStyle}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feedback */}
      {feedback && (
        <View
          style={[
            s.feedback,
            feedback.type === 'correct'
              ? s.feedbackCorrect
              : feedback.type === 'almost'
                ? s.feedbackAlmost
                : s.feedbackWrong,
          ]}
        >
          <Text
            style={[
              s.feedbackText,
              feedback.type === 'correct'
                ? { color: T.green }
                : feedback.type === 'almost'
                  ? { color: T.gold }
                  : { color: T.red },
            ]}
          >
            {feedback.msg}
          </Text>
        </View>
      )}

      {/* Action button */}
      {!confirmed ? (
        <TouchableOpacity
          style={[s.btn, selected === null && s.btnDisabled]}
          onPress={confirm}
          disabled={selected === null}
        >
          <Text style={s.btnText}>Проверить ответ</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[s.btn, s.btnNext]} onPress={goNext}>
          <Text style={s.btnText}>
            {cur < DIAGNOSTIC.length - 1 ? 'Следующий вопрос →' : 'Посмотреть результат →'}
          </Text>
        </TouchableOpacity>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Tip({ icon, text }) {
  return (
    <View style={s.tip}>
      <Text style={s.tipIcon}>{icon}</Text>
      <Text style={s.tipText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 20 },

  // Intro
  intro: {
    flex: 1,
    backgroundColor: T.bg,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introEmoji: { fontSize: 72, marginBottom: 20 },
  introTitle: {
    color: T.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  introDesc: { color: T.sub, fontSize: 15, lineHeight: 24, textAlign: 'center', marginBottom: 32 },
  introTips: { width: '100%', gap: 12, marginBottom: 36 },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: T.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
  },
  tipIcon: { fontSize: 24 },
  tipText: { color: T.sub, fontSize: 14, flex: 1 },
  startBtn: {
    backgroundColor: T.gold,
    borderRadius: 16,
    padding: 18,
    width: '100%',
    alignItems: 'center',
  },
  startBtnText: { color: '#000', fontSize: 17, fontWeight: '700' },

  // Quiz
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: T.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: T.gold, borderRadius: 3 },
  progressText: { color: T.sub, fontSize: 13, width: 40 },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  typeBadgeCalc: { backgroundColor: T.blueBg },
  typeBadgeChoice: { backgroundColor: T.goldBg },
  typeBadgeText: { fontSize: 12, fontWeight: '600', color: T.blue },
  formulaHint: {
    backgroundColor: T.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: T.gold,
  },
  formulaText: { color: T.gold, fontSize: 13, fontFamily: 'monospace' },
  question: { color: T.text, fontSize: 17, fontWeight: '600', lineHeight: 28, marginBottom: 24 },
  options: { gap: 10, marginBottom: 20 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  optSelected: { borderColor: T.gold, backgroundColor: T.goldBg },
  optCorrect: { borderColor: T.green, backgroundColor: T.greenBg },
  optWrong: { borderColor: T.red, backgroundColor: T.redBg },
  optLetter: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: T.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optLetterSelected: { backgroundColor: T.gold },
  optLetterCorrect: { backgroundColor: T.green },
  optLetterWrong: { backgroundColor: T.red },
  optLetterText: { color: T.text, fontSize: 13, fontWeight: '700' },
  optText: { color: T.sub, fontSize: 14, flex: 1, lineHeight: 20 },
  optTextCorrect: { color: T.green, fontWeight: '600' },
  optTextWrong: { color: T.red },
  feedback: { borderRadius: 14, padding: 16, marginBottom: 16 },
  feedbackCorrect: { backgroundColor: T.greenBg },
  feedbackAlmost: { backgroundColor: T.goldBg },
  feedbackWrong: { backgroundColor: T.redBg },
  feedbackText: { fontSize: 14, lineHeight: 22 },
  btn: { backgroundColor: T.gold, borderRadius: 14, padding: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnNext: { backgroundColor: T.blue },
  btnText: { color: '#000', fontSize: 15, fontWeight: '700' },
});
