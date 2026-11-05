import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../../i18n/tr';
import { C, FONT, softShadow, TEXT_CAP } from '../../theme';
import { tapFeedback } from '../../utils/feedback';
import { BubbleButton } from './BubbleButton';
import { Icon, type IconName } from './Icon';

/** Picture-only yes/no dialog that small children understand. */
export function ConfirmDialog({
  visible,
  icon,
  iconColor = C.pinkMid,
  message,
  onYes,
  onNo,
  onDismiss,
}: {
  visible: boolean;
  icon: IconName;
  iconColor?: string;
  message?: string;
  onYes: () => void;
  onNo: () => void;
  /** iOS only: called once the closing animation has finished */
  onDismiss?: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onNo}
      onDismiss={onDismiss}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, softShadow(12)]}>
          <Icon name={icon} size={96} color={iconColor} />
          {message ? <Text style={styles.msg} maxFontSizeMultiplier={TEXT_CAP}>{message}</Text> : null}
          <View style={styles.row}>
            <BubbleButton a11y={t('no')} size={80} color={C.pinkMid} onPress={onNo} testID="confirm-no">
              <Icon name="close" size={50} />
            </BubbleButton>
            <BubbleButton a11y={t('yes')} size={80} color={C.mintMid} onPress={onYes} testID="confirm-yes">
              <Icon name="check" size={50} />
            </BubbleButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const WORDS = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];

function makeQuestion() {
  const a = 3 + Math.floor(Math.random() * 7);
  const b = 3 + Math.floor(Math.random() * 7);
  return { a, b, answer: a * b };
}

/**
 * Parental gate: a multiplication written in words + number pad.
 * Pre-readers can't solve it; adults pass in seconds.
 */
export function ParentGate({
  visible,
  onPass,
  onClose,
  onDismiss,
}: {
  visible: boolean;
  onPass: () => void;
  onClose: () => void;
  /** iOS only: called once the closing animation has finished */
  onDismiss?: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onDismiss={onDismiss}
      supportedOrientations={['portrait', 'landscape']}
    >
      {/* mounted only while open, so every opening starts with a fresh question */}
      {visible ? <GateBody onPass={onPass} onClose={onClose} /> : null}
    </Modal>
  );
}

function GateBody({ onPass, onClose }: { onPass: () => void; onClose: () => void }) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState(makeQuestion);
  const [input, setInput] = useState('');
  const [tries, setTries] = useState(0);
  const shake = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const keys = useMemo(() => ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'], []);

  const press = (k: string) => {
    tapFeedback();
    if (k === '⌫') return setInput((s) => s.slice(0, -1));
    if (k === 'OK') {
      if (Number(input) === q.answer) {
        onPass();
        return;
      }
      shake.set(withSequence(
        withTiming(-12, { duration: 50 }),
        withTiming(12, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withSpring(0),
      ));
      setInput('');
      if (tries + 1 >= 3) {
        onClose();
        return;
      }
      setTries(tries + 1);
      setQ(makeQuestion());
      return;
    }
    setInput((s) => (s.length < 3 ? s + k : s));
  };

  // short windows (phones in landscape): question and keypad side by side
  const compact = height < 520;
  const keyH = compact ? 44 : 54;
  return (
    <ScrollView
      style={styles.gateScroll}
      contentContainerStyle={[styles.gateScrollContent, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}
      bounces={false}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View style={[styles.gate, compact && styles.gateCompact, softShadow(12), shakeStyle]} testID="parent-gate">
        <Pressable onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel={t('close')} hitSlop={10}>
          <Icon name="close" size={34} color={C.pinkMid} />
        </Pressable>
        <View style={styles.gateInfo}>
          <Text style={styles.gateTitle} maxFontSizeMultiplier={TEXT_CAP}>{t('parent.gateTitle')}</Text>
          <Text style={styles.gateHint} maxFontSizeMultiplier={TEXT_CAP}>{t('parent.gateHint')}</Text>
          <Text style={styles.question} testID="gate-question" maxFontSizeMultiplier={TEXT_CAP}>
            {WORDS[q.a]} çarpı {WORDS[q.b]} kaç eder?
          </Text>
          <View style={styles.answer}>
            <Text style={styles.answerText} testID="gate-answer" maxFontSizeMultiplier={TEXT_CAP}>{input || ' '}</Text>
          </View>
        </View>
        <View style={[styles.pad, compact && { marginTop: 0, gap: 8 }]}>
          {keys.map((k) => (
            <Pressable
              key={k}
              onPress={() => press(k)}
              style={({ pressed }) => [styles.key, { height: keyH }, k === 'OK' && styles.keyOk, pressed && { transform: [{ scale: 0.92 }] }]}
              accessibilityRole="button"
              accessibilityLabel={k === '⌫' ? 'Sil' : k}
              testID={`gate-key-${k}`}
            >
              {k === '⌫' ? <Icon name="back" size={30} color="#fff" /> : <Text style={styles.keyText} maxFontSizeMultiplier={TEXT_CAP}>{k}</Text>}
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(78, 61, 99, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 36,
    padding: 26,
    alignItems: 'center',
    borderWidth: 5,
    borderColor: C.pink,
    minWidth: 260,
  },
  msg: { fontFamily: FONT.regular, fontSize: 16, color: C.ink, textAlign: 'center', marginTop: 10, maxWidth: 300 },
  row: { flexDirection: 'row', gap: 28, marginTop: 18 },
  gate: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 22,
    alignItems: 'center',
    width: 340,
    maxWidth: '100%',
    borderWidth: 5,
    borderColor: C.lilac,
  },
  close: { position: 'absolute', right: 10, top: 10, zIndex: 2 },
  gateScroll: { flex: 1, backgroundColor: 'rgba(78, 61, 99, 0.35)' },
  gateScrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  gateCompact: { flexDirection: 'row', width: 600, gap: 18, padding: 16, alignItems: 'center' },
  gateInfo: { alignItems: 'center', flexShrink: 1 },
  gateTitle: { fontFamily: FONT.black, fontSize: 24, color: C.ink },
  gateHint: { fontFamily: FONT.regular, fontSize: 14, color: C.inkSoft, marginTop: 4 },
  question: { fontFamily: FONT.bold, fontSize: 21, color: C.lilacDeep, marginTop: 14, textAlign: 'center' },
  answer: {
    marginTop: 12,
    minWidth: 120,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: C.lilac,
    alignItems: 'center',
  },
  answerText: { fontFamily: FONT.black, fontSize: 30, color: C.ink, letterSpacing: 4 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', width: 252, marginTop: 14, gap: 10, justifyContent: 'center' },
  key: {
    width: 74,
    height: 54,
    borderRadius: 18,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyOk: { backgroundColor: C.mintMid },
  keyText: { fontFamily: FONT.black, fontSize: 24, color: C.ink },
});
