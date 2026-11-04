/**
 * Turkish strings. Kids can't read yet, so text is kept minimal and mostly
 * used for spoken guidance and the parents' area. Add a sibling file (en.ts)
 * with the same keys to localise.
 */
export const tr = {
  appName: 'Minik Renkler Dünyası',

  // spoken guidance (voice prompts)
  'voice.welcome': 'Minik Renkler Dünyasına hoş geldin!',
  'voice.pickCategory': 'Hangi resmi boyamak istersin?',
  'voice.pickPicture': 'Bir resim seç!',
  'voice.startColoring': 'Bir renk seç, sonra resme dokun!',
  'voice.brush': 'Fırçayla çizebilirsin!',
  'voice.eraser': 'Silgi! Dokunduğun yeri temizler.',
  'voice.magic': 'Sihirli boyalar!',
  'voice.sticker': 'Çıkartmanı resme yapıştır!',
  'voice.almost': 'Biraz daha boyayalım!',
  'voice.great1': 'Harika!',
  'voice.great2': 'Çok güzel!',
  'voice.great3': 'Süpersin!',
  'voice.done': 'Tebrikler! Resmin tamamlandı!',
  'voice.newSticker': 'Yeni bir çıkartma kazandın!',
  'voice.gallery': 'Bu senin galerin!',
  'voice.stickerBook': 'Bu senin çıkartma kitabın!',
  'voice.freeDraw': 'Serbest çizim zamanı!',
  'voice.reset': 'Sayfayı temizleyelim mi?',

  // parents' area
  'parent.gateTitle': 'Ebeveyn Kapısı',
  'parent.gateHint': 'Devam etmek için soruyu yanıtlayın',
  'parent.title': 'Ebeveyn Ayarları',
  'parent.sfx': 'Ses efektleri',
  'parent.music': 'Müzik',
  'parent.voice': 'Sesli rehber',
  'parent.haptics': 'Titreşim',
  'parent.leftHanded': 'Solak düzeni (araçlar solda)',
  'parent.resetAll': 'Tüm ilerlemeyi sil',
  'parent.resetConfirm': 'Tüm resimler, galeri ve çıkartmalar silinecek. Emin misiniz?',
  'parent.resetDone': 'Tüm ilerleme silindi.',
  'parent.storageFull':
    'Son çizimler kaydedilemedi. Cihazda yer kalmamış olabilir; biraz yer açtıktan sonra uygulamayı yeniden başlatın.',
  'parent.privacyTitle': 'Gizlilik ve Güvenlik',
  'parent.privacy':
    'Bu uygulama reklam, uygulama içi satın alma, sohbet veya internet bağlantısı içermez. Hiçbir kişisel veri toplanmaz ya da paylaşılmaz. Çocuğunuzun resimleri yalnızca bu cihazda saklanır.',
  'parent.stats': 'İstatistikler',
  'parent.completed': 'Tamamlanan resim',
  'parent.stickers': 'Toplanan çıkartma',
  'parent.version': 'Sürüm',
  yes: 'Evet',
  no: 'Vazgeç',
  delete: 'Sil',
  close: 'Kapat',
} as const;

export type TKey = keyof typeof tr;

export function t(key: TKey): string {
  return tr[key];
}
