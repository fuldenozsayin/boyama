# iPhone'da Test: TestFlight Kurulumu

Bu belge, "Minik Renkler Dünyası"nı **LumiFlow için kullandığınız Apple
Developer hesabıyla**, ama ondan tamamen **ayrı bir Bundle ID ve ayrı bir App
Store Connect uygulama kaydıyla** TestFlight üzerinden iPhone'unuza
yüklemenin adımlarını anlatır.

> **LumiFlow güvenliği:** Bu adımların hiçbiri LumiFlow'un uygulama kaydına,
> Bundle ID'sine, sertifikalarına ya da dosyalarına dokunmaz. Yeni Bundle ID
> yalnızca `com.minikrenkler.dunyasi`'dir. Hiçbir ekranda var olan bir
> sertifikayı **"Revoke" (iptal et)** etmeyin; bir hata görürseniz durup bana
> yazın.

## Durum

| Aşama | Kim | Durum |
| --- | --- | --- |
| iOS uyumluluk denetimi ve düzeltmeler | Claude | ✅ |
| iOS Simülatör'de gerçek derleme + otomatik arayüz testi | Claude | GitHub Actions → **iOS simulator build & UI test** |
| EAS/TestFlight yapılandırması (`eas.json`, `.github/workflows/ios-testflight.yml`, `scripts/ci/eas-ios-credentials.py`) | Claude | ✅ |
| Bundle ID + App Store Connect kaydı + API anahtarı + Expo hesabı | **Siz** (tarayıcıda) | ⏳ aşağıdaki 1–6. adımlar |
| İmzalı iOS derlemesi + TestFlight'a yükleme | Claude (siz "hazır" deyince) | ⏳ hesap erişimini bekliyor |
| iPhone'a kurulum | **Siz** | ⏳ 8. adım |

Şifrenizi, iki adımlı doğrulama kodunuzu ya da özel anahtar dosyanızı
**hiçbir zaman** bana yazmayın. Gerekli bilgileri yalnızca GitHub'ın
şifreli *Secrets* alanına siz eklersiniz; ben ve depo ziyaretçileri bu
değerleri göremeyiz, sadece derleme makinesi kullanır.

---

## 1. Apple Developer hesabı bilgileri (2 dk)

1. https://developer.apple.com/account adresine LumiFlow için kullandığınız
   Apple ID ile girin.
2. **Membership details** (Üyelik ayrıntıları) bölümünde şunları not edin:
   - **Team ID** (10 karakter, ör. `AB12CD34EF`)
   - **Entity type**: *Individual* ise `INDIVIDUAL`, şirket ise
     `COMPANY_OR_ORGANIZATION`
3. Üyeliğin aktif (yıllık ücreti ödenmiş) olduğunu kontrol edin.

## 2. Yeni Bundle ID oluşturun (2 dk)

1. https://developer.apple.com/account/resources/identifiers/list →
   **Identifiers** yanındaki **+**.
2. **App IDs** → **Continue** → **App** → **Continue**.
3. **Description:** `Minik Renkler Dunyasi`
   **Bundle ID:** *Explicit* → `com.minikrenkler.dunyasi`
4. Capabilities listesinde hiçbir şey işaretlemeyin → **Continue** →
   **Register**.

> LumiFlow'un Bundle ID'si listede kalır; ona dokunmayın.

## 3. App Store Connect'te ayrı uygulama kaydı (3 dk)

1. https://appstoreconnect.apple.com → **Uygulamalar (Apps)** → **+** →
   **Yeni Uygulama (New App)**.
2. Doldurun:
   - **Platform:** iOS
   - **Ad:** `Minik Renkler Dünyası` (alınmışsa sonuna ` - Boyama` ekleyin;
     bu ad sadece mağaza adıdır, uygulamadaki ad değişmez)
   - **Birincil dil:** Türkçe
   - **Bundle ID:** listeden `Minik Renkler Dunyasi - com.minikrenkler.dunyasi`
   - **SKU:** `minik-renkler-dunyasi`
   - **Kullanıcı Erişimi:** Tam Erişim
3. **Oluştur**. Ardından sol menüde **Uygulama Bilgileri (App Information)**
   → **Apple ID** satırındaki sayıyı not edin (ör. `6740000000`). Bu,
   `ASC_APP_ID` değeridir.

## 4. App Store Connect API anahtarı (3 dk)

Bu anahtar, derleme makinesinin sizin yerinize Minik Renkler Dünyası için
imza sertifikası ve profil hazırlamasını, derlemeyi TestFlight'a yüklemesini
ve iç test grubunu kurmasını sağlar. Apple ID şifrenize ve iki adımlı
doğrulamaya gerek kalmaz. Anahtarı istediğiniz an iptal edebilirsiniz.

1. App Store Connect → **Kullanıcılar ve Erişim (Users and Access)** →
   **Entegrasyonlar (Integrations)** → **App Store Connect API** →
   **Takım Anahtarları (Team Keys)**.
   (İlk kez açıyorsanız **Erişim İste (Request Access)** gerekebilir;
   bunu yalnızca hesap sahibi yapabilir.)
2. **+** (Anahtar Oluştur) → **Ad:** `Minik Renkler EAS` →
   **Erişim:** `Admin` (sertifika ve profil oluşturmak için gerekir) →
   **Oluştur**.
3. **API Anahtarını İndir** → `AuthKey_XXXXXXXXXX.p8` dosyası iner.
   **Bu dosya yalnızca bir kez indirilebilir; güvenli bir yerde saklayın.**
4. Not edin:
   - **Key ID** (anahtar satırındaki kimlik, ör. `2X9R4HXF34`)
   - **Issuer ID** (listenin üstündeki UUID)

## 5. Expo hesabı ve erişim anahtarı (3 dk)

1. https://expo.dev/signup adresinden ücretsiz hesap açın (varsa giriş
   yapın).
2. Sağ üstteki profil → **Account settings** → **Access tokens** →
   **Create token** → ad: `github-minik-renkler` → oluşan değeri kopyalayın
   (yalnızca bir kez gösterilir).

> Expo projesi ilk derlemede otomatik oluşturulur (`minik-renkler-dunyasi`).

## 6. Değerleri GitHub Secrets'a ekleyin (5 dk)

https://github.com/fuldenozsayin/boyama/settings/secrets/actions →
**New repository secret** ile her birini ayrı ayrı ekleyin:

| Secret adı | Değer |
| --- | --- |
| `EXPO_TOKEN` | 5. adımdaki Expo erişim anahtarı |
| `ASC_API_KEY_P8` | `.p8` dosyasının **tüm içeriği** (bir metin düzenleyiciyle açın; `-----BEGIN PRIVATE KEY-----` ve `-----END PRIVATE KEY-----` satırları dahil) |
| `ASC_API_KEY_ID` | Key ID |
| `ASC_API_ISSUER_ID` | Issuer ID |
| `APPLE_TEAM_ID` | Team ID |
| `APPLE_TEAM_TYPE` | `INDIVIDUAL` ya da `COMPANY_OR_ORGANIZATION` |
| `ASC_APP_ID` | 3. adımdaki Apple ID sayısı |

Bitince bana yalnızca **"secret'lar hazır"** yazın. Değerleri yazmayın.

## 7. İmzalı derleme ve TestFlight'a yükleme (Claude)

Siz "hazır" dediğinizde GitHub Actions'ta **iOS TestFlight** iş akışını
başlatırım (isterseniz siz de başlatabilirsiniz: **Actions → iOS TestFlight
→ Run workflow**). İş akışı:

1. Kodun lint, tür ve birim testlerini çalıştırır.
2. Expo projesini oluşturur/bağlar.
3. **İmza (yalnızca ilk çalıştırmada):**
   - Bu Expo hesabında daha önceki EAS derlemelerinden kalma geçerli bir
     Apple dağıtım sertifikası (Apple Distribution Certificate) varsa onu
     **yeniden kullanır**. Bu sertifikalar uygulamaya özel değildir; yeniden
     kullanmak LumiFlow'da hiçbir şeyi değiştirmez. (Xcode ile oluşturulmuş
     sertifikalar yeniden kullanılamaz, çünkü özel anahtarları yalnızca o
     bilgisayardadır.)
   - Yoksa ekibinizde **bir** yeni dağıtım sertifikası oluşturur. Apple bir
     ekipte en fazla 3 dağıtım sertifikasına izin verir; yeni sertifika
     bunlardan birini kullanır. Mevcut sertifikalar (LumiFlow'unkiler dahil)
     değiştirilmez ve iptal edilmez.
   - Yalnızca `com.minikrenkler.dunyasi` için bir App Store provisioning
     profile oluşturur.
   - Bu adım yalnızca bu güvenli sorulara "evet" der; başka bir soru
     çıkarsa durur. Sonraki çalıştırmalar kayıtlı imzayı kullanır.
4. Expo'nun macOS sunucusunda **imzalı** iOS derlemesini yapar
   (`distribution: store`). Kuyruk ve derleme genellikle 20–45 dakika sürer.
5. Derlemeyi App Store Connect'e yükler. Ardından iç test (Internal Testing)
   grubunu kurar, hesabınızdaki kişileri test eden olarak ekler ve derlemeyi
   gruba verir.

Apple işlemeyi bitirince (genellikle 10–30 dk) "build has completed
processing" e-postası gelir.

**Olası hata:** Apple, bir ekipte en fazla 3 dağıtım sertifikasına izin
verir. Sınır doluysa ve Expo hesabında kullanılabilir bir sertifika yoksa,
iş akışı "sertifika sınırına ulaşıldı" hatasıyla **iptal sorusundan önce
durur**. Hesabınızdaki mevcut (LumiFlow) sertifikalar **iptal edilmez**.
Bu durumda size yazarım ve ne yapılacağını birlikte seçeriz.

## 8. iPhone'a kurulum (5 dk)

1. iPhone'da App Store'dan **TestFlight** uygulamasını kurun.
2. App Store Connect → **Minik Renkler Dünyası** → **TestFlight** → sol
   menüde **İç Test (Internal Testing)** altındaki grubu açın (iş akışı
   otomatik oluşturur). Grupta kendi e-postanız yoksa **Test Edenler
   (Testers)** yanındaki **+** ile kendinizi ekleyin ve derlemenin gruba
   eklendiğini kontrol edin.
   Grup yoksa: **İç Test** yanındaki **+** → bir ad verin (ör. `Aile`) →
   kendinizi ekleyin → **Derlemeler (Builds)** sekmesinde **+** ile
   derlemeyi ekleyin.
3. Gelen davet e-postasındaki **View in TestFlight** bağlantısını iPhone'da
   açın (ya da TestFlight uygulamasına aynı Apple ID ile girin).
4. TestFlight'ta **Minik Renkler Dünyası** → **Yükle (Install)**. Ana
   ekranda simgenin altında kısa ad **Minik Renkler** görünür (uzun ad
   iPhone'da kesileceği için).
5. Uygulamayı açın. **Ebeveyn Ayarları → Sürüm** satırı `1.0.0` gösterir;
   hangi derlemenin kurulu olduğunu TestFlight'taki derleme numarası
   (ör. `1.0.0 (3)`) gösterir.
6. Test listesi: [`docs/TEST_LISTESI_IOS.md`](TEST_LISTESI_IOS.md).

TestFlight derlemeleri 90 gün geçerlidir. Yeni bir derleme yüklendiğinde
TestFlight uygulaması güncellemeyi gösterir; boyamalarınız korunur.

---

## Alternatif: tek komutla kendi bilgisayarınızdan

GitHub Secrets kullanmak istemezseniz, Node.js 22 kurulu bir bilgisayarda
(Mac, Windows ya da Linux):

```bash
git clone https://github.com/fuldenozsayin/boyama.git
```

```bash
cd boyama
```

```bash
npm install
```

```bash
npx testflight
```

Komut sizi adım adım yönlendirir: Expo'ya giriş, Bundle ID onayı
(`com.minikrenkler.dunyasi`), Apple ID ile giriş ve **iPhone'unuza gelen
iki adımlı doğrulama kodu**, sertifika oluşturma, derleme ve TestFlight'a
yükleme. Sertifika sorusunda var olan sertifikayı **yeniden kullanmayı**
(Reuse) ya da **yeni oluşturmayı** seçin. Herhangi bir sertifikayı iptal
etmeyi (revoke) önerirse hiçbirini seçmeyin; işlemi durdurup bana yazın.

## Reklam

TestFlight sürümünde reklam yoktur; projede reklam ya da izleme kütüphanesi
bulunmuyor (`NSPrivacyTracking: false`).
