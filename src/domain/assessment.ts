export interface QuizAnswer {
  selected: number;
  correct: number;
  topic: string;
}

export interface QuizResult {
  score: number;
  total: number;
  weakTopics: string[];
}

export function calculateQuizResult(answers: readonly QuizAnswer[]): QuizResult {
  const weakTopics = answers
    .filter((answer) => answer.selected !== answer.correct)
    .map((answer) => answer.topic)
    .filter((topic, index, topics) => topics.indexOf(topic) === index);
  return {
    score: answers.filter((answer) => answer.selected === answer.correct).length,
    total: answers.length,
    weakTopics,
  };
}

export function scoreBand(score: number, total: number): 'strong' | 'developing' | 'needs-review' {
  if (total <= 0) return 'needs-review';
  const ratio = score / total;
  if (ratio >= 0.8) return 'strong';
  if (ratio >= 0.6) return 'developing';
  return 'needs-review';
}
