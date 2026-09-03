import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { shuffle } from '../../domain/lesson-flow';
import { T } from '../../theme';
import { s } from './lessonStyles';

export function HookPhase({ lesson, level, onNext }) {
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
      <TouchableOpacity
        style={[s.nextBtn, { backgroundColor: level.color }]}
        onPress={onNext}
        activeOpacity={0.8}
      >
        <Text style={s.nextBtnText}>Узнать ответ →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── CONCEPT ───────────────────────────────────────────────

export function ConceptPhase({ lesson, level, onNext }) {
  const lines = (lesson.concept || '').split('\n');
  return (
    <ScrollView
      style={s.scrollPhase}
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.conceptTitle}>{lesson.title}</Text>
      {lines.map((line, i) => (
        <ConceptLine key={i} line={line} color={level.color} />
      ))}
      <TouchableOpacity
        style={[s.nextBtn, { backgroundColor: level.color }]}
        onPress={onNext}
        activeOpacity={0.8}
      >
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
            <Text key={i} style={i % 2 === 1 ? [s.inlineBold, { color }] : {}}>
              {p}
            </Text>
          ))}
        </Text>
      </View>
    );
  }
  const parts = line.split('**');
  return (
    <Text style={s.conceptBody}>
      {parts.map((p, i) => (
        <Text key={i} style={i % 2 === 1 ? [s.inlineBold, { color }] : {}}>
          {p}
        </Text>
      ))}
    </Text>
  );
}

// ─── BUILD (classify / sort) ────────────────────────────────

export function BuildPhase({ lesson, level, onNext }) {
  const task = lesson.buildTask;
  if (!task)
    return (
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
  const shuffledItems = useMemo(() => shuffle(task.items), [task.items]);
  const [assignments, setAssignments] = useState({});
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const allAssigned = shuffledItems.every((item) => assignments[item.id]);
  const score = submitted
    ? shuffledItems.filter((item) => assignments[item.id] === item.answer).length
    : 0;

  function handleItemPress(itemId) {
    if (submitted) return;
    setSelected(selected === itemId ? null : itemId);
  }

  function handleCategoryPress(catId) {
    if (!selected || submitted) return;
    setAssignments((prev) => ({ ...prev, [selected]: catId }));
    setSelected(null);
  }

  return (
    <ScrollView
      style={s.scrollPhase}
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.taskInstruction}>{task.instruction}</Text>
      {!submitted && selected && (
        <View style={[s.hintBox, { borderColor: level.color }]}>
          <Text style={[s.hintText, { color: level.color }]}>
            Выбрано — тапни на категорию ниже ↓
          </Text>
        </View>
      )}

      {/* Categories */}
      <View style={s.categoriesWrap}>
        {task.categories.map((cat) => {
          const assignedItems = shuffledItems.filter((item) => assignments[item.id] === cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              style={[s.categoryBucket, { borderColor: cat.color }]}
              onPress={() => handleCategoryPress(cat.id)}
              activeOpacity={0.8}
            >
              <Text style={[s.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
              <View style={s.categoryItems}>
                {assignedItems.map((item) => {
                  const isCorrect = submitted && item.answer === cat.id;
                  const isWrong = submitted && item.answer !== cat.id;
                  return (
                    <View
                      key={item.id}
                      style={[
                        s.assignedItem,
                        {
                          borderColor: submitted ? (isCorrect ? T.green : T.red) : cat.color + '66',
                        },
                        submitted && isCorrect && { backgroundColor: T.greenBg },
                        submitted && isWrong && { backgroundColor: T.redBg },
                      ]}
                    >
                      <Text
                        style={[
                          s.assignedItemText,
                          { color: submitted ? (isCorrect ? T.green : T.red) : T.text },
                        ]}
                      >
                        {submitted && (isCorrect ? '✓ ' : '✗ ')}
                        {item.label}
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
        {shuffledItems.map((item) => {
          if (assignments[item.id]) return null;
          const isSelected = selected === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                s.poolItem,
                isSelected && { backgroundColor: level.colorBg, borderColor: level.color },
              ]}
              onPress={() => handleItemPress(item.id)}
              activeOpacity={0.75}
            >
              <Text style={[s.poolItemText, isSelected && { color: level.color }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {submitted && (
        <View
          style={[
            s.resultBox,
            { backgroundColor: score === shuffledItems.length ? T.greenBg : T.redBg },
          ]}
        >
          <Text style={[s.resultText, { color: score === shuffledItems.length ? T.green : T.red }]}>
            {score === shuffledItems.length
              ? '🎉 Все верно!'
              : `${score}/${shuffledItems.length} верных — ошибки выделены красным`}
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
  const [order, setOrder] = useState(() => shuffle(task.items));
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
    <ScrollView
      style={s.scrollPhase}
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.taskInstruction}>{task.instruction}</Text>
      {!submitted && <Text style={s.sortHint}>Используй ▲ ▼ для перестановки</Text>}
      {order.map((item, idx) => {
        const correct = submitted && isCorrect(item, idx);
        const wrong = submitted && !isCorrect(item, idx);
        return (
          <View
            key={item.id}
            style={[
              s.sortRow,
              correct && { borderColor: T.green, backgroundColor: T.greenBg },
              wrong && { borderColor: T.red, backgroundColor: T.redBg },
            ]}
          >
            <View
              style={[
                s.sortNum,
                { backgroundColor: submitted ? (correct ? T.green : T.red) : level.color },
              ]}
            >
              <Text style={s.sortNumText}>{idx + 1}</Text>
            </View>
            <Text style={[s.sortItemText, wrong && { color: T.red }]} numberOfLines={2}>
              {item.label}
            </Text>
            {!submitted && (
              <View style={s.sortArrows}>
                <TouchableOpacity onPress={() => moveUp(idx)} style={s.arrowBtn}>
                  <Text style={[s.arrowText, { color: idx === 0 ? T.faint : level.color }]}>▲</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => moveDown(idx)} style={s.arrowBtn}>
                  <Text
                    style={[
                      s.arrowText,
                      { color: idx === order.length - 1 ? T.faint : level.color },
                    ]}
                  >
                    ▼
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {submitted && (
              <Text style={{ color: correct ? T.green : T.red, fontSize: 18 }}>
                {correct ? '✓' : '✗'}
              </Text>
            )}
          </View>
        );
      })}
      {submitted && (
        <View
          style={[s.resultBox, { backgroundColor: score === order.length ? T.greenBg : T.redBg }]}
        >
          <Text style={[s.resultText, { color: score === order.length ? T.green : T.red }]}>
            {score === order.length
              ? '🎉 Правильный порядок!'
              : `${score}/${order.length} позиций верных`}
          </Text>
        </View>
      )}
      {!submitted ? (
        <TouchableOpacity
          style={[s.nextBtn, { backgroundColor: level.color }]}
          onPress={() => setSubmitted(true)}
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

// ─── APPLY (MCQ) ────────────────────────────────────────────
