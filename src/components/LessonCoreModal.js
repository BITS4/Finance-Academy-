import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal,
} from 'react-native';
import { T } from '../theme';

// ─── Narrative consequences per level when apply question is wrong ──────────
const LEVEL_CONSEQUENCES = {
  1: {
    emoji: '📉',
    bgColor: 'rgba(232,85,85,0.15)',
    borderColor: '#E85555',
    title: 'Кофейня уходит в минус!',
    buildFailures: {
      '1_m1_l1': {
        scene: 'Ты перепутал постоянные и переменные затраты.',
        impact: 'Расчёт break-even оказался неверным. Ты закупил слишком много кофе (думал это Fixed cost) и теперь сидишь с залежами зерна на 80,000₽.',
        pnl: [
          { label: 'Выручка', value: '220,500₽', color: T.green },
          { label: 'COGS (неверный)', value: '−105,600₽', color: T.red },
          { label: 'Избыточные запасы', value: '−80,000₽', color: T.red },
          { label: 'Аренда', value: '−100,000₽', color: T.red },
          { label: 'Результат', value: '−65,100₽ 🔴', color: '#E85555' },
        ],
      },
      '1_m1_l2': {
        scene: 'Ошибка в расчёте Gross Profit.',
        impact: 'Ты показал инвестору завышенную прибыль. Аудитор нашёл ошибку — инвестор отозвал финансирование.',
        pnl: [
          { label: 'Выручка (факт)', value: '330,000₽', color: T.green },
          { label: 'COGS', value: '−105,600₽', color: T.red },
          { label: 'OpEx', value: '−150,000₽', color: T.red },
          { label: 'Реальная прибыль', value: '+74,400₽', color: T.green },
          { label: 'Доверие инвестора', value: '❌ Потеряно', color: '#E85555' },
        ],
      },
      default: {
        scene: 'Неправильное финансовое решение.',
        impact: 'Кофейня «Bean & Bull» несёт потери из-за ошибки в расчётах.',
        pnl: [
          { label: 'Выручка', value: '220,500₽', color: T.green },
          { label: 'Неверные расходы', value: '−175,000₽', color: T.red },
          { label: 'Итог', value: '−45,500₽ 🔴', color: '#E85555' },
        ],
      },
    },
    recovery: 'Пересмотри концепцию и попробуй снова. Кофейня ещё может выйти в плюс!',
  },
  2: {
    emoji: '⚠️',
    bgColor: 'rgba(29,184,134,0.12)',
    borderColor: '#E85555',
    title: 'Ошибка в отчётности NovaPay!',
    buildFailures: {
      default: {
        scene: 'Аудитор обнаружил ошибку в финансовой отчётности.',
        impact: 'Регулятор выставил предписание. IPO откладывается на 6 месяцев. Инвесторы нервничают.',
        pnl: [
          { label: 'Штраф регулятора', value: '−500,000₽', color: T.red },
          { label: 'Задержка IPO', value: '−6 месяцев', color: T.red },
          { label: 'Оценка компании', value: '↓ −15%', color: '#E85555' },
        ],
      },
    },
    recovery: 'Изучи стандарты МСФО внимательнее. Аудиторы смотрят именно на это.',
  },
  3: {
    emoji: '📊',
    bgColor: 'rgba(154,108,245,0.12)',
    borderColor: '#E85555',
    title: 'Apex Capital несёт убытки!',
    buildFailures: {
      default: {
        scene: 'Неверный расчёт WACC/Beta привёл к ошибке в инвестиционном решении.',
        impact: 'Ты переоценил компанию и рекомендовал покупку. Рынок скорректировал цену вниз на 18%.',
        pnl: [
          { label: 'Позиция ($10M)', value: '−$1,800,000', color: T.red },
          { label: 'P&L фонда (день)', value: '−1.8%', color: T.red },
          { label: 'Рейтинг менеджера', value: '↓ Снижен', color: '#E85555' },
        ],
      },
    },
    recovery: 'Перепроверь расчёты WACC. Ошибка в ставке дисконтирования — дорогостоящая.',
  },
  4: {
    emoji: '🏦',
    bgColor: 'rgba(232,160,32,0.12)',
    borderColor: '#E85555',
    title: 'Deal Committee отклонил сделку!',
    buildFailures: {
      default: {
        scene: 'Ошибка в оценке или структуре сделки.',
        impact: 'Deal Committee обнаружил фундаментальную ошибку в модели. Питч-бук отправлен на доработку. TechAlpha ждёт.',
        pnl: [
          { label: 'Репутация банка', value: '↓ Под угрозой', color: T.red },
          { label: 'Сделка ($4.8B)', value: '⏸ На паузе', color: T.gold },
          { label: 'Overtime часов', value: '+40 часов', color: '#E85555' },
        ],
      },
    },
    recovery: 'Проверь логику модели ещё раз. MD даёт второй шанс — не упусти.',
  },
  5: {
    emoji: '🎯',
    bgColor: 'rgba(232,85,85,0.12)',
    borderColor: '#E85555',
    title: 'Интервью не пройдено',
    buildFailures: {
      default: {
        scene: 'Неправильный или слабо структурированный ответ на техническом интервью.',
        impact: 'Интервьюер поставил отметку "не рекомендуем". Goldman отказал в продвижении кандидата.',
        pnl: [
          { label: 'Оценка: Структура', value: '2/5 ⭐', color: T.red },
          { label: 'Оценка: Технические знания', value: '2/5 ⭐', color: T.red },
          { label: 'Статус', value: '❌ Reject', color: '#E85555' },
        ],
      },
    },
    recovery: 'Структурируй ответ по фреймворку и попробуй снова. Это часть процесса.',
  },
};

const PHASES = ['hook', 'concept', 'build', 'apply', 'consequence', 'verdict'];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LessonCoreModal({ lesson, level, onClose, onComplete }) {
  const [phase, setPhase] = useState('hook');
  const [applyWrong, setApplyWrong] = useState(false);

  if (!lesson || !level) return null;

  function handleApplyResult(isCorrect) {
    setApplyWrong(!isCorrect);
  }

  function goToNextPhase(currentPhase) {
    if (currentPhase === 'apply') {
      if (applyWrong) {
        setPhase('consequence');
      } else {
        setPhase('verdict');
      }
    } else if (currentPhase === 'consequence') {
      setPhase('verdict');
    } else {
      const idx = PHASES.indexOf(currentPhase);
      const next = PHASES[idx + 1];
      if (next) setPhase(next);
      else onComplete && onComplete(lesson.xp);
    }
  }

  const phaseLabels = {
    hook: '🎬 Хук',
    concept: '💡 Концепт',
    build: '🔨 Практика',
    apply: '✅ Применяй',
    consequence: '📉 Последствие',
    verdict: '🏆 Итог',
  };

  const visiblePhases = ['hook', 'concept', 'build', 'apply', 'verdict'];
  const activeVisibleIdx = visiblePhases.indexOf(phase === 'consequence' ? 'apply' : phase);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={s.container}>
        {/* Progress bar — 5 visible segments */}
        <View style={s.phaseBar}>
          {visiblePhases.map((p, i) => (
            <View
              key={p}
              style={[
                s.phaseSegment,
                { backgroundColor: activeVisibleIdx >= i ? level.color : T.border },
              ]}
            />
          ))}
        </View>

        {/* Header */}
        <View style={[s.header, { borderBottomColor: level.color + '44' }]}>
          <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.7}>
            <Text style={s.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={[s.phaseLabel, { color: phase === 'consequence' ? T.red : level.color }]}>
            {phaseLabels[phase]}
          </Text>
          <View style={s.xpPill}>
            <Text style={s.xpText}>+{lesson.xp} XP</Text>
          </View>
        </View>

        {phase === 'hook' && <HookPhase lesson={lesson} level={level} onNext={() => goToNextPhase('hook')} />}
        {phase === 'concept' && <ConceptPhase lesson={lesson} level={level} onNext={() => goToNextPhase('concept')} />}
        {phase === 'build' && <BuildPhase lesson={lesson} level={level} onNext={() => goToNextPhase('build')} />}
        {phase === 'apply' && (
          <ApplyPhase
            lesson={lesson}
            level={level}
            onNext={() => goToNextPhase('apply')}
            onResult={handleApplyResult}
          />
        )}
        {phase === 'consequence' && (
          <ConsequencePhase
            lesson={lesson}
            level={level}
            onNext={() => goToNextPhase('consequence')}
          />
        )}
        {phase === 'verdict' && (
          <VerdictPhase
            lesson={lesson}
            level={level}
            xp={applyWrong ? Math.floor(lesson.xp * 0.5) : lesson.xp}
            wasWrong={applyWrong}
            onComplete={() => onComplete && onComplete(applyWrong ? Math.floor(lesson.xp * 0.5) : lesson.xp)}
          />
        )}
      </View>
    </Modal>
  );
}

// ─── HOOK ──────────────────────────────────────────────────

function HookPhase({ lesson, level, onNext }) {
  return (
    <View style={s.phaseContent}>
      <View style={[s.hookCard, { backgroundColor: level.colorBg, borderColor: level.color }]}>
        <Text style={s.hookEmoji}>🚨</Text>
        <Text style={[s.hookText, { color: level.color }]}>{lesson.hook}</Text>
      </View>
      <Text style={s.lessonTitle}>{lesson.title}</Text>
      <View style={s.metaRow}>
        <Text style={s.metaItem}>⏱ {lesson.mins} мин</Text>
        <Text style={s.metaItem}>⚡ +{lesson.xp} XP</Text>
      </View>
      <TouchableOpacity style={[s.nextBtn, { backgroundColor: level.color }]} onPress={onNext} activeOpacity={0.8}>
        <Text style={s.nextBtnText}>Узнать ответ →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── CONCEPT ───────────────────────────────────────────────

function ConceptPhase({ lesson, level, onNext }) {
  const lines = (lesson.concept || '').split('\n');
  return (
    <ScrollView style={s.scrollPhase} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={s.conceptTitle}>{lesson.title}</Text>
      {lines.map((line, i) => <ConceptLine key={i} line={line} color={level.color} />)}
      <TouchableOpacity style={[s.nextBtn, { backgroundColor: level.color }]} onPress={onNext} activeOpacity={0.8}>
        <Text style={s.nextBtnText}>Понял, практикуемся →</Text>
      </TouchableOpacity>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function ConceptLine({ line, color }) {
  if (!line.trim()) return <View style={{ height: 8 }} />;
  if (line.startsWith('**') && line.endsWith('**')) {
    return <Text style={[s.conceptBold, { color }]}>{line.replace(/\*\*/g, '')}</Text>;
  }
  if (line.startsWith('• ') || line.startsWith('→ ')) {
    const text = line.slice(2);
    const parts = text.split('**');
    return (
      <View style={s.bulletRow}>
        <Text style={[s.bulletDot, { color }]}>•</Text>
        <Text style={s.bulletText}>
          {parts.map((p, i) => (
            <Text key={i} style={i % 2 === 1 ? [s.inlineBold, { color }] : {}}>{p}</Text>
          ))}
        </Text>
      </View>
    );
  }
  const parts = line.split('**');
  return (
    <Text style={s.conceptBody}>
      {parts.map((p, i) => (
        <Text key={i} style={i % 2 === 1 ? [s.inlineBold, { color }] : {}}>{p}</Text>
      ))}
    </Text>
  );
}

// ─── BUILD (classify / sort) ────────────────────────────────

function BuildPhase({ lesson, level, onNext }) {
  const task = lesson.buildTask;
  if (!task) return (
    <View style={s.phaseContent}>
      <TouchableOpacity style={[s.nextBtn, { backgroundColor: level.color }]} onPress={onNext}>
        <Text style={s.nextBtnText}>Продолжить →</Text>
      </TouchableOpacity>
    </View>
  );
  if (task.type === 'classify') return <ClassifyTask task={task} level={level} onNext={onNext} />;
  if (task.type === 'sort') return <SortTask task={task} level={level} onNext={onNext} />;
  return (
    <View style={s.phaseContent}>
      <TouchableOpacity style={[s.nextBtn, { backgroundColor: level.color }]} onPress={onNext}>
        <Text style={s.nextBtnText}>Продолжить →</Text>
      </TouchableOpacity>
    </View>
  );
}

function ClassifyTask({ task, level, onNext }) {
  // Shuffle items on mount so order is random each time
  const shuffledItems = useMemo(() => shuffleArray(task.items), []);
  const [assignments, setAssignments] = useState({});
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const allAssigned = shuffledItems.every(item => assignments[item.id]);
  const score = submitted
    ? shuffledItems.filter(item => assignments[item.id] === item.answer).length
    : 0;

  function handleItemPress(itemId) {
    if (submitted) return;
    setSelected(selected === itemId ? null : itemId);
  }

  function handleCategoryPress(catId) {
    if (!selected || submitted) return;
    setAssignments(prev => ({ ...prev, [selected]: catId }));
    setSelected(null);
  }

  return (
    <ScrollView style={s.scrollPhase} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={s.taskInstruction}>{task.instruction}</Text>
      {!submitted && selected && (
        <View style={[s.hintBox, { borderColor: level.color }]}>
          <Text style={[s.hintText, { color: level.color }]}>Выбрано — тапни на категорию ниже ↓</Text>
        </View>
      )}

      {/* Categories */}
      <View style={s.categoriesWrap}>
        {task.categories.map(cat => {
          const assignedItems = shuffledItems.filter(item => assignments[item.id] === cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              style={[s.categoryBucket, { borderColor: cat.color }]}
              onPress={() => handleCategoryPress(cat.id)}
              activeOpacity={0.8}
            >
              <Text style={[s.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
              <View style={s.categoryItems}>
                {assignedItems.map(item => {
                  const isCorrect = submitted && item.answer === cat.id;
                  const isWrong = submitted && item.answer !== cat.id;
                  return (
                    <View key={item.id} style={[
                      s.assignedItem,
                      { borderColor: submitted ? (isCorrect ? T.green : T.red) : cat.color + '66' },
                      submitted && isCorrect && { backgroundColor: T.greenBg },
                      submitted && isWrong && { backgroundColor: T.redBg },
                    ]}>
                      <Text style={[s.assignedItemText, { color: submitted ? (isCorrect ? T.green : T.red) : T.text }]}>
                        {submitted && (isCorrect ? '✓ ' : '✗ ')}{item.label}
                      </Text>
                    </View>
                  );
                })}
                {assignedItems.length === 0 && (
                  <Text style={s.emptyBucket}>Тапни элемент → тапни сюда</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Items pool */}
      <Text style={s.poolTitle}>Элементы (тапни, затем выбери категорию):</Text>
      <View style={s.itemsPool}>
        {shuffledItems.map(item => {
          if (assignments[item.id]) return null;
          const isSelected = selected === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[s.poolItem, isSelected && { backgroundColor: level.colorBg, borderColor: level.color }]}
              onPress={() => handleItemPress(item.id)}
              activeOpacity={0.75}
            >
              <Text style={[s.poolItemText, isSelected && { color: level.color }]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {submitted && (
        <View style={[s.resultBox, { backgroundColor: score === shuffledItems.length ? T.greenBg : T.redBg }]}>
          <Text style={[s.resultText, { color: score === shuffledItems.length ? T.green : T.red }]}>
            {score === shuffledItems.length ? '🎉 Все верно!' : `${score}/${shuffledItems.length} верных — ошибки выделены красным`}
          </Text>
        </View>
      )}

      {!submitted ? (
        <TouchableOpacity
          style={[s.nextBtn, { backgroundColor: level.color, opacity: allAssigned ? 1 : 0.4 }]}
          onPress={() => setSubmitted(true)}
          disabled={!allAssigned}
        >
          <Text style={s.nextBtnText}>Проверить →</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[s.nextBtn, { backgroundColor: level.color }]} onPress={onNext}>
          <Text style={s.nextBtnText}>Далее →</Text>
        </TouchableOpacity>
      )}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function SortTask({ task, level, onNext }) {
  const [order, setOrder] = useState(() => shuffleArray(task.items));
  const [submitted, setSubmitted] = useState(false);

  function moveUp(idx) {
    if (idx === 0 || submitted) return;
    const n = [...order];
    [n[idx], n[idx - 1]] = [n[idx - 1], n[idx]];
    setOrder(n);
  }
  function moveDown(idx) {
    if (idx === order.length - 1 || submitted) return;
    const n = [...order];
    [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]];
    setOrder(n);
  }

  const isCorrect = (item, idx) => item.order === idx + 1;
  const score = submitted ? order.filter((item, idx) => isCorrect(item, idx)).length : 0;

  return (
    <ScrollView style={s.scrollPhase} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={s.taskInstruction}>{task.instruction}</Text>
      {!submitted && <Text style={s.sortHint}>Используй ▲ ▼ для перестановки</Text>}
      {order.map((item, idx) => {
        const correct = submitted && isCorrect(item, idx);
        const wrong = submitted && !isCorrect(item, idx);
        return (
          <View key={item.id} style={[
            s.sortRow,
            correct && { borderColor: T.green, backgroundColor: T.greenBg },
            wrong && { borderColor: T.red, backgroundColor: T.redBg },
          ]}>
            <View style={[s.sortNum, { backgroundColor: submitted ? (correct ? T.green : T.red) : level.color }]}>
              <Text style={s.sortNumText}>{idx + 1}</Text>
            </View>
            <Text style={[s.sortItemText, wrong && { color: T.red }]} numberOfLines={2}>{item.label}</Text>
            {!submitted && (
              <View style={s.sortArrows}>
                <TouchableOpacity onPress={() => moveUp(idx)} style={s.arrowBtn}>
                  <Text style={[s.arrowText, { color: idx === 0 ? T.faint : level.color }]}>▲</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => moveDown(idx)} style={s.arrowBtn}>
                  <Text style={[s.arrowText, { color: idx === order.length - 1 ? T.faint : level.color }]}>▼</Text>
                </TouchableOpacity>
              </View>
            )}
            {submitted && <Text style={{ color: correct ? T.green : T.red, fontSize: 18 }}>{correct ? '✓' : '✗'}</Text>}
          </View>
        );
      })}
      {submitted && (
        <View style={[s.resultBox, { backgroundColor: score === order.length ? T.greenBg : T.redBg }]}>
          <Text style={[s.resultText, { color: score === order.length ? T.green : T.red }]}>
            {score === order.length ? '🎉 Правильный порядок!' : `${score}/${order.length} позиций верных`}
          </Text>
        </View>
      )}
      {!submitted ? (
        <TouchableOpacity style={[s.nextBtn, { backgroundColor: level.color }]} onPress={() => setSubmitted(true)}>
          <Text style={s.nextBtnText}>Проверить →</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[s.nextBtn, { backgroundColor: level.color }]} onPress={onNext}>
          <Text style={s.nextBtnText}>Далее →</Text>
        </TouchableOpacity>
      )}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── APPLY (MCQ) ────────────────────────────────────────────

function ApplyPhase({ lesson, level, onNext, onResult }) {
  const task = lesson.applyTask;
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  if (!task) return (
    <View style={s.phaseContent}>
      <TouchableOpacity style={[s.nextBtn, { backgroundColor: level.color }]} onPress={() => { onResult && onResult(true); onNext(); }}>
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
    <ScrollView style={s.scrollPhase} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[s.questionBadge, { backgroundColor: level.colorBg }]}>
        <Text style={[s.questionBadgeText, { color: level.color }]}>📐 Применяй знания</Text>
      </View>
      <Text style={s.questionText}>{task.question}</Text>

      <View style={s.optionsWrap}>
        {task.options.map((opt, i) => {
          let optStyle = s.option;
          let textStyle = s.optText;
          if (confirmed) {
            if (i === task.correct) { optStyle = [s.option, s.optCorrect]; textStyle = [s.optText, { color: T.green }]; }
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
                confirmed && i === task.correct && { backgroundColor: T.green },
                confirmed && i === selected && i !== task.correct && { backgroundColor: T.red },
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
            {isCorrect ? '✅ Правильно! ' : '❌ Неверно. '}{task.explanation}
          </Text>
        </View>
      )}

      {!confirmed ? (
        <TouchableOpacity
          style={[s.nextBtn, { backgroundColor: level.color, opacity: selected === null ? 0.4 : 1 }]}
          onPress={handleConfirm}
          disabled={selected === null}
        >
          <Text style={s.nextBtnText}>Проверить →</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[s.nextBtn, { backgroundColor: isCorrect ? level.color : T.red }]} onPress={onNext}>
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

function ConsequencePhase({ lesson, level, onNext }) {
  const levelConseq = LEVEL_CONSEQUENCES[level.id] || LEVEL_CONSEQUENCES[1];
  const lessonConseq = levelConseq.buildFailures[lesson.id] || levelConseq.buildFailures.default;

  return (
    <ScrollView style={s.scrollPhase} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Alert banner */}
      <View style={[s.consequenceBanner, { backgroundColor: levelConseq.bgColor, borderColor: levelConseq.borderColor }]}>
        <Text style={s.consequenceEmoji}>{levelConseq.emoji}</Text>
        <Text style={[s.consequenceTitle, { color: levelConseq.borderColor }]}>{levelConseq.title}</Text>
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
        <Text style={s.penaltyText}>⚡ XP за урок снижен: получишь только 50% (+{Math.floor(lesson.xp * 0.5)} XP)</Text>
      </View>

      {/* Recovery tip */}
      <View style={[s.recoveryCard, { borderColor: level.color + '55' }]}>
        <Text style={s.recoveryLabel}>💡 Как исправить:</Text>
        <Text style={s.recoveryText}>{levelConseq.recovery}</Text>
      </View>

      <TouchableOpacity style={[s.nextBtn, { backgroundColor: level.color }]} onPress={onNext} activeOpacity={0.8}>
        <Text style={s.nextBtnText}>Понял, буду учиться →</Text>
      </TouchableOpacity>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── VERDICT ────────────────────────────────────────────────

function VerdictPhase({ lesson, level, xp, wasWrong, onComplete }) {
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
          <Text style={s.retryHintText}>💡 Изучи концепцию ещё раз — следующая попытка даст полные XP</Text>
        </View>
      )}
      <View style={[s.verdictBox, { borderColor: level.color + '55', backgroundColor: level.colorBg }]}>
        <Text style={[s.verdictText, { color: level.color }]}>
          {wasWrong ? '📖 ' + (LEVEL_CONSEQUENCES[level.id]?.recovery || 'Повтори материал.') : (lesson.verdict || '✅ Отличная работа!')}
        </Text>
      </View>
      <TouchableOpacity style={[s.nextBtn, { backgroundColor: level.color }]} onPress={onComplete} activeOpacity={0.8}>
        <Text style={s.nextBtnText}>Сохранить и вернуться →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── STYLES ─────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  phaseBar: { flexDirection: 'row', gap: 4, paddingHorizontal: 20, paddingTop: 52 },
  phaseSegment: { flex: 1, height: 3, borderRadius: 2 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1,
  },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: T.sub, fontSize: 16 },
  phaseLabel: { fontSize: 14, fontWeight: '700' },
  xpPill: { backgroundColor: T.goldBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  xpText: { color: T.gold, fontSize: 11, fontWeight: '700' },

  phaseContent: { flex: 1, padding: 20, justifyContent: 'center' },
  scrollPhase: { flex: 1 },
  scrollContent: { padding: 20 },

  hookCard: { borderRadius: 16, padding: 20, borderWidth: 2, marginBottom: 20, alignItems: 'center' },
  hookEmoji: { fontSize: 36, marginBottom: 10 },
  hookText: { fontSize: 17, fontWeight: '700', textAlign: 'center', lineHeight: 26 },
  lessonTitle: { color: T.text, fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  metaRow: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginBottom: 24 },
  metaItem: { color: T.sub, fontSize: 13, fontWeight: '600' },

  conceptTitle: { color: T.text, fontSize: 20, fontWeight: '800', marginBottom: 14 },
  conceptBold: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  conceptBody: { color: T.text, fontSize: 14, lineHeight: 22, marginBottom: 6 },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 4, paddingLeft: 4 },
  bulletDot: { fontSize: 14, fontWeight: '800', lineHeight: 22 },
  bulletText: { color: T.text, fontSize: 14, lineHeight: 22, flex: 1 },
  inlineBold: { fontWeight: '800' },

  taskInstruction: { color: T.text, fontSize: 15, fontWeight: '700', marginBottom: 14 },
  hintBox: { borderRadius: 10, padding: 8, borderWidth: 1, marginBottom: 10 },
  hintText: { fontSize: 12, fontWeight: '600' },
  categoriesWrap: { gap: 10, marginBottom: 14 },
  categoryBucket: { backgroundColor: T.surface, borderRadius: 14, padding: 12, borderWidth: 2 },
  categoryLabel: { fontSize: 13, fontWeight: '800', marginBottom: 8 },
  categoryItems: { gap: 6, minHeight: 36 },
  assignedItem: { borderRadius: 8, padding: 8, borderWidth: 1, backgroundColor: T.card },
  assignedItemText: { color: T.text, fontSize: 12 },
  emptyBucket: { color: T.faint, fontSize: 12, fontStyle: 'italic', textAlign: 'center', paddingVertical: 4 },
  poolTitle: { color: T.sub, fontSize: 12, marginBottom: 8 },
  itemsPool: { flexWrap: 'wrap', flexDirection: 'row', gap: 8, marginBottom: 16 },
  poolItem: { backgroundColor: T.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: T.border },
  poolItemText: { color: T.text, fontSize: 12 },

  sortHint: { color: T.sub, fontSize: 12, marginBottom: 10, fontStyle: 'italic' },
  sortRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: T.border, marginBottom: 8,
  },
  sortNum: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sortNumText: { color: '#000', fontSize: 11, fontWeight: '800' },
  sortItemText: { color: T.text, fontSize: 13, flex: 1 },
  sortArrows: { flexDirection: 'row', gap: 4 },
  arrowBtn: { padding: 4 },
  arrowText: { fontSize: 16, fontWeight: '700' },

  resultBox: { borderRadius: 12, padding: 14, marginBottom: 14 },
  resultText: { fontSize: 14, fontWeight: '700' },

  questionBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
  questionBadgeText: { fontSize: 12, fontWeight: '700' },
  questionText: { color: T.text, fontSize: 17, fontWeight: '600', lineHeight: 26, marginBottom: 20 },
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

  // Consequence
  consequenceBanner: {
    borderRadius: 14, padding: 20, borderWidth: 2, marginBottom: 14,
    alignItems: 'center',
  },
  consequenceEmoji: { fontSize: 48, marginBottom: 8 },
  consequenceTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },

  sceneCard: {
    backgroundColor: T.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, marginBottom: 14,
  },
  sceneLabel: { color: T.sub, fontSize: 11, fontWeight: '700', marginBottom: 6 },
  sceneText: { color: T.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  impactText: { color: T.sub, fontSize: 13, lineHeight: 20 },

  pnlCard: {
    backgroundColor: T.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: T.border, marginBottom: 14,
  },
  pnlTitle: { color: T.text, fontSize: 13, fontWeight: '700', marginBottom: 10 },
  pnlRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: T.border },
  pnlLabel: { color: T.sub, fontSize: 13 },
  pnlValue: { fontSize: 13, fontWeight: '700' },

  penaltyBadge: {
    backgroundColor: T.redBg, borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: T.red + '55', marginBottom: 14,
  },
  penaltyText: { color: T.red, fontSize: 12, fontWeight: '600' },

  recoveryCard: {
    backgroundColor: T.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, marginBottom: 16,
  },
  recoveryLabel: { color: T.sub, fontSize: 11, fontWeight: '700', marginBottom: 4 },
  recoveryText: { color: T.text, fontSize: 13, lineHeight: 20 },

  // Verdict
  verdictWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  xpCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: T.goldBg,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    borderWidth: 2, borderColor: T.gold,
  },
  xpCircleWrong: { backgroundColor: T.redBg, borderColor: T.red },
  xpCircleEmoji: { fontSize: 28, marginBottom: 2 },
  xpCircleNum: { fontSize: 28, fontWeight: '900' },
  xpCircleLabel: { color: T.gold, fontSize: 12, fontWeight: '700' },
  verdictTitle: { color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  verdictLesson: { color: T.sub, fontSize: 14, marginBottom: 16, textAlign: 'center' },
  retryHint: { backgroundColor: T.goldBg, borderRadius: 10, padding: 10, marginBottom: 12, alignSelf: 'stretch' },
  retryHintText: { color: T.gold, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  verdictBox: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 28, alignSelf: 'stretch' },
  verdictText: { fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 22 },

  nextBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  nextBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
});
