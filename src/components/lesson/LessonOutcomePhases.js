import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { T } from '../../theme';
import { LEVEL_CONSEQUENCES } from './LessonConsequences';
import { s } from './lessonStyles';

export function ApplyPhase({ lesson, level, onNext, onResult }) {
  const task = lesson.applyTask;
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  if (!task)
    return (
      <View style={s.phaseContent}>
        <TouchableOpacity
          style={[s.nextBtn, { backgroundColor: level.color }]}
          onPress={() => {
            onResult && onResult(true);
            onNext();
          }}
        >
          <Text style={s.nextBtnText}>Продолжить →</Text>
        </TouchableOpacity>
      </View>
    );

  const isCorrect = selected === task.correct;

  function handleConfirm() {
    setConfirmed(true);
    onResult && onResult(selected === task.correct);
  }

  return (
    <ScrollView
      style={s.scrollPhase}
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={[s.questionBadge, { backgroundColor: level.colorBg }]}>
        <Text style={[s.questionBadgeText, { color: level.color }]}>📐 Применяй знания</Text>
      </View>
      <Text style={s.questionText}>{task.question}</Text>

      <View style={s.optionsWrap}>
        {task.options.map((opt, i) => {
          let optStyle = s.option;
          let textStyle = s.optText;
          if (confirmed) {
            if (i === task.correct) {
              optStyle = [s.option, s.optCorrect];
              textStyle = [s.optText, { color: T.green }];
            } else if (i === selected) {
              optStyle = [s.option, s.optWrong];
              textStyle = [s.optText, { color: T.red }];
            }
          } else if (selected === i) {
            optStyle = [s.option, { borderColor: level.color, backgroundColor: level.colorBg }];
          }
          return (
            <TouchableOpacity
              key={i}
              style={optStyle}
              onPress={() => !confirmed && setSelected(i)}
              disabled={confirmed}
              activeOpacity={0.75}
            >
              <View
                style={[
                  s.optLetter,
                  confirmed && i === task.correct && { backgroundColor: T.green },
                  confirmed && i === selected && i !== task.correct && { backgroundColor: T.red },
                  !confirmed && selected === i && { backgroundColor: level.color },
                ]}
              >
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
            {isCorrect ? '✅ Правильно! ' : '❌ Неверно. '}
            {task.explanation}
          </Text>
        </View>
      )}

      {!confirmed ? (
        <TouchableOpacity
          style={[
            s.nextBtn,
            { backgroundColor: level.color, opacity: selected === null ? 0.4 : 1 },
          ]}
          onPress={handleConfirm}
          disabled={selected === null}
        >
          <Text style={s.nextBtnText}>Проверить →</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[s.nextBtn, { backgroundColor: isCorrect ? level.color : T.red }]}
          onPress={onNext}
        >
          <Text style={s.nextBtnText}>
            {isCorrect ? 'Отлично! Продолжить →' : '📉 Посмотреть последствие →'}
          </Text>
        </TouchableOpacity>
      )}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── CONSEQUENCE ────────────────────────────────────────────

export function ConsequencePhase({ lesson, level, onNext }) {
  const levelConseq = LEVEL_CONSEQUENCES[level.id] || LEVEL_CONSEQUENCES[1];
  const lessonConseq = levelConseq.buildFailures[lesson.id] || levelConseq.buildFailures.default;

  return (
    <ScrollView
      style={s.scrollPhase}
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Alert banner */}
      <View
        style={[
          s.consequenceBanner,
          { backgroundColor: levelConseq.bgColor, borderColor: levelConseq.borderColor },
        ]}
      >
        <Text style={s.consequenceEmoji}>{levelConseq.emoji}</Text>
        <Text style={[s.consequenceTitle, { color: levelConseq.borderColor }]}>
          {levelConseq.title}
        </Text>
      </View>

      {/* Scene */}
      <View style={[s.sceneCard, { borderColor: levelConseq.borderColor + '55' }]}>
        <Text style={s.sceneLabel}>📍 Что произошло:</Text>
        <Text style={s.sceneText}>{lessonConseq.scene}</Text>
        <Text style={s.impactText}>{lessonConseq.impact}</Text>
      </View>

      {/* P&L / Impact breakdown */}
      <View style={s.pnlCard}>
        <Text style={s.pnlTitle}>📊 Финансовые последствия:</Text>
        {lessonConseq.pnl.map((row, i) => (
          <View key={i} style={s.pnlRow}>
            <Text style={s.pnlLabel}>{row.label}</Text>
            <Text style={[s.pnlValue, { color: row.color }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* XP penalty */}
      <View style={s.penaltyBadge}>
        <Text style={s.penaltyText}>
          ⚡ XP за урок снижен: получишь только 50% (+{Math.floor(lesson.xp * 0.5)} XP)
        </Text>
      </View>

      {/* Recovery tip */}
      <View style={[s.recoveryCard, { borderColor: level.color + '55' }]}>
        <Text style={s.recoveryLabel}>💡 Как исправить:</Text>
        <Text style={s.recoveryText}>{levelConseq.recovery}</Text>
      </View>

      <TouchableOpacity
        style={[s.nextBtn, { backgroundColor: level.color }]}
        onPress={onNext}
        activeOpacity={0.8}
      >
        <Text style={s.nextBtnText}>Понял, буду учиться →</Text>
      </TouchableOpacity>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── VERDICT ────────────────────────────────────────────────

export function VerdictPhase({ lesson, level, xp, wasWrong, onComplete }) {
  return (
    <View style={s.verdictWrap}>
      <View style={[s.xpCircle, wasWrong && s.xpCircleWrong]}>
        <Text style={s.xpCircleEmoji}>{wasWrong ? '📚' : '⚡'}</Text>
        <Text style={[s.xpCircleNum, { color: wasWrong ? T.gold : level.color }]}>+{xp}</Text>
        <Text style={s.xpCircleLabel}>XP</Text>
      </View>
      <Text style={s.verdictTitle}>{wasWrong ? 'Урок завершён (частично)' : 'Урок завершён!'}</Text>
      <Text style={s.verdictLesson}>{lesson.title}</Text>
      {wasWrong && (
        <View style={s.retryHint}>
          <Text style={s.retryHintText}>
            💡 Изучи концепцию ещё раз — следующая попытка даст полные XP
          </Text>
        </View>
      )}
      <View
        style={[s.verdictBox, { borderColor: level.color + '55', backgroundColor: level.colorBg }]}
      >
        <Text style={[s.verdictText, { color: level.color }]}>
          {wasWrong
            ? '📖 ' + (LEVEL_CONSEQUENCES[level.id]?.recovery || 'Повтори материал.')
            : lesson.verdict || '✅ Отличная работа!'}
        </Text>
      </View>
      <TouchableOpacity
        style={[s.nextBtn, { backgroundColor: level.color }]}
        onPress={onComplete}
        activeOpacity={0.8}
      >
        <Text style={s.nextBtnText}>Сохранить и вернуться →</Text>
      </TouchableOpacity>
    </View>
  );
}
