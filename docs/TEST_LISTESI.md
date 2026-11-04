# Gerçek Telefonda Test Listesi

APK'yı kurduktan sonra bu listeyi sırayla deneyin. Her maddede **beklenen
davranış** yazıyor. Farklı bir şey görürseniz maddenin numarasını, telefon
modelini ve Android sürümünü not edin. Mümkünse ekran görüntüsü ya da kısa
bir video alın.

**Cihaz bilgisi:** Telefon modeli: ______ · Android sürümü: ______ ·
Ekran boyu: ______ · Tablet mi? ☐

> İpucu: Oyunun sesleri telefonun **medya sesine** bağlıdır. Ses tuşlarıyla
> medya sesini açın. Android'de telefon titreşim/sessiz modundayken de oyun
> sesleri çalar.

---

## 1. Kurulum ve açılış

- [ ] 1.1 APK sorunsuz kuruluyor; ana ekranda pembe damla (Pıtırcık) simgeli **Minik Renkler Dünyası** uygulaması görünüyor.
- [ ] 1.2 Açılışta pembe zeminde fırçalı, pırıltılı maskot (Pıtırcık) görünüyor, ardından ana menü 1–3 saniyede açılıyor.
- [ ] 1.3 Durum çubuğu gizli; üstte saat/pil simgeleri oyunun üstüne binmiyor.
- [ ] 1.3b Türkçe harfler (Ş, ğ, İ, ı: "Prensesler ve Şatolar", "Gökkuşakları") başlıklardaki yuvarlak yazı tipiyle aynı görünüyor.
- [ ] 1.4 Alt gezinme çubuğu (3 tuşlu ya da hareketle gezinme) düğmelerin üstüne binmiyor.
- [ ] 1.5 Uygulama ilk açılışta **hiçbir izin istemiyor** (mikrofon, konum, depolama vb.).
- [ ] 1.6 Uçak modunda da tamamen çalışıyor (internet gerekmiyor).
- [ ] 1.7 **Ebeveyn Ayarları**'nın en altındaki **Sürüm** satırı, indirdiğiniz sürüm sayfasının başlığındaki numarayla (1.0.N) aynı. Bu yalnızca GitHub APK'sı için geçerlidir; EAS derlemesi 1.0.0 gösterir.
- [ ] 1.8 **Güncelleme:** Bir resim boyayıp çıkartma kazanın. Sonra yeni bir APK'yı eskisini kaldırmadan üzerine kurun: boyamalar, galeri, çıkartmalar ve ayarlar duruyor, sürüm numarası artmış.

## 2. Ana menü

- [ ] 2.1 Başlık harfleri renkli ve hafifçe dalgalanıyor; bulutlar/yıldızlar yavaşça süzülüyor.
- [ ] 2.2 Maskot hafifçe yüzüyor ve birkaç saniyede bir göz kırpıyor.
- [ ] 2.3 Büyük ▶ düğmesi nabız gibi atıyor; dokununca kategoriler açılıyor.
- [ ] 2.4 Palet (serbest çizim), çerçeve (galeri) ve kitap (çıkartmalar) düğmeleri doğru ekranları açıyor.
- [ ] 2.5 Her düğmeye basınca yumuşak bir "tık" sesi ve hafif titreşim var; düğme yaylanarak küçülüp büyüyor.
- [ ] 2.6 Sol üstteki hoparlör düğmesi efektleri, müziği ve sesli rehberi birlikte kapatıp açıyor; simge değişiyor.
- [ ] 2.7 Arka planda kısa, yumuşak bir kutu müziği çalıyor ve döngü geçişinde "tık" duyulmuyor.
- [ ] 2.7b Telefon titreşim moduna alınınca ses efektleri ve müzik devam ediyor. Kulaklık takılıyken çıkarılırsa müzik durabilir; bir sonraki dokunuşta yeniden başlıyor.
- [ ] 2.8 Sesli rehber açılışta "Minik Renkler Dünyasına hoş geldin!" diyor. Telefonda Türkçe ses yoksa sessiz kalması normaldir; bkz. 9.5.
- [ ] 2.9 Telefonun **Geri** tuşu/hareketi ana menüde uygulamadan çıkıyor.
- [ ] 2.10 Ana ekran tuşuyla uygulamadan çıkınca müzik ve sesler susuyor; geri dönünce müzik devam ediyor.

## 3. Kategoriler ve resim seçimi

- [ ] 3.1 Altı kategori kartı kapak çizimleriyle görünüyor: prenses, unicorn, kedi, peri, deniz kızı, kelebek.
- [ ] 3.2 Kart altındaki 5 yıldız, o kategoride tamamlanan resim sayısını gösteriyor.
- [ ] 3.3 Kategoriye girince 5 resim kolaydan zora sıralı. Yarım kalanlarda ilerleme çubuğu, bitenlerde sarı yıldız var.
- [ ] 3.4 Geri tuşu bir önceki ekrana dönüyor.

## 4. Boyama motoru (en önemli bölüm)

Her kategoriden en az bir resimle deneyin.

- [ ] 4.1 **Dokun-doldur:** Kova seçiliyken bir alana dokununca yalnızca o alan anında boyanıyor; komşu alanlara ve çizgilerin dışına taşmıyor.
- [ ] 4.2 Çok küçük alanlar (göz beyazı, yanak çevresi, çiçek ortası) parmakla rahatça boyanabiliyor.
- [ ] 4.3 Her boyamada kısa, müzikal bir "bloop" sesi ve hafif titreşim var. Peş peşe hızlı dokunuşlarda sesler takılmıyor.
- [ ] 4.4 **Fırça:** Fırça seçip parmağı sürükleyin. Çizgi parmağı gecikmeden takip ediyor ve **başladığı alanın dışına çıkmıyor** (komşu alana ya da çizgilerin üstüne taşmıyor).
- [ ] 4.5 Fırça kalınlığı (3 nokta) değişiyor; tek dokunuş küçük bir nokta bırakıyor.
- [ ] 4.6 Fırçayla çizerken hafif bir "fırça hışırtısı" sesi çalıyor ve parmak kalkınca duruyor.
- [ ] 4.7 **Silgi – sürükleme:** Fırça izlerini siliyor ve altındaki dolgu rengini geri getiriyor.
- [ ] 4.8 **Silgi – dokunma:** Dokunulan alanı tamamen temizliyor (beyaza dönüyor).
- [ ] 4.9 **Geri al / İleri al:** Son işlemleri sırayla geri alıp yeniden yapıyor; düğmeler yapılacak işlem yokken soluk.
- [ ] 4.10 **Çöp kutusu** (dikey ekranda kova seçiliyken görünür): Onay penceresi (✓ / ✗) açılıyor. ✓ sayfayı temizliyor, Geri al ile her şey geri geliyor.
- [ ] 4.11 **Sihirli boyalar:** Simli, gökkuşağı, puantiye, yıldız, kalp ve çizgili desenler hem kovayla hem fırçayla düzgün görünüyor. Kenarlarda kesik ya da kaymış desen yok.
- [ ] 4.12 Renk paleti dikey ekranda yatay, yatay ekranda dikey kayıyor; seçili renk büyüyüp beyaz halkayla belirginleşiyor.
- [ ] 4.13 **İki parmakla yakınlaştırma:** Resim büyüyor; bırakınca çizgiler yaklaşık 2 kata kadar keskin kalıyor (en yakında hafif yumuşama normaldir). Yakınlaştırırken **hiçbir alan kendiliğinden boyanmıyor**.
- [ ] 4.14 Yakınken iki parmakla kaydırma çalışıyor; tek parmak boyamaya devam ediyor. Sağ üstteki büyüteç tam görünüme dönüyor.
- [ ] 4.14b Yakınlaştırırken parmaklardan birini önce kaldırınca resim zıplamıyor. İki parmakla aynı anda dokunmak hiçbir alanı boyamıyor.
- [ ] 4.14c Tuvalin kenarına yakın başlayıp ekran kenarına doğru kayan bir boyama hareketi boyama ekranını kapatmıyor. Ekranın en kenarından bilinçli yapılan geri hareketi ise boyamayı kaydedip bir önceki ekrana dönüyor.
- [ ] 4.14d Yakınlaştırılmışken Geri önce yakınlaştırmayı sıfırlıyor; ikinci Geri ekrandan çıkıyor.
- [ ] 4.15 **İpucu (ampul):** Henüz boyanmamış bir alan birkaç kez sarı parlıyor. Dikey ekranda ampul kova seçiliyken görünür.
- [ ] 4.16 İlerleme çubuğu (dikey ekranda üstte, yatay ekranda renklerin üstünde) boyadıkça doluyor.
- [ ] 4.17 Alanların yarısından azı boyanmışken ✓ (bitti) düğmesine basınca çubuk sallanıyor, ipucu gösteriliyor ve "Biraz daha boyayalım!" deniyor.
- [ ] 4.18 Yarıdan fazlası boyanınca ✓ yeşile dönüp atmaya başlıyor; basınca kutlama açılıyor ve resim tamamlanmış sayılıyor (kategoride yıldız, galeride resim, ilk seferde çıkartma).

## 5. Çıkartmalar

- [ ] 5.1 Yıldız simgeli araçta sahip olunan çıkartmalar listeleniyor (başlangıçta 4 tane: yıldız, kalp, gökkuşağı, çiçek).
- [ ] 5.2 Resme dokununca seçili çıkartma "pop" sesiyle yapışıyor; beyaz kenarlıklı ve gölgeli görünüyor.
- [ ] 5.3 Yapıştırılmış çıkartma çıkartma aracıyla sürüklenip taşınabiliyor.
- [ ] 5.4 Silgiyle çıkartmaya dokununca kaldırılıyor; Geri al geri getiriyor.

## 6. Tamamlama ve kutlama animasyonları

Her kategoriden birer resmi **tamamen** boyayın. Son alan boyanınca kutlama
kendiliğinden başlamalı. Karakter hareketleri sayfaya göre değişir; aşağıdaki
maddeler için önerilen sayfalar parantez içinde.

- [ ] 6.1 Resim çerçeveli olarak büyüyerek ortaya çıkıyor; konfeti/parıltılar uçuşuyor ve kutlama müziği çalıyor.
- [ ] 6.2 **Unicorn** (Gökkuşağı Tepesi): Göz kırpıyor, yıldızlar parlıyor, kuyruk sallanıyor. Sihir sesi çalıyor.
- [ ] 6.3 **Kedi** (Yumaklı Kedicik): Kuyruğunu sallıyor ve **miyavlıyor**. Kalpler uçuşuyor. (Bahçedeki Köpekçik: kuyruk + "hav"; Tavşan Ailesi: kulaklar + "boing".)
- [ ] 6.4 **Kelebek** (Gülen Kelebek): Kanatlarını çırpıyor; çiçek yaprakları süzülüyor.
- [ ] 6.5 **Prenses** (Gülümseyen Prenses): Etrafında pırıltılar beliriyor; taç ve yıldızlar parlıyor.
- [ ] 6.6 **Peri** (Çiçek Taçlı Peri): Kanatları çırpıyor. **Deniz kızı** (İstiridye Tahtı): Kuyruğu sallanıyor, baloncuklar yükseliyor.
- [ ] 6.7 Animasyonlar akıcı (takılma ya da donma yok). Kutlama sırasında telefon aşırı ısınmıyor.
- [ ] 6.8 İlk tamamlamada "Yeni çıkartma!" kartı dönerek beliriyor. Aynı resmi tekrar bitirince ya da galeriden açıp ✓'ye basınca yeni çıkartma verilmiyor.
- [ ] 6.8b Yaklaşık 8 saniye sonra karakter hareketi durup düzgün duruşuna dönüyor (kanatlar açık, kuyruk düz); konfeti ve çerçeve hafifçe hareket etmeye devam eder. Resme dokununca karakter yeniden hareket ediyor ve sesini çıkarıyor.
- [ ] 6.9 Kutlamadaki düğmeler: ✓ boyamaya döndürüyor, sarı › (ileri) sonraki resmi açıyor, çerçeve galeriye götürüyor.
- [ ] 6.10 Kutlama açıkken telefonun Geri tuşu yalnızca kutlamayı kapatıyor; boyama ekranında kalınıyor.

## 7. Serbest çizim

- [ ] 7.1 Boş sayfada fırça her yere çiziyor; kova arka planı boyuyor.
- [ ] 7.1b Tek bir nokta çizip ✓'ye basınca çizim galeriye eklenir ama yeni çıkartma verilmez; birkaç fırça darbesi ya da boya içeren çizim çıkartma kazandırır.
- [ ] 7.2 ✓ ile kutlama açılıyor; çizim galeriye yeni eser olarak ekleniyor ve sayfa temizleniyor. Kutlamada Geri tuşuna basıp serbest çizime tekrar girince sayfa boş; galeride aynı çizim iki kez görünmüyor.

## 8. Galeri ve çıkartma kitabı

- [ ] 8.1 Galeride tamamlanan resimler renkli çerçevelerde, en yeni başta görünüyor.
- [ ] 8.2 Bir esere dokununca büyük görünüyor. ▶ ile karakter animasyonu ve sesi yeniden oynuyor; fırça ile boyamaya dönülüyor.
- [ ] 8.3 Çöp kutusu önce **ebeveyn kapısını** soruyor; doğru cevaptan sonra onayla siliniyor.
- [ ] 8.4 Çıkartma kitabında kazanılanlar renkli, kazanılmayanlar soluk gölge olarak görünüyor; yeni kazanılanlarda yıldız rozeti var.
- [ ] 8.5 Kazanılmış çıkartmaya dokununca sallanıyor ve ses çıkarıyor.
- [ ] 8.6 Galeriden silinen resim kategoride kaldığı hâliyle duruyor; tekrar bitirilince yeni çıkartma verilmiyor. 24 çıkartmanın hepsi toplanınca "Yeni çıkartma!" kartı artık çıkmıyor.

## 9. Ebeveyn alanı ve ayarlar

- [ ] 9.1 Ana menüde kilit düğmesi, yazıyla bir çarpma sorusu soruyor (ör. "yedi çarpı sekiz kaç eder?").
- [ ] 9.2 Yanlış cevapta pencere sallanıyor ve yeni bir soru geliyor; üçüncü yanlışta kapanıyor. Doğru cevapta ayarlar açılıyor.
- [ ] 9.2b Telefon yan çevrilmişken de ebeveyn kapısının kapatma (X) düğmesi ve tüm rakam tuşları ekranda görünüyor.
- [ ] 9.3 Ses efektleri / Müzik / Sesli rehber / Titreşim anahtarları anında etkili oluyor ve uygulama kapatılıp açılınca hatırlanıyor.
- [ ] 9.4 "Solak düzeni (yatay ekranda renkler solda)" açıkken yatay ekranda renk paleti sola, araçlar sağa geçiyor (dikey ekranı etkilemez).
- [ ] 9.5 Sesli rehber için telefonda **Türkçe** metin okuma sesi yüklü olmalı: Ayarlar'da "metin okuma" diye arayın (Pixel: Sistem → Diller → Metin okuma çıkışı; Samsung: Genel yönetim → Metin okuma). Tercih edilen motor olarak Google'ı seçip Türkçe ses verisini indirin. Yüklü değilse rehberin sessiz kalması beklenen davranıştır. Telefonun dili Türkçe olmasa da rehber Türkçe konuşmalı.
- [ ] 9.6 "Tüm ilerlemeyi sil" onaydan sonra galeriyi, çıkartmaları ve boyamaları sıfırlıyor.

## 10. Kayıt ve dayanıklılık

- [ ] 10.1 Bir resmi yarım bırakıp geri çıkın, sonra tekrar açın: boyama aynen duruyor.
- [ ] 10.2 Boyarken **Ana ekran** tuşuyla çıkın, uygulamayı son uygulamalardan kaydırarak tamamen kapatın, yeniden açın: son boyamalar kaybolmamış.
- [ ] 10.3 Boyarken bir telefon araması / bildirim gelince uygulama çökmüyor; dönünce kaldığı yerden devam ediyor.
- [ ] 10.4 Ekranı yatay/dikey çevirince düzen uyum sağlıyor ve boyama kaybolmuyor. Telefon yatayken geri al, ileri al, bitti, ampul ve çöp kutusu her zaman görünüyor; fırça/silgi seçiliyken kalınlık noktaları da ekleniyor.
- [ ] 10.4b Bir resmi bitirip kutlamadan galeriye gidin, aynı resmi fırça düğmesiyle tekrar açıp boyayın, sonra geri dönün: son boyamalar kaybolmuyor.
- [ ] 10.5 Uzun ve yoğun fırça kullanımında (bir resme 5–10 dakika boyunca çizim) uygulama yavaşlamıyor.
- [ ] 10.6 Telefonun yazı boyutu en büyüğe ayarlıyken ekranlar okunaklı ve düğmeler üst üste binmiyor.
- [ ] 10.7 Karanlık mod açık telefonda da uygulama açık renkli pastel temasıyla görünüyor.

## 11. Tablet (varsa)

- [ ] 11.1 Yatay modda araçlar solda, renkler sağda, tuval ortada büyük görünüyor.
- [ ] 11.2 Ana menü, kategoriler ve galeri geniş ekranı iyi kullanıyor.

---

### Geri bildirim şablonu

```
Madde: 4.13
Telefon: Samsung Galaxy A54, Android 15
Ne oldu: Yakınlaştırmadan sonra çizgiler bulanık
Ne bekliyordum: Keskin
Ekran görüntüsü/video: (ekle)
```
