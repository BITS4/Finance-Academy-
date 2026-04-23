import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Modal, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';

import { T } from './src/theme';
import {
  loadProgress,
  markLevelLessonDone,
  markLevelInterviewDone,
  saveLevelGateResult,
} from './src/storage';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import VideoScreen from './src/screens/VideoScreen';

// New modals
import LevelDetailModal from './src/components/LevelDetailModal';
import LessonCoreModal from './src/components/LessonCoreModal';
import InterviewModal from './src/components/InterviewModal';
import LevelGateModal from './src/components/LevelGateModal';

// Interview prep screen (list of all 5 interview questions)
import InterviewPrepScreen from './src/screens/InterviewPrepScreen';

const Tab = createBottomTabNavigator();
const LEVEL_KEY = 'fa-user-level';

function TabIcon({ label, focused }) {
  const icons = {
    'Путь': '🗺️',
    'Интервью': '🎤',
    'Библиотека': '🎬',
    'Прогресс': '📊',
  };
  return (
    <View style={[st.tabIcon, focused && st.tabIconActive]}>
      <Text style={st.tabEmoji}>{icons[label] || '📱'}</Text>
      <Text style={[st.tabLabel, focused && st.tabLabelActive]}>{label}</Text>
    </View>
  );
}

function TabBarWithInsets({ children, style }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[style, { paddingBottom: Math.max(insets.bottom, 0), height: 64 + Math.max(insets.bottom, 0) }]}>
      {children}
    </View>
  );
}

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [progress, setProgress] = useState({});

  // Modal state
  const [selectedLevel, setSelectedLevel] = useState(null);   // LevelDetailModal
  const [activeLesson, setActiveLesson] = useState(null);     // LessonCoreModal {lesson, level}
  const [interviewLevel, setInterviewLevel] = useState(null); // InterviewModal
  const [gateLevel, setGateLevel] = useState(null);           // LevelGateModal

  useEffect(() => {
    async function init() {
      if (Platform.OS === 'android') {
        try {
          await NavigationBar.setVisibilityAsync('hidden');
          await NavigationBar.setBehaviorAsync('overlay-swipe');
          await NavigationBar.setPositionAsync('absolute');
          await NavigationBar.setBackgroundColorAsync('#00000000');
        } catch {}
      }
      const prog = await loadProgress();
      setProgress(prog);
      setAppReady(true);
    }
    init();
  }, []);

  // ─── Lesson complete ───────────────────────────────────────
  async function handleLessonComplete(lesson, level, xp) {
    const updated = await markLevelLessonDone(progress, level.id, lesson.id, xp);
    setProgress(updated);
    setActiveLesson(null);
  }

  // ─── Interview complete ────────────────────────────────────
  async function handleInterviewComplete(level) {
    const updated = await markLevelInterviewDone(progress, level.id);
    setProgress(updated);
    setInterviewLevel(null);
  }

  // ─── Gate pass ─────────────────────────────────────────────
  async function handleGatePass(level, score) {
    const passed = score >= level.examGate.passingScore;
    const updated = await saveLevelGateResult(progress, level.id, score, passed);
    setProgress(updated);
    setGateLevel(null);
    // Also close level detail so user sees updated home screen
    if (passed) setSelectedLevel(null);
  }

  if (!appReady) {
    return (
      <View style={st.splash}>
        <Text style={st.splashEmoji}>🏦</Text>
        <Text style={st.splashTitle}>Finance{'\n'}Academy</Text>
        <Text style={st.splashSub}>Путь от 0 до IB Analyst</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={T.bg} />
      <NavigationContainer theme={{ colors: { background: T.bg } }}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: st.tabBar,
            tabBarShowLabel: false,
            tabBarHideOnKeyboard: true,
            tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
          })}
        >
          <Tab.Screen name="Путь">
            {() => (
              <HomeScreen
                progress={progress}
                onLevelPress={(level) => setSelectedLevel(level)}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Интервью">
            {() => (
              <InterviewPrepScreen
                progress={progress}
                onInterviewPress={(level) => setInterviewLevel(level)}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Библиотека" component={VideoScreen} />

          <Tab.Screen name="Прогресс">
            {() => <ProgressScreen progress={progress} userLevel="advanced" />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>

      {/* Level Detail Modal */}
      {selectedLevel && (
        <LevelDetailModal
          level={selectedLevel}
          progress={progress}
          onClose={() => setSelectedLevel(null)}
          onLessonPress={(lesson, level) => setActiveLesson({ lesson, level })}
          onInterviewPress={(level) => setInterviewLevel(level)}
          onGatePress={(level) => setGateLevel(level)}
        />
      )}

      {/* Lesson Core Loop Modal */}
      {activeLesson && (
        <LessonCoreModal
          lesson={activeLesson.lesson}
          level={activeLesson.level}
          onClose={() => setActiveLesson(null)}
          onComplete={(xp) => handleLessonComplete(activeLesson.lesson, activeLesson.level, xp)}
        />
      )}

      {/* Interview Prep Modal */}
      {interviewLevel && (
        <InterviewModal
          level={interviewLevel}
          onClose={() => setInterviewLevel(null)}
          onComplete={() => handleInterviewComplete(interviewLevel)}
        />
      )}

      {/* Level Gate Modal */}
      {gateLevel && (
        <LevelGateModal
          level={gateLevel}
          onClose={() => setGateLevel(null)}
          onPass={(score) => handleGatePass(gateLevel, score)}
        />
      )}
    </SafeAreaProvider>
  );
}

const st = StyleSheet.create({
  splash: {
    flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center',
  },
  splashEmoji: { fontSize: 72, marginBottom: 16 },
  splashTitle: {
    color: T.text, fontSize: 36, fontWeight: '900', textAlign: 'center',
    lineHeight: 42, letterSpacing: 1,
  },
  splashSub: { color: T.gold, fontSize: 14, marginTop: 10, fontWeight: '600' },

  tabBar: {
    backgroundColor: T.surface,
    borderTopColor: T.border,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 0,
    elevation: 0,
  },
  tabIcon: {
    alignItems: 'center', justifyContent: 'center',
    paddingTop: 6, paddingHorizontal: 14, borderRadius: 12,
  },
  tabIconActive: { backgroundColor: T.goldBg },
  tabEmoji: { fontSize: 22, marginBottom: 2 },
  tabLabel: { fontSize: 10, color: T.sub, fontWeight: '500' },
  tabLabelActive: { color: T.gold },
});
