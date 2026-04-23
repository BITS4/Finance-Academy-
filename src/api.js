// ⚠️ В продакшне используйте backend-сервер для хранения API ключа!
// Для тестирования вставьте ваш ключ ниже:
const API_KEY = 'YOUR_ANTHROPIC_API_KEY_HERE';

export async function callClaude(system, prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'API error');
  if (!Array.isArray(data.content) || data.content.length === 0) {
    throw new Error('Unexpected API response format');
  }
  return data.content[0].text;
}
