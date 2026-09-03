import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { T } from '../theme';
import { FINAL_EXAM } from '../data/practiceQuestions';

export default function ExamSimScreen({ onClose, onPass }) {
  const [phase, setPhase] = useState('intro'); // intro | quiz | result
  const [cur, setCur] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState([]);

  const totalQ = FINAL_EXAM.length;
  const q = cur < totalQ ? FINAL_EXAM[cur] : null;

  function confirm() {
    if (selected === null) return;
    setConfirmed(true);
  }

  function goNext() {
    const newAnswers = [
      ...answers,
      {
        isCorrect: selected === q.correct,
        selected,
        correct: q.correct,
      },
    ];
    setAnswers(newAnswers);
    setSelected(null);
    setConfirmed(false);
    if (cur < totalQ - 1) {
      setCur(cur + 1);
    } else {
      setPhase('result');
    }
  }

  function getFeedback() {
    if (!confirmed || selected === null || !q) return null;
    const isCorrect = selected === q.correct;
    const isAlmost = q.almost?.includes(selected);
    if (isCorrect) return { type: 'correct', msg: '✅ ' + q.explanation };
    if (isAlmost)
      return { type: 'almost', msg: '🟡 ' + (q.almostMsg || '') + '\n' + q.explanation };
    return { type: 'wrong', msg: '❌ ' + q.explanation };
  }

  const feedback = getFeedback();
  const finalScore = answers.filter((a) => a.isCorrect).length;
  const finalPct = Math.round((finalScore / totalQ) * 100);
  const passed = finalPct >= 70;

  if (totalQ === 0) {
    return (
      <View style={s.intro}>
        <Text style={s.introTitle}>Вопросы экзамена не найдены</Text>
        <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
          <Text style={s.cancelBtnText}>Закрыть</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'intro') {
    return (
      <View style={s.intro}>
        <Text style={s.introEmoji}>📋</Text>
        <Text style={s.introTitle}>Симуляция официального экзамена</Text>
        <Text style={s.introDesc}>
          {totalQ} вопросов · разного типа · с разбором ошибок{'\n'}
          Проходной балл: 70%
        </Text>
        <View style={s.rules}>
          <Rule icon="🧮" text="Есть расчётные задачи — держите калькулятор" />
          <Rule icon="📝" text="Есть задачи на составление проводок" />
          <Rule icon="💡" text="После каждого ответа — детальное объяснение" />
          <Rule icon="🎯" text="70%+ = сертификат сдан" />
        </View>
        <TouchableOpacity style={s.startBtn} onPress={() => setPhase('quiz')}>
          <Text style={s.startBtnText}>Начать экзамен →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
          <Text style={s.cancelBtnText}>Ещё не готов</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'result') {
    return (
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={[s.scoreCard, passed ? s.scorePass : s.scoreFail]}>
          <Text style={s.scoreEmoji}>{finalPct >= 90 ? '🏆' : finalPct >= 70 ? '✅' : '📚'}</Text>
          <Text style={s.scoreNum}>{finalPct}%</Text>
          <Text style={s.scoreLabel}>
            {finalScore}/{totalQ} правильных
          </Text>
          <Text style={s.scoreVerdict}>
            {finalPct >= 90 ? 'Превосходно!' : finalPct >= 70 ? 'Экзамен сдан!' : 'Нужна доработка'}
          </Text>
        </View>

        {passed && (
          <View style={s.certCard}>
            <Text style={s.certTitle}>🎓 Вы готовы к официальному экзамену!</Text>
            <Text style={s.certDesc}>
              Результат {finalPct}% говорит о хорошей подготовке. Продолжайте практиковаться!
            </Text>
            <TouchableOpacity style={s.certBtn} onPress={() => onPass(finalPct)}>
              <Text style={s.certBtnText}>Сохранить результат</Text>
            </TouchableOpacity>
          </View>
        )}

        {!passed && (
          <TouchableOpacity
            style={s.retryBtn}
            onPress={() => {
              setAnswers([]);
              setCur(0);
              setSelected(null);
              setConfirmed(false);
              setPhase('quiz');
            }}
          >
            <Text style={s.retryText}>🔄 Пересдать экзамен</Text>
          </TouchableOpacity>
        )}

        <Text style={s.reviewTitle}>Детальный разбор</Text>
        {FINAL_EXAM.map((q2, i) => {
          const ans = answers[i];
          if (!ans) return null;
          return (
            <View key={q2.id} style={[s.reviewItem, ans.isCorrect ? s.reviewOk : s.reviewFail]}>
              <View style={s.reviewHeader}>
                <Text style={s.reviewNum}>#{i + 1}</Text>
                <View
                  style={[
                    s.typePill,
                    q2.type === 'calc'
                      ? s.typePillCalc
                      : q2.type === 'entry'
                        ? s.typePillEntry
                        : s.typePillChoice,
                  ]}
                >
                  <Text style={s.typePillText}>
                    {q2.type === 'calc'
                      ? '🧮 Расчёт'
                      : q2.type === 'entry'
                        ? '📝 Проводка'
                        : '💬 Тест'}
                  </Text>
                </View>
              </View>
              <Text style={s.reviewQ}>{q2.q}</Text>
              <Text style={ans.isCorrect ? s.ansOk : s.ansFail}>
                Ваш ответ: {q2.opts[ans.selected]}
              </Text>
              {!ans.isCorrect && (
                <Text style={s.ansCorrect}>✓ Правильно: {q2.opts[ans.correct]}</Text>
              )}
              {q2.formula && (
                <View style={s.formulaBox}>
                  <Text style={s.formulaText}>📐 {q2.formula}</Text>
                </View>
              )}
              <Text style={s.explain}>{q2.explanation}</Text>
            </View>
          );
        })}

        <TouchableOpacity style={s.closeBtn} onPress={onClose}>
          <Text style={s.closeBtnText}>Закрыть</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Экзамен</Text>
        <Text style={s.headerCount}>
          {cur + 1} / {totalQ}
        </Text>
      </View>

      {/* Progress */}
      <View style={s.progBarWrap}>
        <View style={[s.progBarFill, { width: `${(cur / totalQ) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Type badge */}
        <View
          style={[
            s.typeBadge,
            q.type === 'calc'
              ? s.typeBadgeCalc
              : q.type === 'entry'
                ? s.typeBadgeEntry
                : s.typeBadgeChoice,
          ]}
        >
          <Text style={s.typeBadgeText}>
            {q.type === 'calc'
              ? '🧮 Расчётная задача'
              : q.type === 'entry'
                ? '📝 Составить проводку'
                : '💬 Тест'}
          </Text>
        </View>

        {/* Formula */}
        {q.formula && (
          <View style={s.formulaHint}>
            <Text style={s.formulaHintText}>{q.formula}</Text>
          </View>
        )}

        <Text style={s.question}>{q.q}</Text>

        <View style={s.options}>
          {q.opts.map((opt, i) => {
            let optStyle = s.option;
            if (confirmed) {
              if (i === q.correct) optStyle = [s.option, s.optCorrect];
              else if (i === selected) optStyle = [s.option, s.optWrong];
            } else if (selected === i) {
              optStyle = [s.option, s.optSelected];
            }
            return (
              <TouchableOpacity
                key={i}
                style={optStyle}
                onPress={() => !confirmed && setSelected(i)}
                disabled={confirmed}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    s.letter,
                    confirmed && i === q.correct && { backgroundColor: T.green },
                    confirmed && i === selected && i !== q.correct && { backgroundColor: T.red },
                    !confirmed && selected === i && { backgroundColor: T.gold },
                  ]}
                >
                  <Text style={s.letterText}>{['А', 'Б', 'В', 'Г'][i]}</Text>
                </View>
                <Text
                  style={[
                    s.optText,
                    confirmed && i === q.correct && { color: T.green, fontWeight: '600' },
                    confirmed && i === selected && i !== q.correct && { color: T.red },
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {feedback && (
          <View
            style={[
              s.feedback,
              feedback.type === 'correct'
                ? s.fbCorrect
                : feedback.type === 'almost'
                  ? s.fbAlmost
                  : s.fbWrong,
            ]}
          >
            <Text
              style={[
                s.feedbackText,
                {
                  color:
                    feedback.type === 'correct'
                      ? T.green
                      : feedback.type === 'almost'
                        ? T.gold
                        : T.red,
                },
              ]}
            >
              {feedback.msg}
            </Text>
          </View>
        )}

        {!confirmed ? (
          <TouchableOpacity
            style={[s.btn, selected === null && s.btnDisabled]}
            onPress={confirm}
            disabled={selected === null}
          >
            <Text style={s.btnText}>Проверить ответ</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[s.btn, { backgroundColor: T.blue }]} onPress={goNext}>
            <Text style={[s.btnText, { color: '#fff' }]}>
              {cur < totalQ - 1 ? 'Следующий вопрос →' : 'Завершить экзамен →'}
            </Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function Rule({ icon, text }) {
  return (
    <View style={s.rule}>
      <Text style={s.ruleIcon}>{icon}</Text>
      <Text style={s.ruleText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 20 },

  intro: { flex: 1, backgroundColor: T.bg, padding: 24, justifyContent: 'center' },
  introEmoji: { fontSize: 64, textAlign: 'center', marginBottom: 16 },
  introTitle: {
    color: T.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  introDesc: { color: T.sub, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  rules: { gap: 10, marginBottom: 32 },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: T.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border,
  },
  ruleIcon: { fontSize: 22 },
  ruleText: { color: T.sub, fontSize: 13, flex: 1 },
  startBtn: {
    backgroundColor: T.gold,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  startBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelBtnText: { color: T.sub, fontSize: 14 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { color: T.text, fontSize: 18, fontWeight: '700' },
  headerCount: { color: T.sub, fontSize: 14 },
  progBarWrap: { height: 4, backgroundColor: T.border },
  progBarFill: { height: '100%', backgroundColor: T.gold },
  scrollContent: { padding: 20 },

  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  typeBadgeCalc: { backgroundColor: T.blueBg },
  typeBadgeEntry: { backgroundColor: T.purpleBg },
  typeBadgeChoice: { backgroundColor: T.goldBg },
  typeBadgeText: { fontSize: 12, fontWeight: '600', color: T.gold },

  formulaHint: {
    backgroundColor: T.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: T.gold,
  },
  formulaHintText: { color: T.gold, fontSize: 13, fontFamily: 'monospace' },
  question: { color: T.text, fontSize: 17, fontWeight: '600', lineHeight: 28, marginBottom: 24 },
  options: { gap: 10, marginBottom: 20 },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  letter: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: T.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  letterText: { color: T.text, fontSize: 13, fontWeight: '700' },
  optText: { color: T.sub, fontSize: 14, flex: 1, lineHeight: 22 },
  feedback: { borderRadius: 14, padding: 16, marginBottom: 16 },
  fbCorrect: { backgroundColor: T.greenBg },
  fbAlmost: { backgroundColor: T.goldBg },
  fbWrong: { backgroundColor: T.redBg },
  feedbackText: { fontSize: 14, lineHeight: 22 },
  btn: { backgroundColor: T.gold, borderRadius: 14, padding: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#000', fontSize: 15, fontWeight: '700' },

  // Result
  scoreCard: { borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 20 },
  scorePass: { backgroundColor: T.greenBg },
  scoreFail: { backgroundColor: T.redBg },
  scoreEmoji: { fontSize: 56, marginBottom: 10 },
  scoreNum: { color: T.text, fontSize: 52, fontWeight: '700' },
  scoreLabel: { color: T.sub, fontSize: 14, marginTop: 4 },
  scoreVerdict: { color: T.text, fontSize: 18, fontWeight: '600', marginTop: 8 },
  certCard: {
    backgroundColor: T.goldBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: T.gold,
  },
  certTitle: { color: T.gold, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  certDesc: { color: T.sub, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  certBtn: { backgroundColor: T.gold, borderRadius: 12, padding: 14, alignItems: 'center' },
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
  reviewItem: { borderRadius: 14, padding: 16, marginBottom: 12 },
  reviewOk: { backgroundColor: T.greenBg },
  reviewFail: { backgroundColor: T.redBg },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  reviewNum: { color: T.sub, fontSize: 12, fontWeight: '700' },
  typePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typePillCalc: { backgroundColor: T.blueBg },
  typePillEntry: { backgroundColor: T.purpleBg },
  typePillChoice: { backgroundColor: T.goldBg },
  typePillText: { fontSize: 11, fontWeight: '600', color: T.gold },
  reviewQ: { color: T.text, fontSize: 13, fontWeight: '600', marginBottom: 8, lineHeight: 20 },
  ansOk: { color: T.green, fontSize: 13, marginBottom: 4 },
  ansFail: { color: T.red, fontSize: 13, marginBottom: 4 },
  ansCorrect: { color: T.green, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  formulaBox: { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: 8, marginBottom: 8 },
  formulaText: { color: T.gold, fontSize: 12, fontFamily: 'monospace' },
  explain: { color: T.sub, fontSize: 13, lineHeight: 20 },
  closeBtn: {
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: T.border,
  },
  closeBtnText: { color: T.text, fontSize: 15, fontWeight: '600' },
});
