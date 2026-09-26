import type { ReactNode } from "react";

/*
 * Every word the interface says, in Turkish and English.
 *
 * Turkish is the source: the product is built for the Turkish used-car market
 * and its garages. The English dictionary is typed against it, so a string added
 * to one language and forgotten in the other is a compile error, not a blank on
 * screen.
 *
 * What stays Turkish in both: the dNFT image and anything else the contract
 * itself renders. That text is written on-chain and the interface cannot change it.
 */

export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";

export function isLocale(value: unknown): value is Locale {
  return value === "tr" || value === "en";
}

/** What Intl calls each locale, for numbers and dates. */
export const INTL_LOCALE: Record<Locale, string> = { tr: "tr-TR", en: "en-US" };

const tr = {
  meta: {
    title: "CarLog CL-1 — Araç sicili, zincirde",
    description:
      "Her aracın servis geçmişi bir dinamik NFT. Kilometre geri alınamaz, kaza kaydı silinemez.",
    vehicleTitle: (vin: string) => `${vin} — CarLog sicil raporu`,
    reportTitle: "Kayıt gir — CarLog",
  },

  common: {
    figure: "Şekil",
    table: "Tablo",
    parameter: "Parametre",
    value: "Değer",
    source: "Kaynak",
    confirmInWallet: "Cüzdanda onaylayın",
  },

  nav: {
    aria: "Ana menü",
    search: "Sorgula",
    garage: "Usta paneli",
    contract: "Kontrat",
    admin: "Yönetici",
  },

  actions: {
    lookup: "Araç sorgula",
    garage: "Usta paneli",
    contract: "Sicil kontratı",
    verified: "Doğrulanmış kaynak",
    docs: "Belgeler",
    admin: "Yönetici paneli",
  },

  foot: {
    feedback: "Belge hakkında geri bildirim",
  },

  prefs: {
    language: "Dil",
    toLight: "Açık temaya geç",
    toDark: "Koyu temaya geç",
  },

  wallet: {
    connect: "Cüzdan Bağla",
    connecting: "Bağlanıyor...",
    switchNetwork: "Monad Testnet'e geç",
    switching: "Ağ değişiyor...",
    disconnect: "Cüzdan bağlantısını kes",
    noWallet: "Bu tarayıcıda cüzdan bulunamadı.",
    installWallet: "MetaMask kur",
    openInApp: "MetaMask uygulamasında aç",
    rejected: "Bağlantı isteği reddedildi.",
    failed: "Cüzdana bağlanılamadı.",
  },

  recordTypes: [
    "Periyodik bakım",
    "Onarım",
    "Parça değişimi",
    "Muayene / ekspertiz",
    "Kaza kaydı",
    "Ağır hasar",
  ],

  home: {
    tag: "Ürün önizlemesi",
    date: "Eylül 2026",
    onChain: "Monad Testnet üzerinde",
    partnoSub: "Araç sicil birimi",
    titleA: "İkinci el araçta kelimeye değil,",
    titleB: "kayda bakın.",
    goGarage: "Usta paneline geç",
    sampleReport: "Örnek rapor",
    features: "Özellikler",
    featureList: [
      {
        b: "Kilometre geri alınamaz:",
        text: "düşük değer girme denemesi bir uyarı değil, zincirin baştan reddettiği bir işlemdir",
      },
      {
        b: "Geçmiş silinemez:",
        text: "kayıtlar yalnızca eklenir; yetkisi alınan servisin imzaladıkları yerinde kalır",
      },
      {
        b: "Kaynağı belli:",
        text: "her kaydın altında onu imzalayan servisin adı ve adresi",
      },
    ],
    who: "Kimler için",
    whoList: [
      "İkinci el alıcılar",
      "Galeriler",
      "Servisler ve ustalar",
      "Ekspertiz firmaları",
      "Sigorta şirketleri",
      "Filo yöneticileri",
    ],
    registryTable: "Sicil bilgisi",
    network: "Ağ",
    contract: "Sicil kontratı",
    price: "Rapor ücreti",
    footId: "Monad Testnet, Eylül 2026",
    closeA: "Aracın geçmişini satıcı değil,",
    closeB: "zincir anlatsın.",
    closeBody:
      "Şasi numarasını yazın; kilometreyi, kaza kaydını ve kaç servisin dokunduğunu hemen görün. Tam rapor tek seferlik ödemeyle cüzdanınızda kalıcı olarak açılır.",
    openSample: "Örnek raporu aç",
    garagePanel: "Usta paneli",
  },

  search: {
    label: "Şasi numarası",
    placeholder: "Şasi numarası (17 hane)",
    submit: "Sorgula",
    searching: "Sorgulanıyor...",
    examples: "Örnek araçlar",
    exampleLabels: ["Temiz geçmiş", "Hafif kazalı", "Ağır hasarlı"],
  },

  car: {
    title:
      "Kaputu açık bir otomobilin yan görünüşü. Numaralı işaretler sicilde kaydı tutulan kısımları gösteriyor: şasi numarası, kilometre, motor bakımı, parça değişimi, kaza ve onarım.",
    view: "YAN GÖRÜNÜŞ · KAPUT AÇIK",
    notToScale: "ölçeksiz",
    oneVehicle: "tek araç = tek dNFT",
    wheelbase: "dingil arası",
    callouts: {
      vin: { label: "Şasi numarası", sub: "sicil anahtarı" },
      km: { label: "Kilometre", sub: "yalnızca artar" },
      service: { label: "Periyodik bakım", sub: "motor · yağ" },
      repair: { label: "Onarım", sub: "kaporta · boya" },
      parts: { label: "Parça değişimi", sub: "lastik · fren" },
      accident: { label: "Kaza kaydı", sub: "silinmez" },
    },
    caption: "Kaputu açık yan görünüş: numaralı her nokta, raporda kaydı tutulan bir kısım.",
  },

  vehicle: {
    tag: "Araç sicil raporu",
    revision: (n: number) => `Rev. ${n} kayıt`,
    lastUpdated: (date: string) => `Son güncelleme ${date}`,
    currentKm: "Güncel kilometre",
    intro: "Bu şasi numarasıyla sicile kayıtlı araç.",
    accidents: (n: number) => `${n} kaza kaydı taşıyor.`,
    noAccidents: "Kaza kaydı yok.",
    summary: "Özet",
    detailsTable: "Araç bilgisi",
    rows: {
      vin: "Şasi numarası",
      km: "Kilometre",
      kmSource: "son kayıt",
      records: "Kayıt sayısı",
      recordsSource: "yalnızca eklenir",
      accidents: "Kaza kaydı",
      none: "Yok",
      accidentsSource: "silinemez",
      updated: "Son güncelleme",
      updatedSource: "blok zamanı",
    },
    previewNote:
      "Yukarıdakiler herkese açık önizleme. Sağlık skoru ve kayıt kayıt geçmiş tam raporda.",
  },

  badge: {
    alt: "Aracın zincirde üretilen dNFT görseli",
    locked: "dNFT görseli kilitli",
    caption: "Zincirde üretilen dNFT; her kayıtla yeniden çizilir.",
  },

  score: {
    label: "Sağlık skoru",
    good: "Temiz geçmiş",
    warn: "Dikkatli inceleyin",
    bad: "Ağır hasar kaydı",
    locked: "Tam raporda açılır",
  },

  report: {
    history: "Servis geçmişi",
    unlocked: "● rapor açık",
    paidIn: (ms: number) => ` · ödeme ${ms} ms'de onaylandı`,
    unlockedIntro:
      "Aracın doğduğu günden bugüne her kaydı. Kaza satırları işaretli; bir satırın tarihinin üstüne gelince zincire ne zaman yazıldığı görünür.",
    loading: "Kayıtlar zincirden okunuyor...",
    restricted: "Kısıtlı",
    lockedIntro:
      "Bu bölüm tam raporda açılır: aracın 100 üzerinden sağlık skoru, her kaydın tarihi, kilometresi, notu, imzalayan servis ve varsa fotoğrafı.",
    fullReport: "Tam rapor",
    oneTime: "MON · tek seferlik",
    perkPermanent: "Bu araç cüzdanınızda kalıcı olarak açılır",
    perkShare: (pct: number, garages: number): ReactNode => (
      <>
        Ücretin <b>%{pct}</b>’i bu aracın geçmişini yazan <b>{garages} servise</b>{" "}
        paylaştırılır
      </>
    ),
    perkFast: "Ödeme Monad’da saniyenin altında onaylanır",
    needWallet: "Rapor satın almak için cüzdan gerekiyor",
    paymentSent: "Ödeme ağa gönderildi",
    unlock: "Tam raporu aç",
    alreadyPurchased: "Bu rapor zaten bu cüzdana açık.",
  },

  records: {
    table: "Servis kayıtları",
    no: "No.",
    date: "Tarih",
    km: "Km",
    work: "İşlem",
    garage: "Servis",
    notes: "Açıklama",
    writtenOn: (date: string) => `Zincire ${date} tarihinde yazıldı`,
  },

  chart: {
    title: (count: number, min: string, max: string) =>
      `Kilometre, servis tarihine göre. ${count} okuma, en düşük ${min} km, en yüksek ${max} km.`,
    floor: (km: string) => `taban ${km} km`,
    legendKm: "Kilometre",
    legendAccident: "Kaza / ağır hasar",
    legendFloor: "Bugünkü taban",
    caption:
      "Kilometre, servis tarihine göre. Kontrat son okumanın altındaki hiçbir değeri kabul etmez; kırmızı çizgi bugünkü taban.",
  },

  attachment: {
    open: "Belgeyi aç",
    fullSize: "Tam boyutta aç",
    alt: "Kayda eklenen fotoğraf",
  },

  notFound: {
    tag: "Kayıt bulunamadı",
    queryResult: "Sorgu sonucu",
    notRegistered: "Sicilde değil",
    titleA: "Bu araç",
    titleB: "sicilde yok.",
    note: (
      <>
        Bu, aracın geçmişinin temiz olduğu anlamına <b>gelmez</b> — yalnızca henüz hiçbir
        servisin onu sicile girmediğini gösterir.
      </>
    ) as ReactNode,
    tryAnother: "Başka bir şasi numarası deneyin",
  },

  errorPage: {
    tag: "Geçici hata",
    titleA: "Zincire şu an",
    titleB: "ulaşılamadı.",
    body: "Monad ağı şu an yoğun olabilir. Birkaç saniye sonra tekrar deneyin; kayıtlar zincirde yerinde duruyor.",
    retry: "Tekrar dene",
    home: "Ana sayfa",
  },

  missingPage: {
    tag: "Sayfa bulunamadı",
    titleA: "Bu sayfa",
    titleB: "yok.",
    body: "Adres yanlış yazılmış olabilir. Bir aracı şasi numarasıyla sorgulayabilirsiniz.",
    home: "Ana sayfa",
  },

  admin: {
    metaTitle: "Yönetici — CarLog",
    tag: "Yönetici paneli",
    partnoSub: "Servis yetkilendirme",
    footLink: "Yönetici",

    loginTitleA: "Yönetici",
    loginTitleB: "girişi.",
    loginBody:
      "Servis yetkilendirme ekranı. Giriş yaptıktan sonra yetki vermek için ayrıca sicil sahibinin cüzdanı gerekir.",
    username: "Kullanıcı adı",
    password: "Şifre",
    signIn: "Giriş yap",
    signingIn: "Kontrol ediliyor...",
    badLogin: "Kullanıcı adı veya şifre hatalı.",
    signOut: "Çıkış",

    titleA: "Servis",
    titleB: "yetkilendirme.",
    intro:
      "Onaylanan adres usta panelinden kayıt girebilir ve belge yükleyebilir. Yetkisi kaldırılan servisin yazdığı kayıtlar zincirde kalır.",

    sectionWallet: "Sicil sahibi cüzdanı",
    needOwner: "Yetki işlemleri sicil sahibinin cüzdan imzasını ister.",
    ownerConnected: "Sicil sahibi cüzdanı bağlı",
    notOwner: (owner: string) =>
      `Bağlı cüzdan sicil sahibi değil. Yetki vermek için ${owner} cüzdanıyla bağlanın.`,

    sectionGrant: "Yetki ver",
    address: "Servis cüzdan adresi",
    name: "Servis adı",
    namePlaceholder: "Jüri Servisi",
    badAddress: "Geçerli bir cüzdan adresi girin (0x ile başlayan 42 karakter).",
    needName: "Servis adı girin.",
    statusNow: "Şu anki durum",
    statusActive: "yetkili",
    statusRevoked: "yetkisi kaldırılmış",
    statusNone: "kayıtlı değil",
    grant: "Yetki ver",
    confirmed: (ms: number) => `Zincirde onaylandı · ${ms} ms`,

    sectionList: "Kayıtlı servisler",
    listTable: "Servis listesi",
    colName: "Servis",
    colAddress: "Adres",
    colRecords: "Kayıt",
    colStatus: "Durum",
    colAction: "İşlem",
    revoke: "Kaldır",
    restore: "Yeniden ver",
    loadingList: "Liste zincirden okunuyor...",
    empty: "Henüz onaylı servis yok.",
  },

  garage: {
    tag: "Servis kayıt formu",
    approvedOnly: "Yalnızca onaylı servisler",
    partnoSub: "Usta paneli",
    titleA: "Servis kaydı",
    titleB: "gir.",
    intro: "Girdiğiniz kayıt saniyeler içinde zincire yazılır ve bir daha değiştirilemez.",
    earnings: "Rapor geliriniz",
    withdraw: "Çek",
    withdrawing: "Çekiliyor",
    account: "Hesabım",
    accountBalance: "Hesaptaki para",
    withdrawable: "Çekilebilir rapor geliri",
    withdrawn: (amount: string) => `${amount} MON hesabınıza geçti`,
    viewOnExplorer: "Explorer'da gör",
    copyAddress: "Adresi kopyala",
    copiedAddress: "Kopyalandı",
  },

  form: {
    phoneLogin: "Telefon veya e-posta ile giriş",
    phoneLoginHint: "Cüzdan ve MON gerekmez; işlem ücretini platform öder.",
    orWallet: "ya da kendi cüzdanınızla",
    preparing: "Hesabınız hazırlanıyor...",
    signedInAs: (who: string) => `${who} ile giriş yapıldı`,
    gasFree: "İşlem ücreti platformdan",
    signOut: "Çıkış",
    giveAddress: "Bu adresi yöneticiye iletin; yetki verildiğinde sayfayı yenileyin.",
    copy: "Kopyala",
    copied: "Kopyalandı",
    connectLabel: "Adım 0",
    connectTitle: "Cüzdanınızı bağlayın",
    connectBody: "Kayıt girebilmek için yetkili servis cüzdanınızla Monad Testnet'e bağlanın.",
    checkingLabel: "Kontrol",
    checkingTitle: "Yetki sorgulanıyor",
    checkingBody: "Cüzdanınızın sicile yazma yetkisi zincirden okunuyor.",
    refusedLabel: "Reddedildi",
    refusedTitle: "Bu cüzdan yetkili değil",
    refusedBody:
      "Sicile yalnızca onaylı servisler yazabilir. Adresinizi sicil yöneticisine iletip yetki isteyin.",

    confirmed: "Onaylandı",
    registeredA: "Araç",
    registeredB: "sicile açıldı.",
    writtenA: "Zincire",
    writtenB: "yazıldı.",
    permanent: "Kayıt artık silinemez ve değiştirilemez.",
    resultTable: "İşlem sonucu",
    status: "Durum",
    statusConfirmed: "onaylandı",
    confirmTime: "Ağ onay süresi",
    vin: "Şasi",
    tx: "İşlem",
    newRecord: "Yeni kayıt gir",

    sectionVehicle: "Araç",
    sectionWork: "İşlem",
    sectionEvidence: "Belge",
    vinField: "Şasi numarası (VIN)",
    registeredLine: (km: string, count: number): ReactNode => (
      <>
        Sicilde kayıtlı — son kilometre <b className="numeric text-ink">{km} km</b>, {count}{" "}
        kayıt
      </>
    ),
    newVehicle: "Bu araç sicilde yok — ilk kaydı siz açıyorsunuz",
    newVehicleBody:
      "Girdiğiniz kilometre aracın taban değeri olur; bundan sonra hiçbir servis bunun altına inemez.",
    mileage: "Kilometre",
    serviceDate: "İşlem tarihi",
    owner: "Araç sahibi cüzdanı (isteğe bağlı)",
    ownerPlaceholder: "0x… — boşsa araç serviste kalır",
    workType: "İşlem tipi",
    note: "Not (isteğe bağlı)",
    notePlaceholder: "Yağ ve filtre değişimi",
    firstEntryNote: "Sicile ilk kayıt",

    removeAttachment: "Eki kaldır",
    uploading: "IPFS'e yükleniyor...",
    signing: "Yükleme için cüzdanda imzalayın...",
    pickFile: "Fotoğraf veya fatura seç (isteğe bağlı)",
    uploadFallback: "Kaydı ek olmadan da gönderebilirsiniz.",

    rollbackRejected: "Zincir reddetti: kilometre geri alınamaz.",
    sent: "Ağa gönderildi",
    registerVehicle: "Aracı Sicile Kaydet",
    submitRecord: "Monad Ağına Kaydet",

    problems: {
      vinLength: "Şasi numarası 17 karakter olmalı.",
      enterKm: "Kilometre girin.",
      kmPositive: "Kilometre sıfırdan büyük olmalı.",
      rollback: (km: string) =>
        `Kayıtlı kilometre ${km}. Daha düşük bir değer zincir tarafından reddedilir.`,
      enterDate: "İşlem tarihi girin.",
      futureDate: "İşlem tarihi gelecekte olamaz.",
      badOwner: "Araç sahibi cüzdanı geçerli bir adres değil.",
    },
  },

  /** Keyed by the `code` the upload route returns. */
  upload: {
    not_configured: "IPFS yükleme yapılandırılmamış.",
    bad_request: "Geçersiz istek gövdesi.",
    no_file: "Dosya bulunamadı.",
    too_large: "Dosya 10 MB sınırını aşıyor.",
    bad_type: "Yalnızca fotoğraf ve PDF yüklenebilir.",
    unauthorized: "Yalnızca onaylı servisler belge yükleyebilir.",
    signature_rejected: "İmza reddedildi.",
    failed: "Yükleme başarısız oldu.",
  },
};

export type Dictionary = typeof tr;
export type UploadErrorCode = keyof Dictionary["upload"];

export function isUploadErrorCode(value: unknown): value is UploadErrorCode {
  return typeof value === "string" && value in tr.upload;
}

const en: Dictionary = {
  meta: {
    title: "CarLog CL-1 — Vehicle registry, on-chain",
    description:
      "Every vehicle's service history as a dynamic NFT. Mileage can't be rolled back, accidents can't be erased.",
    vehicleTitle: (vin) => `${vin} — CarLog registry report`,
    reportTitle: "Add a record — CarLog",
  },

  common: {
    figure: "Figure",
    table: "Table",
    parameter: "Parameter",
    value: "Value",
    source: "Source",
    confirmInWallet: "Confirm in your wallet",
  },

  nav: {
    aria: "Main menu",
    search: "Search",
    garage: "Garage panel",
    contract: "Contract",
    admin: "Admin",
  },

  actions: {
    lookup: "Look up a vehicle",
    garage: "Garage panel",
    contract: "Registry contract",
    verified: "Verified source",
    docs: "Docs",
    admin: "Admin panel",
  },

  foot: {
    feedback: "Feedback on this document",
  },

  prefs: {
    language: "Language",
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
  },

  wallet: {
    connect: "Connect Wallet",
    connecting: "Connecting...",
    switchNetwork: "Switch to Monad Testnet",
    switching: "Switching network...",
    disconnect: "Disconnect wallet",
    noWallet: "No wallet found in this browser.",
    installWallet: "Install MetaMask",
    openInApp: "Open in the MetaMask app",
    rejected: "The connection request was rejected.",
    failed: "Couldn't connect to the wallet.",
  },

  recordTypes: [
    "Scheduled service",
    "Repair",
    "Part replacement",
    "Inspection",
    "Accident",
    "Heavy damage",
  ],

  home: {
    tag: "Product preview",
    date: "September 2026",
    onChain: "On Monad Testnet",
    partnoSub: "Vehicle registry unit",
    titleA: "Buying used? Skip the sales pitch,",
    titleB: "read the record.",
    goGarage: "Open garage panel",
    sampleReport: "Sample report",
    features: "Features",
    featureList: [
      {
        b: "Mileage can't be rolled back:",
        text: "a lower reading isn't a warning, it's a transaction the chain refuses outright",
      },
      {
        b: "History can't be erased:",
        text: "records are append-only; a revoked garage's signed entries stay where they are",
      },
      {
        b: "Every source is known:",
        text: "each record carries the name and address of the garage that signed it",
      },
    ],
    who: "Who it's for",
    whoList: [
      "Used-car buyers",
      "Dealerships",
      "Garages and mechanics",
      "Inspection firms",
      "Insurers",
      "Fleet managers",
    ],
    registryTable: "Registry details",
    network: "Network",
    contract: "Registry contract",
    price: "Report fee",
    footId: "Monad Testnet, September 2026",
    closeA: "Let the chain, not the seller,",
    closeB: "tell the car's story.",
    closeBody:
      "Type a VIN and instantly see the mileage, the accident record and how many garages have worked on it. The full report unlocks permanently for your wallet with a one-time payment.",
    openSample: "Open sample report",
    garagePanel: "Garage panel",
  },

  search: {
    label: "VIN",
    placeholder: "VIN (17 characters)",
    submit: "Search",
    searching: "Searching...",
    examples: "Sample vehicles",
    exampleLabels: ["Clean history", "Minor accident", "Heavy damage"],
  },

  car: {
    title:
      "Side view of a car with its hood open. Numbered markers show the parts the registry keeps records of: VIN, mileage, engine service, part replacement, accident and repair.",
    view: "SIDE VIEW · HOOD OPEN",
    notToScale: "not to scale",
    oneVehicle: "one vehicle = one dNFT",
    wheelbase: "wheelbase",
    callouts: {
      vin: { label: "VIN", sub: "registry key" },
      km: { label: "Mileage", sub: "only goes up" },
      service: { label: "Scheduled service", sub: "engine · oil" },
      repair: { label: "Repair", sub: "body · paint" },
      parts: { label: "Part replacement", sub: "tyres · brakes" },
      accident: { label: "Accident record", sub: "permanent" },
    },
    caption: "Side view, hood open: each numbered point is a part the report keeps a record of.",
  },

  vehicle: {
    tag: "Vehicle registry report",
    revision: (n) => `Rev. ${n} ${n === 1 ? "record" : "records"}`,
    lastUpdated: (date) => `Last updated ${date}`,
    currentKm: "Current mileage",
    intro: "A vehicle registered under this VIN.",
    accidents: (n) => `It carries ${n} accident ${n === 1 ? "record" : "records"}.`,
    noAccidents: "No accident records.",
    summary: "Summary",
    detailsTable: "Vehicle details",
    rows: {
      vin: "VIN",
      km: "Mileage",
      kmSource: "latest record",
      records: "Records",
      recordsSource: "append-only",
      accidents: "Accidents",
      none: "None",
      accidentsSource: "permanent",
      updated: "Last updated",
      updatedSource: "block time",
    },
    previewNote:
      "The above is the public preview. The health score and the record-by-record history are in the full report.",
  },

  badge: {
    alt: "The vehicle's on-chain dNFT image",
    locked: "dNFT image locked",
    caption: "The dNFT rendered on-chain; redrawn with every record.",
  },

  score: {
    label: "Health score",
    good: "Clean history",
    warn: "Inspect carefully",
    bad: "Heavy damage on record",
    locked: "Unlocked in the full report",
  },

  report: {
    history: "Service history",
    unlocked: "● report unlocked",
    paidIn: (ms) => ` · payment confirmed in ${ms} ms`,
    unlockedIntro:
      "Every record since the car was new. Accident rows are highlighted; hover a date to see when it was written to the chain.",
    loading: "Reading records from the chain...",
    restricted: "Restricted",
    lockedIntro:
      "This section opens with the full report: the car's health score out of 100 and each record's date, mileage, note, signing garage and any photo.",
    fullReport: "Full report",
    oneTime: "MON · one-time",
    perkPermanent: "Unlocks this vehicle for your wallet, permanently",
    perkShare: (pct, garages) => (
      <>
        <b>{pct}%</b> of the fee is shared among the{" "}
        <b>
          {garages} {garages === 1 ? "garage" : "garages"}
        </b>{" "}
        that wrote this car&apos;s history
      </>
    ),
    perkFast: "Payment confirms on Monad in under a second",
    needWallet: "A wallet is needed to buy the report",
    paymentSent: "Payment sent to the network",
    unlock: "Unlock full report",
    alreadyPurchased: "This report is already unlocked for this wallet.",
  },

  records: {
    table: "Service records",
    no: "No.",
    date: "Date",
    km: "Km",
    work: "Work",
    garage: "Garage",
    notes: "Notes",
    writtenOn: (date) => `Written to the chain on ${date}`,
  },

  chart: {
    title: (count, min, max) =>
      `Mileage by service date. ${count} readings, lowest ${min} km, highest ${max} km.`,
    floor: (km) => `floor ${km} km`,
    legendKm: "Mileage",
    legendAccident: "Accident / heavy damage",
    legendFloor: "Current floor",
    caption:
      "Mileage by service date. The contract accepts no reading below the last one; the red line is the current floor.",
  },

  attachment: {
    open: "Open document",
    fullSize: "Open full size",
    alt: "Photo attached to the record",
  },

  notFound: {
    tag: "No record found",
    queryResult: "Query result",
    notRegistered: "Not registered",
    titleA: "This vehicle is",
    titleB: "not registered.",
    note: (
      <>
        This does <b>not</b> mean the car&apos;s history is clean — only that no garage has
        entered it in the registry yet.
      </>
    ),
    tryAnother: "Try another VIN",
  },

  errorPage: {
    tag: "Temporary error",
    titleA: "The chain can't be",
    titleB: "reached right now.",
    body: "The Monad network may be busy. Try again in a few seconds; the records are safe on-chain.",
    retry: "Try again",
    home: "Home",
  },

  missingPage: {
    tag: "Page not found",
    titleA: "This page",
    titleB: "doesn't exist.",
    body: "The address may be mistyped. You can look up a vehicle by its VIN.",
    home: "Home",
  },

  admin: {
    metaTitle: "Admin — CarLog",
    tag: "Admin panel",
    partnoSub: "Garage authorization",
    footLink: "Admin",

    loginTitleA: "Admin",
    loginTitleB: "sign-in.",
    loginBody:
      "The garage authorization screen. After signing in, granting access also needs the registry owner's wallet.",
    username: "Username",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Checking...",
    badLogin: "Wrong username or password.",
    signOut: "Sign out",

    titleA: "Garage",
    titleB: "authorization.",
    intro:
      "An approved address can add records and upload documents from the garage panel. Records written by a revoked garage stay on-chain.",

    sectionWallet: "Registry owner wallet",
    needOwner: "Authorization changes need the registry owner's wallet signature.",
    ownerConnected: "Registry owner wallet connected",
    notOwner: (owner) =>
      `The connected wallet isn't the registry owner. Connect with ${owner} to grant access.`,

    sectionGrant: "Grant access",
    address: "Garage wallet address",
    name: "Garage name",
    namePlaceholder: "Jury Garage",
    badAddress: "Enter a valid wallet address (42 characters starting with 0x).",
    needName: "Enter a garage name.",
    statusNow: "Current status",
    statusActive: "approved",
    statusRevoked: "revoked",
    statusNone: "not registered",
    grant: "Grant access",
    confirmed: (ms) => `Confirmed on-chain · ${ms} ms`,

    sectionList: "Registered garages",
    listTable: "Garage list",
    colName: "Garage",
    colAddress: "Address",
    colRecords: "Records",
    colStatus: "Status",
    colAction: "Action",
    revoke: "Revoke",
    restore: "Restore",
    loadingList: "Reading the list from the chain...",
    empty: "No approved garages yet.",
  },

  garage: {
    tag: "Service record form",
    approvedOnly: "Approved garages only",
    partnoSub: "Garage panel",
    titleA: "Add a service",
    titleB: "record.",
    intro: "Your record is written to the chain within seconds and can never be changed.",
    earnings: "Your report earnings",
    withdraw: "Withdraw",
    withdrawing: "Withdrawing",
    account: "My account",
    accountBalance: "Account balance",
    withdrawable: "Withdrawable report earnings",
    withdrawn: (amount) => `${amount} MON moved to your account`,
    viewOnExplorer: "View on explorer",
    copyAddress: "Copy address",
    copiedAddress: "Copied",
  },

  form: {
    phoneLogin: "Sign in with phone or e-mail",
    phoneLoginHint: "No wallet or MON needed; the platform pays the fees.",
    orWallet: "or with your own wallet",
    preparing: "Preparing your account...",
    signedInAs: (who) => `Signed in as ${who}`,
    gasFree: "Fees paid by the platform",
    signOut: "Sign out",
    giveAddress: "Send this address to the admin; refresh the page once approved.",
    copy: "Copy",
    copied: "Copied",
    connectLabel: "Step 0",
    connectTitle: "Connect your wallet",
    connectBody: "Connect to Monad Testnet with your approved garage wallet to add records.",
    checkingLabel: "Checking",
    checkingTitle: "Checking authorization",
    checkingBody: "Reading your wallet's permission to write to the registry from the chain.",
    refusedLabel: "Refused",
    refusedTitle: "This wallet isn't authorized",
    refusedBody:
      "Only approved garages can write to the registry. Send your address to the registry admin to request access.",

    confirmed: "Confirmed",
    registeredA: "Vehicle",
    registeredB: "registered.",
    writtenA: "Written to",
    writtenB: "the chain.",
    permanent: "The record can no longer be deleted or changed.",
    resultTable: "Transaction result",
    status: "Status",
    statusConfirmed: "confirmed",
    confirmTime: "Network confirmation time",
    vin: "VIN",
    tx: "Transaction",
    newRecord: "Add another record",

    sectionVehicle: "Vehicle",
    sectionWork: "Work",
    sectionEvidence: "Evidence",
    vinField: "Vehicle identification number (VIN)",
    registeredLine: (km, count) => (
      <>
        Registered — last mileage <b className="numeric text-ink">{km} km</b>, {count}{" "}
        {count === 1 ? "record" : "records"}
      </>
    ),
    newVehicle: "Not in the registry — you're opening its first record",
    newVehicleBody:
      "The mileage you enter becomes the vehicle's floor; no garage can go below it after this.",
    mileage: "Mileage",
    serviceDate: "Service date",
    owner: "Owner's wallet (optional)",
    ownerPlaceholder: "0x… — leave empty to keep it with the garage",
    workType: "Type of work",
    note: "Note (optional)",
    notePlaceholder: "Oil and filter change",
    firstEntryNote: "First registry entry",

    removeAttachment: "Remove attachment",
    uploading: "Uploading to IPFS...",
    signing: "Sign in your wallet to upload...",
    pickFile: "Choose a photo or invoice (optional)",
    uploadFallback: "You can still submit the record without it.",

    rollbackRejected: "Rejected by the chain: mileage can't go back.",
    sent: "Sent to the network",
    registerVehicle: "Register vehicle",
    submitRecord: "Record on Monad",

    problems: {
      vinLength: "The VIN must be 17 characters.",
      enterKm: "Enter the mileage.",
      kmPositive: "Mileage must be greater than zero.",
      rollback: (km) => `Recorded mileage is ${km}. A lower value will be rejected by the chain.`,
      enterDate: "Enter the service date.",
      futureDate: "The service date can't be in the future.",
      badOwner: "The owner's wallet isn't a valid address.",
    },
  },

  upload: {
    not_configured: "IPFS upload isn't configured.",
    bad_request: "Invalid request body.",
    no_file: "No file received.",
    too_large: "The file is over the 10 MB limit.",
    bad_type: "Only photos and PDFs can be uploaded.",
    unauthorized: "Only approved garages can upload documents.",
    signature_rejected: "The signature was rejected.",
    failed: "Upload failed.",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { tr, en };
