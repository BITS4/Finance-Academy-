# 📊 Академия Финансового Учёта — Mobile App

Мобильное приложение для изучения финансового учёта. Работает на **Android** и **iOS**.

---

## 🚀 Быстрый старт (тестирование на телефоне)

### 1. Установите инструменты

```bash
# Установите Node.js (https://nodejs.org) — версия 18+
# Затем установите Expo CLI:
npm install -g expo-cli
```

### 2. Установите зависимости

```bash
cd FinanceAcademy
npm install
```

### 3. Добавьте API ключ

Откройте файл `src/api.js` и вставьте ваш ключ Anthropic:

```js
const API_KEY = 'sk-ant-...ваш-ключ...';
```

Получить ключ: https://console.anthropic.com

### 4. Запустите приложение

```bash
npm start
```

Откроется QR-код. Установите приложение **Expo Go** на телефон:
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent
- iOS: https://apps.apple.com/app/expo-go/id982107779

Наведите камеру на QR-код — приложение откроется на вашем телефоне!

---

## 📦 Сборка готового APK / IPA

### Android (APK)

```bash
# Установите EAS CLI
npm install -g eas-cli

# Войдите в аккаунт Expo
eas login

# Сборка APK
eas build --platform android --profile preview
```

### iOS (IPA)

```bash
eas build --platform ios
```

> ⚠️ Для iOS нужен аккаунт Apple Developer ($99/год)

---

## 🗂️ Структура проекта

```
FinanceAcademy/
├── App.js                    # Главный файл, навигация
├── app.json                  # Конфигурация Expo
├── package.json
└── src/
    ├── theme.js              # Цвета и стили
    ├── api.js                # Anthropic Claude API
    ├── storage.js            # AsyncStorage (прогресс)
    ├── data/
    │   └── courses.js        # Данные курсов и видео
    ├── screens/
    │   ├── HomeScreen.js     # Главная
    │   ├── CoursesScreen.js  # Каталог курсов
    │   ├── VideoScreen.js    # Видеотека
    │   └── ProgressScreen.js # Прогресс
    └── components/
        ├── CourseModal.js    # Детали курса
        ├── LessonModal.js    # Просмотр урока
        ├── AssessmentModal.js # AI-тест знаний
        └── ExamModal.js      # Финальный экзамен
```

---

## ✨ Функциональность

| Функция | Описание |
|---|---|
| 📚 5 курсов | Основы → Анализ → Бюджетирование |
| 🧠 AI-тест | Оценка уровня перед курсом (Claude API) |
| 🏆 Экзамены | 10 вопросов + разбор ошибок |
| 📹 Видеотека | 8 видео с YouTube |
| 📊 Прогресс | Трекинг уроков и сертификатов |
| 💾 Сохранение | Прогресс сохраняется между сессиями |

---

## ⚠️ Важно для продакшна

В продакшн-версии НЕ храните API ключ в коде приложения.
Создайте backend-сервер (Node.js/Python) и отправляйте запросы через него.

---

## 🛠️ Технологии

- **React Native** + **Expo** — кроссплатформенный фреймворк
- **React Navigation** — навигация между экранами
- **AsyncStorage** — хранение прогресса
- **react-native-webview** — YouTube плеер
- **Anthropic Claude API** — AI тесты и экзамены
