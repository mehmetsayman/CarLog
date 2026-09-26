# Demo senaryosu — 90 saniye

Hedef: jüri videoyu izledikten sonra tek bir cümleyi hatırlasın —
**"kilometre düşürme denemesi zincirde hiç gerçekleşmiyor."**

Sırayı bozmayın. Her parça bir öncekinin kurduğu beklentiyi kullanıyor.

---

## Hazırlık (kayda başlamadan önce)

- [ ] `npm run dev` çalışıyor, `http://localhost:3000` açık
- [ ] MetaMask **Monad Testnet**'te, üç hesap da ekli:

  | Rol | Adres | Ne yapar |
  |---|---|---|
  | platform | `0x1c6e…b944` | %30 payı alır |
  | usta | `0xd3a9…B0d5` | kayıt girer, kazancını görür |
  | müşteri | `0x5992…9E24` | raporu satın alır |

- [ ] **Her hesap en az bir işlem göndermiş olmalı.** Hiç göndermemişse MetaMask'te
      o hesaba geçip kendine 0 MON gönderin — Monad RPC'si aksi halde ilk kontrat
      çağrısını reddeder
- [ ] **Kayıttan hemen önce `npm --prefix contracts run newcar` çalıştırın.**
      Rapor erişimi araç başına kalıcıdır: müşteri hesabı bir aracı bir kez
      açtıysa o araçta ödeme ekranı bir daha çıkmaz. Script size tertemiz bir
      şasi numarası verir ve onu nerede kullanacağınızı yazar. Geçmişi neredeyse
      boş olduğu için ustanın payı da büyük ve gösterilebilir olur
- [ ] Tarayıcı sekmeleri kapalı, bildirimler susturulmuş
- [ ] Telefon ekranı kaydı için `/report` açık (ikinci cihaz veya responsive mod)
- [ ] Şu şasi numaraları panoda hazır:
  - `WVWZZZ1JZXW000002` (temiz — tek ekspertiz kaydı, kaza yok)
  - `1HGBH41JXMN109186` (ağır hasarlı — 2 kaza)
  - `npm run newcar` ile açılmış **taze bir araç** (usta buraya kayıt girecek,
    müşteri cüzdanı bu aracı daha önce hiç açmamış olacak)
- [ ] Müşteri cüzdanı `1HGBH41JXMN109186` raporunu **daha önce satın aldıysa**
      ödeme ekranı çıkmaz. O zaman ödeme adımını taze araçla yapın.

---

## 0:00 – 0:12 · Problem

**Ekran:** Giriş sayfası.

> "İkinci el araç alırken elinizde iki şey var: satıcının anlattıkları ve
> göstergedeki rakam. İkisi de değiştirilebilir. Kilometre düşürmek bir kablo ve
> beş dakika meselesi."

**Neden burada:** Teknolojiden önce acıyı kurun. Jüri "blokzincir" kelimesini
duymadan önce sorunu tanısın.

---

## 0:12 – 0:32 · Temiz araç

**Ekran:** "Temiz geçmiş" örneğine tıklayın (`WVWZZZ1JZXW000002`), Sorgula.

> "Şasi numarasını giriyorum. Cüzdan yok, kayıt yok, izin yok."

Sayfa açılınca **kilitli skor çizelgesini** ("? / 100") gösterin.

> "Kilometre, kayıt sayısı, kaza yok. Bu kadarını herkes ücretsiz görüyor. Ama
> aracın 100 üzerinden puanı burada, kilidin arkasında."

**Neden burada:** Önce "iyi" hali gösterin ki kötü hali anlamlı olsun. Ayrıca
ödeme duvarını daha görmeden, ücretsiz katmanın ne kadar iş gördüğünü kurun.

---

## 0:32 – 0:58 · Hasarlı araç ve ödeme

**Ekran:** `1HGBH41JXMN109186`.

> "Aynı sorgu, başka bir araç. İki kaza kaydı — bu kadarı herkese açık. Skor ise
> yine kilitli."

Aşağı inin, **kilitli rapor** panelini gösterin.

> "Ama geçmişin kendisi — tarihler, hangi serviste ne yapılmış, notlar — raporun
> içinde. Bir kez ödüyorum, bu araç cüzdanımda kalıcı açılıyor."

**Tam raporu aç** → MetaMask → onaylayın. Açılan **sağlık skorunu**, **kilometre
grafiğini** (kazalar kırmızı) ve **kayıt tablosunu** gösterin.

> "2020'de ön şasi deformasyonu tespit edilmiş, on beş gün sonra düzeltilmiş.
> Üç farklı servis yazmış, biri diğerini doğruluyor. Satıcının anlatmayacağı şeyi
> araç kendisi anlatıyor."

Kilitli ekrandaki **paylaşım satırını** hatırlatın.

> "Ödediğim ücretin yüzde yetmişi, bu geçmişi yazan servislere gidiyor."

**Neden burada:** Ürünün değeri de, iş modeli de bu ekranda. Acele etmeyin.

---

## 0:58 – 1:16 · Usta kaydı giriyor

**Ekran:** Telefon, `/report`. **MetaMask'te usta hesabına geçin.**

> "Peki bu kayıtlar oraya nasıl giriyor? Sanayideki usta, işi bitirdiğinde
> telefonundan. Ve bakın burada ne var —"

**Kazanç kartını** gösterin.

> "Az önce ödediğim paranın payı buraya düştü. Usta yazdıkça kazanıyor. 'Neden
> uğraşsın ki' sorusunun cevabı bu."

Taze aracın şasi numarasını yazın — **zincirden gelen son kilometrenin
belirdiğini gösterin.** Bu araç sicile yeni girmiş, geçmişini yazmaya usta
başlıyor.

> "Şasi numarasını yazdığım anda zincirdeki son kilometreyi okuyor."

Kilometre, işlem tipi, tarih girin. **Monad Ağına Kaydet.** MetaMask'te onaylayın.

Onay ekranındaki **milisaniye rakamını** gösterin.

> "Yedi yüz milisaniye. Bu Monad'ın onay süresi. Usta müşteriyi bekletmiyor —
> Web2 hızında çalışıyor ama kayıt Web3 güvencesinde."

**Neden burada:** Sub-second finality'yi anlatmayın, **ölçün ve gösterin.**

> Vaktiniz varsa: sicilde olmayan bir şasi numarası yazın, panelin "ilk kaydı siz
> açıyorsunuz" moduna geçtiğini gösterin. Bir aracın sicile girmesi de ustanın
> işi. Süre darsa bunu atlayın.

---

## 1:16 – 1:28 · Kapanış vuruşu

**Ekran:** Aynı formda kilometre alanına **daha düşük bir sayı** yazın.

Alan kırmızıya döner, altta uyarı çıkar.

> "Şimdi kilometreyi düşürmeyi deniyorum."

Kısa bir es verin.

> "Bu bir uyarı değil. Bir bayrak, sonradan fark edilecek bir tutarsızlık da
> değil. Zincir bu işlemi baştan reddediyor — kayıt defterine hiç girmiyor.
> Kilometre düşürmek CarLog'da mümkün olan ama yasak bir şey değil;
> **imkânsız bir şey.**"

**Neden burada:** Son cümle akılda kalan cümle. Bunu ezberleyin.

---

## 1:28 – 1:30 · Kapanış kartı

**Ekran:** Giriş sayfası veya logo.

> "CarLog. Kelimeye değil, kayda bakın."

---

## Yedek plan

- **Ağ yavaşlarsa:** Videoyu önceden kaydedin, canlı demo yedek olsun.
- **Cüzdan bağlanmazsa:** Önizleme cüzdan istemiyor; kilometre, kayıt ve kaza
  sayısı yine görünür. Hikâyenin ilk yarısı tek başına da ayakta durur.
- **Ağ bir anlığına cevap vermezse:** Sayfa "Zincire şu an ulaşılamadı" der;
  **Tekrar dene**'ye basın. Sunucu son okunan veriyi 10 saniye saklıyor.
- **Jüri usta panelini kendisi denemek isterse:** Jürinin MetaMask adresini alın,
  `/admin` (admin / 0000) → sicil sahibi cüzdanını bağlayın → adresi ve bir ad
  girip **Yetki ver**. Jüri `/report` sayfasını yenilesin.
- **Telefonda cüzdan yoksa:** Usta panelini MetaMask uygulamasının kendi
  tarayıcısında açın. Normal tarayıcıda "Cüzdan Bağla" bunu önerir.
- **Alıcı cüzdanı raporu zaten satın almışsa:** Ödeme ekranı görünmez. Başka bir
  araç seçin veya temiz cüzdana geçin — bu yüzden hazırlık listesinde var.
- **Süre taşarsa:** İlk kesilecek parça temiz araç (0:12–0:32). Hasarlı araç,
  ödeme ve kilometre reddi asla kesilmez.

## Kesinlikle anlatmayın

- Kontrat mimarisi, struct paketleme, gas optimizasyonu — sorulursa anlatın
- "Blokzincir teknolojisi sayesinde..." ile başlayan hiçbir cümle
- Yol haritası — 90 saniyede geleceği değil bugünü satın
