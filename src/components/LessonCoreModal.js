import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

import {
  VISIBLE_LESSON_PHASES,
  earnedLessonXp,
  nextLessonPhase,
  visiblePhaseIndex,
} from '../domain/lesson-flow';
import { T } from '../theme';
import { BuildPhase, ConceptPhase, HookPhase } from './lesson/LessonContentPhases';
import { ApplyPhase, ConsequencePhase, VerdictPhase } from './lesson/LessonOutcomePhases';
import { s } from './lesson/lessonStyles';

export default function LessonCoreModal({ lesson, level, onClose, onComplete }) {
  const [phase, setPhase] = useState('hook');
  const [applyWrong, setApplyWrong] = useState(false);

  if (!lesson || !level) return null;

  function handleApplyResult(isCorrect) {
    setApplyWrong(!isCorrect);
  }

  function goToNextPhase(currentPhase) {
    const next = nextLessonPhase(currentPhase, applyWrong);
    if (next) setPhase(next);
    else onComplete && onComplete(earnedLessonXp(lesson.xp, applyWrong));
  }

  const phaseLabels = {
    hook: '🎬 Хук',
    concept: '💡 Концепт',
    build: '🔨 Практика',
    apply: '✅ Применяй',
    consequence: '📉 Последствие',
    verdict: '🏆 Итог',
  };

  const activeVisibleIdx = visiblePhaseIndex(phase);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={s.container}>
        {/* Progress bar — 5 visible segments */}
        <View style={s.phaseBar}>
          {VISIBLE_LESSON_PHASES.map((p, i) => (
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

        {phase === 'hook' && (
          <HookPhase lesson={lesson} level={level} onNext={() => goToNextPhase('hook')} />
        )}
        {phase === 'concept' && (
          <ConceptPhase lesson={lesson} level={level} onNext={() => goToNextPhase('concept')} />
        )}
        {phase === 'build' && (
          <BuildPhase lesson={lesson} level={level} onNext={() => goToNextPhase('build')} />
        )}
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
            xp={earnedLessonXp(lesson.xp, applyWrong)}
            wasWrong={applyWrong}
            onComplete={() => onComplete && onComplete(earnedLessonXp(lesson.xp, applyWrong))}
          />
        )}
      </View>
    </Modal>
  );
}
