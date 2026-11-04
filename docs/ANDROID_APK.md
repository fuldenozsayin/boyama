# Android'de Test: APK Oluşturma ve Kurulum

Bu belge, "Minik Renkler Dünyası"nı gerçek bir Android telefona yüklemenin üç
yolunu anlatır. Hepsi aynı kodu derler; hiçbir oyun özelliği çıkarılmaz ve
reklam entegrasyonu yoktur.

| Yol | Ne gerekir? | Ne zaman? |
| --- | --- | --- |
| **A. Hazır test APK'sı (GitHub)** | Hiçbir şey – sadece telefon | Hemen denemek için |
| **B. EAS Build** | Ücretsiz Expo hesabı | Expo'nun bulut derlemesi, ileride mağaza sürümü |
| **C. Yerel derleme** | Android SDK + JDK 17+ | Geliştirici bilgisayarında |

---

## A. Hazır test APK'sı (önerilen)

Depoya her kod değişikliği gönderildiğinde GitHub Actions
(`.github/workflows/android-apk.yml`) APK'yı otomatik derler ve "test-apk"
ön sürümüne koyar. Bağlantı hep en son derlemeyi gösterir:

- **Doğrudan APK:** https://github.com/fuldenozsayin/boyama/releases/download/test-apk/MinikRenklerDunyasi.apk
- **Sürüm sayfası:** https://github.com/fuldenozsayin/boyama/releases/tag/test-apk
- **Derleme geçmişi:** https://github.com/fuldenozsayin/boyama/actions/workflows/android-apk.yml

Depo herkese açık olduğu için indirmek için GitHub girişi gerekmez. Elle yeni
bir derleme başlatmak için: GitHub → **Actions** → **Android test APK** →
**Run workflow**.

APK; arm64-v8a ve armeabi-v7a işlemcileri destekler (son ~10 yılın neredeyse
tüm telefonları), Android 7.0 (API 24) ve üzerinde çalışır.

## Telefona kurulum

1. Telefonda **Chrome** ile yukarıdaki "Doğrudan APK" bağlantısını açın; dosya
   iner (~30–60 MB).
2. **İndirme bildirimine** dokunun. Daha önce indirdiyseniz Chrome yeni
   dosyayı `MinikRenklerDunyasi (1).apk` gibi bir adla kaydeder. Bu yüzden
   İndirilenler klasöründen değil, bildirimden açın ya da eski dosyayı
   silin.
3. "Güvenlik nedeniyle telefonunuz bu kaynaktan bilinmeyen uygulamaları
   yüklemenize izin vermiyor" uyarısında **Ayarlar → Bu kaynaktan izin ver**
   seçeneğini açıp geri dönün.
4. **Yükle**'ye dokunun. Google Play Protect "tanınmayan geliştirici"
   uyarısı gösterirse **Diğer ayrıntılar → Yine de yükle** deyin. Bu,
   mağaza dışı her test uygulamasında görülen normal bir uyarıdır.
5. Ana ekrandaki **Minik Renkler Dünyası** simgesiyle açın.

**Güncelleme:** Yeni APK'yı aynı şekilde indirip üzerine kurun. Boyamalar,
galeri ve çıkartmalar korunur.

**Hangi sürüm kurulu?** Her GitHub derlemesinin numarası artar (1.0.N).
Sürüm sayfasının başlığındaki numarayı, uygulamada **Ebeveyn Ayarları →
Sürüm** satırıyla karşılaştırın. Aynıysa en son derleme kuruludur.

**İmza notu:** GitHub test APK'sı Expo şablonunun test anahtarıyla
imzalanır. EAS ile derlenmiş bir APK'ya geçerken (ya da tersi) Android
"paket çakışıyor" der; önce eski uygulamayı kaldırmanız gerekir (bu,
cihazdaki boyamaları siler). GitHub derlemelerinin sürüm numarası EAS
derlemelerinden yüksek olduğu için de bu geçişte kaldırma gerekir.

Bilgisayardan USB ile kurmak isterseniz (geliştirici seçenekleri → USB hata
ayıklama açık):

```bash
adb install -r MinikRenklerDunyasi.apk
```

---

## B. EAS Build ile APK (kendi Expo hesabınızla)

`eas.json` içinde APK üreten **`preview`** profili hazırdır:
`distribution: internal`, `android.buildType: apk`. Mağaza için **`production`**
profili Play Store'un istediği AAB dosyasını üretir.

### Bir kez yapılacaklar

1. https://expo.dev/signup adresinden ücretsiz bir Expo hesabı açın.
2. Bilgisayarınızda Node.js 22 LTS (22.13 veya üstü) olsun. Expo SDK 58 bunu
   gerektirir. Projeyi indirip bağımlılıkları kurun (`npm install`, gerekli
   küçük yamayı `patches/` klasöründen otomatik uygular):

   ```bash
   git clone https://github.com/fuldenozsayin/boyama.git
   ```

   ```bash
   cd boyama && npm install
   ```

3. Expo hesabınıza giriş yapın:

   ```bash
   npx eas-cli@latest login
   ```

4. Projeyi hesabınıza bağlayın. Bu komut `app.json` içine
   `extra.eas.projectId` ekler; bu değişikliği commit'leyin:

   ```bash
   npx eas-cli@latest init
   ```

### APK derleme

```bash
npx eas-cli@latest build --platform android --profile preview
```

- `preview` profili yalnızca telefon işlemcileri için (arm64-v8a,
  armeabi-v7a) derler; APK, GitHub APK'sıyla aynı boyuttadır.
- İlk derlemede "Generate a new Android Keystore?" sorusuna **Yes** deyin.
  Anahtarı EAS saklar; sonraki derlemeler aynı imzayı kullanır.
- Derleme Expo'nun sunucularında yapılır. Ücretsiz planda kuyruk + derleme
  genellikle 15–30 dakika sürer ve aylık derleme hakkı sınırlıdır.
- Bitince terminalde bir **bağlantı ve QR kod** çıkar. Telefonla QR'ı okutup
  APK'yı indirin ve yukarıdaki adımlarla kurun. Derlemeler
  https://expo.dev → proje → **Builds** sayfasında da listelenir.

### İsteğe bağlı: EAS derlemesini GitHub'dan başlatmak

Expo hesabınızda **Access Token** oluşturup GitHub deposunda **Settings →
Secrets → Actions** altına `EXPO_TOKEN` adıyla eklerseniz, bir GitHub
Actions adımında `npx eas-cli@latest build --platform android --profile
preview --non-interactive` çalıştırılabilir. Bu, isteğe bağlıdır; A yolu
token gerektirmez.

### Mağaza sürümü (ileride)

```bash
npx eas-cli@latest build --platform android --profile production
```

Ardından `eas submit` ile Google Play Console'a gönderilebilir. Yayından önce
`app.json` içindeki `android.package` değerini (şu an
`com.minikrenkler.dunyasi`) kalıcı olarak belirleyin. Bu değer
yayınlandıktan sonra değiştirilemez.

---

## C. Yerel derleme

Gereken: JDK 17+ ve Android SDK (platform 37, build-tools 37.0.0,
NDK 27.1.12297006, CMake 3.22.1 – Android Studio kurulumu yeterlidir).

```bash
npx expo prebuild --platform android --clean
```

```bash
cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a
```

APK: `android/app/build/outputs/apk/release/app-release.apk`

`android/` klasörü her seferinde `app.json`'dan üretilir (Continuous Native
Generation); elle düzenlenmez ve depoya eklenmez.

---

## Expo Go ile hızlı deneme (APK'sız)

Kod üzerinde çalışırken en hızlı yol: bilgisayarda `npx expo start`, telefonda
**Expo Go** uygulaması ile QR kodu okutmak. APK ise uygulamanın son
kullanıcıdaki hâline en yakın sürümdür; performans, ses ve animasyon testleri
için APK'yı esas alın.
