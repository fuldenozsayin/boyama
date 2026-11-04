import Constants from 'expo-constants';
import React, { useState, useSyncExternalStore } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALL_PICTURES } from '../art';
import { STICKERS } from '../art/stickers';
import { BubbleButton } from '../components/ui/BubbleButton';
import { ConfirmDialog } from '../components/ui/Dialogs';
import { Icon } from '../components/ui/Icon';
import { PastelBackground } from '../components/ui/PastelBackground';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { t, type TKey } from '../i18n/tr';
import { deleteAllArt } from '../store/artStorage';
import { onStorageHealthChange, storageHasFailed } from '../store/storageHealth';
import { ownedStickerIds, useApp, type Settings } from '../store/useApp';
import { C, FONT, softShadow } from '../theme';

const ROWS: { key: keyof Settings; label: TKey }[] = [
  { key: 'sfx', label: 'parent.sfx' },
  { key: 'music', label: 'parent.music' },
  { key: 'voice', label: 'parent.voice' },
  { key: 'haptics', label: 'parent.haptics' },
  { key: 'leftHanded', label: 'parent.leftHanded' },
];

export default function Parents() {
  const insets = useSafeAreaInsets();
  const settings = useApp((s) => s.settings);
  const setSetting = useApp((s) => s.setSetting);
  const progress = useApp((s) => s.progress);
  const owned = useApp((s) => s.owned);
  const resetAll = useApp((s) => s.resetAll);
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const completed = ALL_PICTURES.filter((p) => progress[p.id]?.done).length;
  const storageFailed = useSyncExternalStore(onStorageHealthChange, storageHasFailed, storageHasFailed);

  return (
    <View style={styles.root}>
      <PastelBackground floaters={false} />
      <ScreenHeader title={t('parent.title')} />
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 30 }]}>
        {storageFailed && (
          <View style={[styles.card, styles.warn]} testID="storage-warning">
            <Text style={styles.h}>⚠︎</Text>
            <Text style={styles.p}>{t('parent.storageFull')}</Text>
          </View>
        )}
        <View style={[styles.card, softShadow(5)]}>
          {ROWS.map((r) => (
            <View key={r.key} style={styles.row}>
              <Text style={styles.label}>{t(r.label)}</Text>
              <Switch
                value={settings[r.key]}
                onValueChange={(v) => setSetting(r.key, v)}
                trackColor={{ true: C.mintDeep, false: '#DDD6E8' }}
                thumbColor="#fff"
                accessibilityLabel={t(r.label)}
                testID={`setting-${r.key}`}
              />
            </View>
          ))}
        </View>

        <View style={[styles.card, softShadow(5)]}>
          <Text style={styles.h}>{t('parent.stats')}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t('parent.completed')}</Text>
            <Text style={styles.value}>
              {completed} / {ALL_PICTURES.length}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t('parent.stickers')}</Text>
            <Text style={styles.value}>
              {ownedStickerIds(owned).length} / {STICKERS.length}
            </Text>
          </View>
        </View>

        <View style={[styles.card, softShadow(5)]}>
          <View style={styles.titleRow}>
            <Icon name="lock" size={30} color={C.mintMid} />
            <Text style={styles.h}>{t('parent.privacyTitle')}</Text>
          </View>
          <Text style={styles.p}>{t('parent.privacy')}</Text>
        </View>

        <View style={[styles.card, softShadow(5), styles.center]}>
          <BubbleButton a11y={t('parent.resetAll')} size={56} width={260} color={C.peachMid} label={t('parent.resetAll')} onPress={() => setConfirm(true)}>
            <Icon name="trash" size={30} color={C.pinkMid} />
          </BubbleButton>
          {done && <Text style={[styles.p, { marginTop: 10 }]}>{t('parent.resetDone')}</Text>}
        </View>

        <Text style={styles.version}>
          {t('appName')} · {t('parent.version')} {Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </ScrollView>

      <ConfirmDialog
        visible={confirm}
        icon="trash"
        message={t('parent.resetConfirm')}
        onNo={() => setConfirm(false)}
        onYes={async () => {
          setConfirm(false);
          resetAll();
          await deleteAllArt();
          setDone(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { padding: 16, gap: 16, alignItems: 'stretch', maxWidth: 640, width: '100%', alignSelf: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 18 },
  center: { alignItems: 'center' },
  warn: { backgroundColor: '#FFF1E6', borderWidth: 3, borderColor: C.peachDeep },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontFamily: FONT.regular, fontSize: 17, color: C.ink, flex: 1, paddingRight: 12 },
  value: { fontFamily: FONT.black, fontSize: 18, color: C.lilacDeep },
  h: { fontFamily: FONT.black, fontSize: 19, color: C.ink, marginBottom: 6 },
  p: { fontFamily: FONT.regular, fontSize: 15, color: C.inkSoft, lineHeight: 22 },
  version: { fontFamily: FONT.regular, fontSize: 13, color: C.inkSoft, textAlign: 'center' },
});
