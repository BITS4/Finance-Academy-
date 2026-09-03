import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { VIDEOS } from '../data/courses';
import { T } from '../theme';

export default function VideoScreen() {
  const [playing, setPlaying] = useState(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Видеотека</Text>
        <Text style={styles.subtitle}>{VIDEOS.length} видео по финансовому учёту</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {VIDEOS.map((video) => (
          <TouchableOpacity key={video.id} style={styles.card} onPress={() => setPlaying(video)}>
            <View style={styles.thumbnailWrap}>
              <Image
                source={{ uri: `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg` }}
                style={styles.thumbnail}
              />
              <View style={styles.playButton}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </View>
            <View style={styles.info}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <Text style={styles.channel}>
                {video.channel} · {video.duration}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {playing && (
        <View style={styles.overlay} accessibilityRole="dialog">
          <View style={styles.dialog}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>{playing.title}</Text>
              <TouchableOpacity onPress={() => setPlaying(null)} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            <iframe
              title={playing.title}
              src={`https://www.youtube-nocookie.com/embed/${playing.videoId}?autoplay=1`}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={styles.frame}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: { padding: 20, paddingBottom: 8 },
  title: { color: T.text, fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: T.sub, fontSize: 13 },
  list: { padding: 20, gap: 16 },
  card: {
    backgroundColor: T.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: T.border,
  },
  thumbnailWrap: { height: 180, backgroundColor: T.card, position: 'relative' },
  thumbnail: { width: '100%', height: '100%' },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -28,
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: '#fff', fontSize: 20, marginLeft: 3 },
  info: { padding: 14 },
  videoTitle: { color: T.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  channel: { color: T.sub, fontSize: 12 },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: { width: '100%', maxWidth: 900, backgroundColor: T.surface, borderRadius: 16 },
  dialogHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  dialogTitle: { flex: 1, color: T.text, fontSize: 16, fontWeight: '600' },
  closeButton: { padding: 8 },
  closeText: { color: T.sub, fontSize: 20 },
  frame: { width: '100%', aspectRatio: '16 / 9', border: 0, backgroundColor: '#000' },
});
