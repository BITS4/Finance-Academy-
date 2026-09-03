# Assessment API

Default origin: `http://localhost:8787`. All JSON routes return an `x-request-id` response header.

## `GET /health`

Returns HTTP 200 when the process is ready:

```json
{ "status": "ok", "service": "finance-academy-api", "version": "1.1.0" }
```

## `GET /metrics`

Returns Prometheus text metrics for HTTP request totals, assessment totals, and aggregate assessment latency. Do not expose this endpoint publicly without network-level access control.

## `POST /v1/assessment`

Request bodies must be JSON, at most 20 KiB, and contain exactly:

```json
{
  "system": "You are an interview coach.",
  "prompt": "Evaluate this answer."
}
```

`system` accepts 1–4,000 trimmed characters; `prompt` accepts 1–12,000. A successful response is:

```json
{ "text": "Structured feedback...", "requestId": "a-correlation-id" }
```

| Status | Code                   | Meaning                                          |
| ------ | ---------------------- | ------------------------------------------------ |
| 400    | `invalid_json`         | Body is not valid JSON                           |
| 413    | `payload_too_large`    | Body exceeds 20 KiB                              |
| 422    | `validation_failed`    | Schema or length validation failed               |
| 429    | `rate_limited`         | Per-address window exceeded; honor `retry-after` |
| 503    | `provider_unavailable` | Provider failed or timed out                     |

Errors use `{ "error": { "code": "...", "message": "..." } }`. They intentionally exclude stack traces, credentials, and upstream response bodies.
