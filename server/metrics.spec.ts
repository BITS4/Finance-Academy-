import { describe, expect, it } from 'vitest';

import { MetricsRegistry } from './metrics';

describe('metrics registry', () => {
  it('records labelled requests and assessment latency', () => {
    const metrics = new MetricsRegistry();
    metrics.recordRequest('GET', '/health', 200);
    metrics.recordRequest('GET', '/health', 200);
    metrics.recordRequest('POST', '/v1/assessment', 422);
    metrics.recordAssessment(24);

    const body = metrics.render();
    expect(body).toContain('method="GET",route="/health",status="200"} 2');
    expect(body).toContain('finance_academy_assessments_total 1');
    expect(body).toContain('finance_academy_assessment_duration_ms_total 24');
  });

  it('does not accept negative latency', () => {
    const metrics = new MetricsRegistry();
    metrics.recordAssessment(-10);
    expect(metrics.render()).toContain('finance_academy_assessment_duration_ms_total 0');
  });
});
