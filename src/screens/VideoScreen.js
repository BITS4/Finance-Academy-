import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { T } from '../theme';
import { VIDEOS } from '../data/courses';

const { width } = Dimensions.get('window');
const PLAYER_HEIGHT = Math.round((width * 9) / 16);

export default function VideoScreen() {
  const [playing, setPlaying] = useState(null);

  function closePlayer() {
    setPlaying(null);
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Видеотека</Text>
        <Text style={s.sub}>{VIDEOS.length} видео по финансовому учёту</Text>
      </View>

      <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
        {VIDEOS.map((v) => (
          <TouchableOpacity
            key={v.id}
            style={s.card}
            onPress={() => setPlaying(v)}
            activeOpacity={0.75}
          >
            <View style={s.thumbWrap}>
              <Image
                source={{ uri: `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg` }}
                style={s.thumb}
                resizeMode="cover"
              />
              <View style={s.playBtn}>
                <Text style={s.playIcon}>▶</Text>
              </View>
              <View style={[s.tagBadge, { backgroundColor: v.tagColor + '22' }]}>
                <Text style={[s.tagText, { color: v.tagColor }]}>{v.tag}</Text>
              </View>
              <View style={s.durationBadge}>
                <Text style={s.durationText}>{v.duration}</Text>
              </View>
            </View>
            <View style={s.info}>
              <Text style={s.videoTitle} numberOfLines={2}>
                {v.title}
              </Text>
              <Text style={s.channel}>{v.channel}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={!!playing} animationType="slide" onRequestClose={closePlayer}>
        <View style={s.modal}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle} numberOfLines={1}>
              {playing?.title}
            </Text>
            <TouchableOpacity onPress={closePlayer} style={s.closeBtn}>
              <Text style={s.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={s.playerWrap}>
            {playing && (
              <YoutubePlayer
                height={PLAYER_HEIGHT}
                width={width}
                videoId={playing.videoId}
                play
                webViewProps={{
                  allowsFullscreenVideo: true,
                  allowsInlineMediaPlayback: true,
                }}
              />
            )}
          </View>

          <View style={s.modalInfo}>
            <Text style={s.modalVideoTitle}>{playing?.title}</Text>
            <Text style={s.modalChannel}>
              {playing?.channel} · {playing?.duration}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: { padding: 20, paddingBottom: 8 },
  title: { color: T.text, fontSize: 24, fontWeight: '700', marginBottom: 4 },
  sub: { color: T.sub, fontSize: 13 },
  list: { padding: 20, gap: 16 },
  card: {
    backgroundColor: T.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: T.border,
  },
  thumbWrap: { height: 180, backgroundColor: T.card, position: 'relative' },
  thumb: { width: '100%', height: '100%' },
  playBtn: {
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
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  playIcon: { color: '#fff', fontSize: 20, marginLeft: 3 },
  tagBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: { fontSize: 11, fontWeight: '600' },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  info: { padding: 14 },
  videoTitle: { color: T.text, fontSize: 14, fontWeight: '600', marginBottom: 4, lineHeight: 20 },
  channel: { color: T.sub, fontSize: 12 },
  modal: { flex: 1, backgroundColor: T.bg },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 52,
    borderBottomWidth: 1,
    borderColor: T.border,
  },
  modalTitle: { flex: 1, color: T.text, fontSize: 16, fontWeight: '600' },
  closeBtn: { padding: 8 },
  closeText: { color: T.sub, fontSize: 20 },
  playerWrap: { backgroundColor: '#000' },
  modalInfo: { padding: 20 },
  modalVideoTitle: { color: T.text, fontSize: 16, fontWeight: '600', marginBottom: 6 },
  modalChannel: { color: T.sub, fontSize: 13 },
});
