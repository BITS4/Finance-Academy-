export class MetricsRegistry {
  private requests = new Map<string, number>();
  private assessmentLatencyMs = 0;
  private assessments = 0;

  recordRequest(method: string, route: string, status: number): void {
    const key = `${method}:${route}:${status}`;
    this.requests.set(key, (this.requests.get(key) ?? 0) + 1);
  }

  recordAssessment(durationMs: number): void {
    this.assessments += 1;
    this.assessmentLatencyMs += Math.max(0, durationMs);
  }

  render(): string {
    const lines = [
      '# HELP finance_academy_http_requests_total HTTP requests handled.',
      '# TYPE finance_academy_http_requests_total counter',
    ];
    for (const [key, count] of [...this.requests].sort(([left], [right]) =>
      left.localeCompare(right),
    )) {
      const [method, route, status] = key.split(':');
      lines.push(
        `finance_academy_http_requests_total{method="${method}",route="${route}",status="${status}"} ${count}`,
      );
    }
    lines.push(
      '# HELP finance_academy_assessments_total Assessment requests completed.',
      '# TYPE finance_academy_assessments_total counter',
      `finance_academy_assessments_total ${this.assessments}`,
      '# HELP finance_academy_assessment_duration_ms_total Total assessment latency.',
      '# TYPE finance_academy_assessment_duration_ms_total counter',
      `finance_academy_assessment_duration_ms_total ${this.assessmentLatencyMs}`,
    );
    return `${lines.join('\n')}\n`;
  }
}
