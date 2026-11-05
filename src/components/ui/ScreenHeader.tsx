import { router } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sound } from '../../audio/sound';
import { C, FONT, TEXT_CAP } from '../../theme';
import { BubbleButton } from './BubbleButton';
import { Icon, type IconName } from './Icon';

/** Back button + a picture/title for screens below the home screen. */
export function ScreenHeader({
  title,
  icon,
  iconColor,
  right,
  backTo,
}: {
  title?: string;
  icon?: IconName;
  iconColor?: string;
  right?: React.ReactNode;
  backTo?: '/' | '/categories';
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8, paddingLeft: insets.left + 14, paddingRight: insets.right + 14 }]}>
      <BubbleButton
        a11y="Geri"
        size={60}
        color={C.pinkMid}
        onPress={() => {
          sound.play('whoosh');
          if (router.canGoBack()) router.back();
          else router.replace(backTo ?? '/');
        }}
        testID="back"
      >
        <Icon name="back" size={40} />
      </BubbleButton>
      <View style={styles.center}>
        {icon ? <Icon name={icon} size={44} color={iconColor} accent={C.pinkMid} /> : null}
        {title ? (
          <Text style={[styles.title, Platform.OS === 'ios' ? styles.titleIos : styles.titleLine]} numberOfLines={2} maxFontSizeMultiplier={TEXT_CAP}>
            {title}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingBottom: 6 },
  center: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 8 },
  title: {
    fontFamily: FONT.black,
    fontSize: 21,
    textAlign: 'center',
    color: C.ink,
    textShadowColor: '#fff',
    textShadowRadius: 8,
    flexShrink: 1,
  },
  titleLine: { lineHeight: 25 },
  // iOS keeps the font's natural line height (a tighter one clips the dots of
  // Ö/Ü/ğ/i) and only draws a text shadow when an offset is set
  titleIos: { textShadowOffset: { width: 0, height: 0 } },
  right: { minWidth: 60, alignItems: 'flex-end' },
});
