# iPhone / iPad'de Test Listesi (TestFlight)

TestFlight'tan kurduktan sonra bu listeyi sırayla deneyin. Her maddede
**beklenen davranış** yazıyor. Farklı bir şey görürseniz şunları not edin:

- maddenin numarası,
- iPhone modeli,
- iOS sürümü.

Mümkünse ekran görüntüsü ya da ekran kaydı da alın (Denetim Merkezi →
Ekran Kaydı). TestFlight'ta ekran görüntüsü alınca çıkan **"Geri Bildirim
Gönder"** ile doğrudan da iletebilirsiniz.

Oyunun bütün özellikleri Android sürümüyle aynıdır. Ortak maddelerin
ayrıntılı açıklaması [`TEST_LISTESI.md`](TEST_LISTESI.md) dosyasındadır.
Bu liste iPhone'a özgü noktaları ve en önemli ortak kontrolleri içerir.

**Cihaz bilgisi:**

- iPhone modeli: ______
- iOS sürümü: ______
- Çentik / Dynamic Island var mı? ☐
- iPad mi? ☐

> **Ses notu (iOS kuralı):** iPhone'un yanındaki **zil/sessiz anahtarı**
> (ya da yeni modellerde Eylem düğmesi) **sessizdeyken** oyun efektleri ve
> müzik çalmaz. Apple'ın oyunlar için önerdiği davranış budur. Ses
> duymak için anahtarı zil konumuna alın ve ses düğmeleriyle sesi açın.
> Bu, Android'den bilinçli bir farktır.

---

## 1. Kurulum ve açılış

- [ ] 1.1 TestFlight'ta **Yükle** sorunsuz tamamlanıyor. Ana ekranda pembe damla (Pıtırcık) simgeli **Minik Renkler Dünyası** görünüyor. Simgenin köşelerinde siyah ya da beyaz kenar yok.
- [ ] 1.2 Açılış ekranı pembe zeminde maskotu gösteriyor, ardından ana menü 1–3 saniyede açılıyor.
- [ ] 1.3 Saat, pil ve **Dynamic Island / çentik** oyunun düğmelerinin üstüne binmiyor. Durum çubuğu gizli.
- [ ] 1.4 Alttaki **ana ekran çizgisi** (home indicator) düğmelerin ya da renk paletinin üstüne binmiyor.
- [ ] 1.5 Uygulama **hiçbir izin istemiyor** (mikrofon, fotoğraflar, konum, bildirim, takip izni vb.).
- [ ] 1.6 Uçak modunda da tamamen çalışıyor.
- [ ] 1.7 **Ebeveyn Ayarları**'nın en altındaki **Sürüm** satırı `1.0.0` gösteriyor. Hangi derlemenin kurulu olduğunu TestFlight uygulamasındaki derleme numarası, ör. `1.0.0 (3)`, gösterir.
- [ ] 1.8 **Güncelleme:** Bir resim boyayıp çıkartma kazanın. TestFlight'ta yeni derleme çıkınca **Güncelle** deyin. Boyamalar, galeri, çıkartmalar ve ayarlar duruyor.

## 2. Ana menü ve ses

- [ ] 2.1 Başlık harfleri renkli ve dalgalanıyor. Bulutlar ve yıldızlar süzülüyor. Maskot göz kırpıyor.
- [ ] 2.2 Düğmelere basınca yumuşak "tık" sesi ve **hafif titreşim (haptik)** var.
- [ ] 2.3 Zil anahtarı açıkken arka planda kutu müziği çalıyor; döngü geçişinde "tık" duyulmuyor.
- [ ] 2.4 Zil anahtarı **sessize** alınınca efektler ve müzik susuyor; zil konumuna dönünce sesler geri geliyor.
- [ ] 2.5 Başka bir uygulamada (ör. Müzik) şarkı çalarken oyunu açınca şarkı **kesilmiyor**; oyun sesleri üstüne karışıyor.
- [ ] 2.6 Sol üstteki hoparlör düğmesi efektleri, müziği ve sesli rehberi birlikte kapatıp açıyor.
- [ ] 2.7 Sesli rehber açılışta "Minik Renkler Dünyasına hoş geldin!" diyor (Türkçe ses iPhone'da hazır gelir). Zil anahtarı sessizdeyse rehber de susabilir.
- [ ] 2.8 Ana ekrana çıkınca müzik ve sesler susuyor; geri dönünce müzik devam ediyor.
- [ ] 2.9 Bluetooth kulaklık ya da AirPods bağlıyken sesler kulaklıktan geliyor. Kulaklık çıkarılınca müzik durabilir; bir sonraki dokunuşta yeniden başlıyor.

## 3. Gezinme (iOS hareketleri)

- [ ] 3.1 Kategoriler, resim listesi, galeri, çıkartmalar ve ebeveyn ayarlarında **ekranın sol kenarından sağa kaydırmak** bir önceki ekrana dönüyor.
- [ ] 3.2 Boyama ekranında, tuvalin kenarına yakın başlayan bir **boyama hareketi** ekranı kapatmıyor. Sol üstteki geri düğmesi boyamayı kaydedip çıkıyor.
- [ ] 3.3 Boyarken alttan yukarı kaydırıp ana ekrana gidin ya da üstten aşağı kaydırıp Bildirim / Denetim Merkezi'ni açın. Uygulamaya dönünce boyama duruyor, uygulama çökmüyor. Kenarda yarım kalan kısa bir fırça izi görmek normaldir; Geri al ile silinir.
- [ ] 3.4 Kutlama açıkken ekran kapanmıyor ya da beklenmedik şekilde başka ekrana geçmiyor.

## 4. Boyama motoru (en önemli bölüm)

Her kategoriden en az bir resimle deneyin.

- [ ] 4.1 **Dokun-doldur:** Kovayla bir alana dokununca yalnızca o alan anında boyanıyor; çizgilerin dışına taşmıyor.
- [ ] 4.2 Çok küçük alanlar (göz beyazı, çiçek ortası) parmakla rahatça boyanabiliyor.
- [ ] 4.3 Her boyamada kısa, müzikal "bloop" sesi ve hafif titreşim var. Hızlı dokunuşlarda ses takılmıyor.
- [ ] 4.4 **Fırça** parmağı gecikmeden takip ediyor ve başladığı alanın dışına çıkmıyor. ProMotion'lı (120 Hz) iPhone'larda çizgi akıcı.
- [ ] 4.5 Fırça kalınlığı (3 nokta) değişiyor; tek dokunuş küçük bir nokta bırakıyor.
- [ ] 4.6 **Silgi:** Sürükleyince fırça izlerini siliyor, dokununca alanı beyaza döndürüyor.
- [ ] 4.7 **Geri al / İleri al** sırayla çalışıyor. **Çöp kutusu** onay soruyor; Geri al her şeyi geri getiriyor.
- [ ] 4.8 **Sihirli boyalar** (simli, gökkuşağı, puantiye, yıldız, kalp, çizgili) hem kovayla hem fırçayla düzgün; kenarlarda kayma yok.
- [ ] 4.9 **İki parmakla yakınlaştırma** çalışıyor. Bırakınca çizgiler keskinleşiyor ve **hiçbir alan kendiliğinden boyanmıyor**.
- [ ] 4.10 Yakınken iki parmakla kaydırma çalışıyor, tek parmak boyamaya devam ediyor. Büyüteç düğmesi tam görünüme dönüyor.
- [ ] 4.11 İki parmakla aynı anda dokunmak hiçbir alanı boyamıyor. Parmaklardan biri önce kalkınca resim zıplamıyor.
- [ ] 4.12 **İpucu (ampul)** boyanmamış bir alanı parlatıyor. İlerleme çubuğu boyadıkça doluyor.
- [ ] 4.13 Yarıdan azı boyalıyken ✓ "Biraz daha boyayalım!" diyor. Yarıdan fazlası boyalıyken ✓ kutlamayı açıyor.

## 5. Çıkartmalar

- [ ] 5.1 Yıldız simgeli araçta çıkartmalar listeleniyor. Resme dokununca "pop" sesiyle yapışıyor.
- [ ] 5.2 Yapışan çıkartma sürüklenip taşınabiliyor. Silgiyle kaldırılıyor; Geri al geri getiriyor.

## 6. Kutlama animasyonları

- [ ] 6.1 Son alan boyanınca kutlama kendiliğinden açılıyor. Konfeti ve kutlama müziği var.
- [ ] 6.2 Karakterler canlanıyor:
  - unicorn göz kırpıyor,
  - kedi kuyruk sallayıp miyavlıyor,
  - kelebek ve peri kanat çırpıyor,
  - deniz kızının kuyruğu sallanıyor,
  - prensesin etrafında pırıltılar var.
- [ ] 6.3 Animasyonlar akıcı (takılma yok). Telefon aşırı ısınmıyor.
- [ ] 6.4 Yaklaşık 12 saniye sonra karakter düzgün duruşuna dönüyor. Resme dokununca yeniden hareket ediyor ve sesini çıkarıyor.
- [ ] 6.5 İlk tamamlamada "Yeni çıkartma!" kartı çıkıyor; aynı resmi tekrar bitirince çıkmıyor.
- [ ] 6.6 Kutlamadaki ✓, › (sonraki resim) ve çerçeve (galeri) düğmeleri doğru çalışıyor.

## 7. Serbest çizim, galeri, çıkartma kitabı

- [ ] 7.1 Serbest çizimde fırça her yere çiziyor. ✓ ile kutlama açılıyor; çizim galeriye bir kez ekleniyor ve sayfa temizleniyor.
- [ ] 7.2 Galeride eserler en yeni başta görünüyor. Bir esere dokununca büyüyor; ▶ animasyonu ve sesi oynatıyor, fırça ile boyamaya dönülüyor.
- [ ] 7.3 Galeride silme önce **ebeveyn kapısını** soruyor.
- [ ] 7.4 Çıkartma kitabında kazanılanlar renkli, kazanılmayanlar soluk görünüyor.

## 8. Ebeveyn alanı

- [ ] 8.1 Kilit düğmesi yazıyla bir çarpma sorusu soruyor. Yanlış cevapta yeni soru geliyor, doğru cevapta ayarlar açılıyor.
- [ ] 8.2 Telefon yan çevrilmişken de ebeveyn kapısının bütün tuşları ve kapatma (X) düğmesi görünüyor.
- [ ] 8.3 Ses efektleri, Müzik, Sesli rehber ve Titreşim anahtarları anında etkili oluyor ve uygulama kapatılıp açılınca hatırlanıyor.
- [ ] 8.4 "Tüm ilerlemeyi sil" onaydan sonra her şeyi sıfırlıyor.

## 9. Kayıt ve dayanıklılık

- [ ] 9.1 Bir resmi yarım bırakıp geri çıkın ve tekrar açın: boyama aynen duruyor.
- [ ] 9.2 Boyarken ana ekrana gidin. Uygulamayı uygulama değiştiricide yukarı kaydırarak **tamamen kapatın** ve yeniden açın: son boyamalar kaybolmamış.
- [ ] 9.3 Boyarken telefon araması, FaceTime ya da alarm gelince uygulama çökmüyor; dönünce kaldığı yerden devam ediyor.
- [ ] 9.4 Ekranı yatay ve dikey çevirin (Denetim Merkezi'nde **Dikey Yön Kilidi** kapalı olmalı). Düzen uyum sağlıyor ve boyama kaybolmuyor. Yatayda araçlar ve renkler, çentik ya da Dynamic Island tarafında kesilmiyor.
- [ ] 9.5 Uzun ve yoğun fırça kullanımında (bir resme 5–10 dakika boyunca çizim) uygulama yavaşlamıyor.
- [ ] 9.6 **Ayarlar → Ekran ve Parlaklık → Metin Boyutu** en büyükteyken ekranlar okunaklı ve düğmeler üst üste binmiyor.
- [ ] 9.7 **Karanlık Mod** açıkken de uygulama açık renkli pastel temasıyla görünüyor.
- [ ] 9.8 **Düşük Güç Modu** açıkken animasyonlar biraz yavaşlayabilir, ama boyama ve kayıt çalışıyor.

## 10. Farklı ekranlar (varsa)

- [ ] 10.1 **Küçük iPhone** (SE / mini): Boyama ekranında palet, araçlar ve tuval sığıyor; düğmeler üst üste binmiyor.
- [ ] 10.2 **Büyük iPhone** (Pro Max / Plus): Tuval büyük ve ortalı.
- [ ] 10.3 **iPad:** Yatayda araçlar solda, renkler sağda, tuval ortada. Split View / Slide Over ile yarım ekrana alınınca düzen bozulmuyor.

---

### Geri bildirim şablonu

```
Madde: 4.9
Cihaz: iPhone 15, iOS 26.1
Ne oldu: Yakınlaştırmadan sonra çizgiler bulanık
Ne bekliyordum: Keskin
Ekran görüntüsü/video: (ekle)
```
