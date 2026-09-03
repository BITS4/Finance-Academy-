import { T } from '../../theme';

export const LEVEL_CONSEQUENCES = {
  1: {
    emoji: '📉',
    bgColor: 'rgba(232,85,85,0.15)',
    borderColor: '#E85555',
    title: 'Кофейня уходит в минус!',
    buildFailures: {
      '1_m1_l1': {
        scene: 'Ты перепутал постоянные и переменные затраты.',
        impact:
          'Расчёт break-even оказался неверным. Ты закупил слишком много кофе (думал это Fixed cost) и теперь сидишь с залежами зерна на 80,000₽.',
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
        impact:
          'Ты показал инвестору завышенную прибыль. Аудитор нашёл ошибку — инвестор отозвал финансирование.',
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
        impact:
          'Регулятор выставил предписание. IPO откладывается на 6 месяцев. Инвесторы нервничают.',
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
        impact:
          'Ты переоценил компанию и рекомендовал покупку. Рынок скорректировал цену вниз на 18%.',
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
        impact:
          'Deal Committee обнаружил фундаментальную ошибку в модели. Питч-бук отправлен на доработку. TechAlpha ждёт.',
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
        impact:
          'Интервьюер поставил отметку "не рекомендуем". Goldman отказал в продвижении кандидата.',
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
