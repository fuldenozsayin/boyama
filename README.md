# Minik Renkler Dünyası 🎨

3–7 yaş arası çocuklar için reklamsız, çevrimdışı çalışan, sevimli ve gerçekten
çalışan bir boyama oyunu. **Expo SDK 58 + React Native + react-native-svg** ile
iOS, Android (telefon ve tablet) ve web için tek kod tabanı.

## Neler var?

| Alan | İçerik |
| --- | --- |
| Kategoriler | Prensesler ve Şatolar · Unicornlar ve Gökkuşakları · Kediler, Köpekler ve Tavşanlar · Periler ve Sihirli Ormanlar · Deniz Kızları ve Deniz Dünyası · Kelebekler ve Çiçekler |
| Resimler | **30 özgün boyama sayfası** (kategori başına 5, kolaydan zora: ~20 → ~40 bölge) |
| Boyama | Kapalı alana dokun-doldur, çizgi dışına taşmayan fırça (başladığı bölgeye kırpılır), silgi (sürükle: fırçayı siler · dokun: alanı temizler), 3 fırça kalınlığı, geri al / ileri al (60 adım), sayfayı temizle (o da geri alınabilir), iki parmakla yakınlaştırma |
| Sihirli boyalar | Simli, gökkuşağı, puantiyeli, yıldızlı, kalpli, çizgili — hem kova hem fırça ile |
| Serbest çizim | Boş sayfa; bitince galeriye yeni eser olarak kaydedilir |
| İpucu | 💡 düğmesi henüz boyanmamış en büyük alanı parlatır |
| Kutlama | Resim bitince karakterler canlanır: unicorn göz kırpar, kedinin kuyruğu sallanır ve miyavlar, kelebek kanat çırpar, prensesin etrafında pırıltılar… + kategoriye özel parçacıklar (yıldız, kalp, baloncuk, yaprak) |
| Ödüller | Kişisel galeri, 24 özgün çıkartma, çıkartma kitabı, çıkartmalarla resim süsleme (yerleştir, sürükle, silgiyle kaldır) |
| Ses | Tamamen özgün, kodla sentezlenmiş efektler: pentatonik "bloop" dolgu sesleri, fırça / sim / silgi döngüleri, kutlama, miyav, hav, boing, baloncuk… ve kutu müziği döngüsü |
| Sesli rehber | Cihazın çevrimdışı Türkçe sesiyle yönlendirme; kayıtlı seslendirme eklemeye hazır mimari |
| Güvenlik | Reklam yok, satın alma yok, sohbet / internet içeriği yok, veri toplama yok, mikrofon vb. izin yok, ebeveyn kapısı (yazıyla çarpma sorusu) |

## Çalıştırma

```bash
npm install
```

```bash
npx expo start
```

- **Telefon/tablet:** Expo Go uygulamasıyla QR kodu okutun. Kullanılan tüm yerel modüller Expo Go'da hazır bulunur.
- **Web:** terminalde `w` tuşuna basın ya da `npx expo start --web`.

Mağaza derlemesi (EAS):

```bash
npx eas-cli@latest build --profile production --platform all
```

## Doğrulama komutları

```bash
npm run typecheck
```

```bash
npm test
```

```bash
npx expo export --platform web && npx tsx scripts/smoke-web.ts
```

`smoke-web.ts` gerçek fare/dokunma olaylarıyla oyunu oynar: dokunarak boyar,
komşu alanın boyanmadığını ve fırçanın çizgi dışına taşmadığını piksel
okuyarak kontrol eder, geri al / silgi / otomatik kaydetme / yeniden yükleme,
bir sayfanın tüm bölgelerini boyayıp kutlamanın ve ödülün açılmasını,
serbest çizimin galeriye düşmesini ve ebeveyn kapısını test eder.
`--landscape` ile tablet yatay düzeni test edilir.

## Proje yapısı

```
src/
  app/                    Expo Router ekranları
    index.tsx             Ana menü (maskot Pıtırcık, oyna, serbest çizim, galeri, çıkartmalar, ebeveyn kilidi)
    categories.tsx        Kategori kartları
    category/[id].tsx     Kategorinin resimleri (ilerleme / tamamlandı yıldızı)
    color/[id].tsx        Boyama ekranı (resim id'si, "free" = serbest çizim)
    gallery.tsx           Galeri + büyük görüntüleyici (canlandır / devam et / ebeveynle sil)
    stickers.tsx          Çıkartma kitabı
    parents.tsx           Ebeveyn ayarları (yalnızca ebeveyn kapısından)
  art/
    dsl.ts                Kodla çizim dili (circle, smooth, star, heart, cloud, scallop, cuteEye…)
    types.ts              Resim / bölge / animasyon parçası veri modeli
    pictures/<kategori>/  30 boyama sayfası + kapak seçimi
    stickers.ts           24 çıkartma
    qa.ts                 Sanat kalite kontrolü (gizli / çok küçük bölge, eksik parça…)
  engine/
    path.ts               SVG path ayrıştırma, düzleştirme, nokta-çokgen testi
    compile.ts            Resmi bir kez derleyip dokunulan bölgeyi bulma (z-sırası)
    paint.ts              Boya durumu, geri al/ileri al geçmişi, kaydetme biçimi
    paints.tsx            Sim / gökkuşağı / desen tanımları
    anim.ts               Kutlama animasyon matematiği (göz kırpma, sallanma, kanat çırpma…)
  components/
    art/ArtSvg.tsx        Tek render motoru (tuval, küçük resimler, galeri, kutlama, kapaklar)
    canvas/               Etkileşimli tuval (jestler, yakınlaştırma) ve palet
    celebration/          Kutlama katmanı ve parçacıklar
    ui/                   Baloncuk düğmeler, ikon seti, maskot, diyaloglar, ebeveyn kapısı
  audio/                  Ses motoru ve sesli rehber
  store/                  Kalıcı uygulama durumu (zustand + AsyncStorage) ve eser depolama
scripts/
  art-preview.ts          Resimleri PNG'ye çizer + QA raporu (çizgi / önerilen renk / bölge haritası)
  generate-sounds.ts      Tüm ses efektlerini ve müziği sentezler
  generate-icons.ts       Uygulama ikonu, uyarlanabilir ikon, açılış görseli
  smoke-web.ts            Uçtan uca test
docs/ART_GUIDE.md         Yeni resim çizme rehberi
```

## Boyama motoru nasıl çalışır?

- Her resim, 1000×1000'lik tuvalde **üst üste dizilmiş kapalı şekillerden**
  (bölgeler) ve boyanmayan süslerden (göz bebekleri, yanaklar, bıyıklar)
  oluşur. Üstteki şekil alttakinin çizgisini doğal olarak örter.
- Dokunulan nokta, derlenmiş çokgenler üzerinde yukarıdan aşağı test edilir
  ve yalnızca o bölge boyanır: **renk asla taşmaz**, piksel tabanlı flood-fill
  olmadığı için her ekran çözünürlüğünde aynı ve anlık çalışır.
- Fırça darbesi başladığı bölgenin şekliyle kırpılır (SVG `clipPath`) ve o
  bölgenin katmanında çizilir; böylece çizgilerin ve üstteki şekillerin
  altında kalır.
- Durum değişmez (immutable) nesnelerle tutulur; her bölge yalnızca kendi
  verisi değişince yeniden çizilir. Çizilmekte olan fırça darbesi ayrı küçük
  bir bileşende, kare başına bir kez güncellenir.
- İlerleme 450 ms gecikmeyle otomatik kaydedilir; uygulama arka plana
  geçince hemen yazılır.

## Yeni resim eklemek

1. `docs/ART_GUIDE.md` dosyasını okuyun.
2. `src/art/pictures/<kategori>/` içine yeni dosya ekleyip `index.ts`
   listesine koyun.
3. `npx tsx scripts/art-preview.ts <kategori> <resimId> --anim` ile
   önizleyin; sıfır hata/uyarı hedefleyin. `npm test` tüm resimleri otomatik
   denetler.

## Mağaza yayını için notlar

- `app.json` içindeki `ios.bundleIdentifier` / `android.package`
  (`com.minikrenkler.dunyasi`) değerlerini kendi hesabınıza göre değiştirin.
- **Gizlilik:** uygulama veri toplamaz; App Store "Data Not Collected",
  Google Play "Veri güvenliği: veri toplanmaz / paylaşılmaz" beyanı
  yapılabilir. iOS gizlilik manifesti `app.json` içinde boş (takip yok)
  olarak tanımlıdır. Mağazalar yine de bir gizlilik politikası URL'si ister.
- **Çocuk kategorileri:** App Store Kids (5 yaş ve altı / 6–8) ve Google Play
  "Ailelere Yönelik" programı için gerekenler mevcut: reklam yok, satın alma
  yok, dış bağlantı yok, ebeveyn kapısı var.
- **İzinler:** mikrofon, arka plan ses servisi ve depolama izinleri
  `blockedPermissions` ile kapatıldı. Titreşim için yalnızca normal
  (sorulmayan) izin kullanılır.

## Bilinen kısıtlar ve alternatifler

- **Gerçek cihaz testi:** bu sürüm web üzerinde gerçek işaretçi olaylarıyla,
  tür kontrolü ve birim testleriyle doğrulandı. Dokunmatik jestler, ses ve
  titreşim için Expo Go ile fiziksel iOS ve Android cihazlarda kısa bir
  test turu önerilir.
- **Sesler** kodla sentezlendi (lisans sorunu yok). Daha zengin bir his için
  bir ses tasarımcısının kayıtları `assets/sounds/` içindeki aynı adlı
  dosyaların yerine konabilir.
- **Sesli rehber** cihazın metin-okuma sesini kullanır. Android'de Türkçe
  ses paketi yüklü değilse rehber sessiz kalır, anlamsız okuma yapmaz.
  Profesyonel seslendirme `src/audio/voice.ts` içindeki `RECORDED`
  tablosuna dosya ekleyerek, ekran kodu değişmeden devreye alınır.
- **Depolama:** eserler AsyncStorage'da saklanır. Android'de varsayılan
  sınır ~6 MB'tır ve yüzlerce eser için yeterlidir. Çok yoğun kullanımda
  `expo-sqlite` ya da `expo-file-system` tabanlı depolamaya geçilebilir.
  Arayüz `src/store/artStorage.ts` içinde tek yerdedir.
- **Fotoğraflara kaydetme / paylaşma** bilinçli olarak eklenmedi: izin ve
  dış paylaşım gerektirir. İstenirse ebeveyn kapısının arkasına konulabilir.
