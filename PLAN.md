# Layihə Planı — "Hakerlik Simulyatoru (zarafat)"

## 1. Məqsəd
Könüllü (opt-in) işləyən, açıq şəkildə zarafat olan "haker terminalı" veb tətbiqi.
İstifadəçi düyməni **özü** basır, əyləncəli saxta "hacking" animasiyası oynayır
(Matrix yağışı, gülməli loglar, saxta progress bar, glitch, synth səslər), göz animasiyası
qaranlığı parçalayır və "Hərşey hazırdır, daxil ola bilərsiz" ekranı çıxır. "Daxil ol"
istifadəçini `/v1/*` altındakı interaktiv "dünyalara" aparır. Dostlara göstərmək üçün
party-trick formatı.

## 2. Texnologiya Stack-i
- **Framework:** React 18 + Vite, marşrutlar üçün React Router
- **Styling:** Tailwind CSS (v3) + PostCSS + Autoprefixer
- **Animasiya:** Framer Motion (scroll səhnələri: `useScroll` + `useSpring` + `useTransform`)
- **İkonlar:** lucide-react
- **Audio:** Native Web Audio API (fayl yoxdur, synth səslər)
- **Fotolar:** real, açıq lisenziyalı şəkillər (`public/images/`), müəllif və lisenziya hər şəklin altında

## 3. Fayl Strukturu
```
├── index.html
├── package.json, vite.config.js, postcss.config.js, tailwind.config.js
├── README.md
├── PLAN.md                 # bu fayl
├── CLAUDE.md               # AI üçün texniki təlimat
├── COMMIT_CONVENTION.md    # commit mesajı qaydaları
├── public/images/          # planet səthləri, qara dəlik, okean/ (okean canlıları)
└── src/
    ├── main.jsx            # giriş nöqtəsi (MotionConfig reducedMotion="user")
    ├── index.css           # tailwind + glitch/scanline CSS + reduced-motion
    ├── App.jsx             # marşrutlar: "/" və /v1/<dünya>
    ├── fullscreen.js       # tam ekran: klikdə açılır, çıxılıbsa növbəti toxunuşda geri qayıdır
    ├── audio/
    │   ├── soundEffects.js # terminal bip/alarm synth
    │   ├── uiSound.js      # hər düymənin klik səsi
    │   ├── revealMusic.js  # reveal səhifəsinin ambient musiqisi
    │   ├── spaceMusic.js   # kosmos səyahətinin musiqisi
    │   └── oceanMusic.js   # okean dalışının musiqisi
    ├── components/
    │   ├── Landing.jsx           # giriş ekranı, ad input, Başlat düyməsi
    │   ├── MatrixRain.jsx        # canvas Matrix yağışı (dekorativ)
    │   ├── HackerTerminal.jsx    # saxta loglar + progress + glitch
    │   ├── ShatterTransition.jsx # gözün qaranlığı çatlayıb parçalanır
    │   └── PrankReveal.jsx       # "Hərşey hazırdır..." + "Daxil ol"
    └── pages/
        ├── home/HomePage.jsx  # "/": landing → terminal → göz → reveal
        ├── goz/               # göz animasiyası və musiqisi (dünya deyil, yalnız "/"-da)
        ├── v1/WorldsLayout.jsx# /v1/* qabığı: keçid + "Başqa səhifəni kəşf et"
        ├── worlds.js          # dünyaların sırası
        ├── shared/            # AnimatedTitle, util
        ├── kosmos/            # Günəş sistemi səyahəti (bax §5)
        ├── okean/             # Okeanın dibinə dalış (bax §6)
        ├── kohne-baki/        # Köhnə Bakı: 900 illik time-lapse (fotosuz SVG)
        ├── toy/  aurora/  pisikler/  telefon/
```

## 4. İstifadəçi Axını
1. **landing** (`/`): başlıq, "tam saxtadır" qeydi, hədəf/ad input, "Hakerliyi Başlat" düyməsi.
   Mute və tam ekran düymələri yoxdur. Tam ekran Başlat klikində avtomatik açılır.
2. **running**: tam ekran terminal. Matrix yağışı, typewriter saxta loglar, qeyri-bərabər
   progress bar (≈99%-də ilişir), glitch və səslər. "ACCESS GRANTED" ilə bitir. Esc landing-ə qaytarır.
3. **eye**: göz animasiyası (~12 s, öz musiqisi ilə). Sonda qaranlıq çatlayıb parçalanır.
4. **reveal**: sabit mətn "Hərşey hazırdır, daxil ola bilərsiz", hədəf adı, "Daxil ol" düyməsi
   (yükləmə zolağı, sonra `/v1`).
5. **/v1/<dünya>**: `worlds.js`-dəki sıra ilə: kosmos → okean → kohne-baki → toy → aurora → pisikler → telefon,
   sonuncudan sonra yenidən kosmos. "Başqa səhifəni kəşf et" düyməsi növbəti dünyaya keçirir.
   Bütün bu səhifələr default tam ekrandır.

## 5. Kosmos dünyası (`/v1/kosmos`)
Scroll ilə Günəş sistemi səyahəti: Günəşin səthinə yaxınlaşma, sonra hər planet öz faktları və
real səth fotosu ilə (Saturnun qütb altıbucağı, Uranın Webb şəkli, Neptunun Böyük Qara Ləkəsi və s.),
asteroid qurşağı, Neptundan sonra Oxatan A* qara dəliyi, ağ dəlik və "Yenidən başla".
Faktlar və marşrut: `kosmos/journey.js`.

## 6. Okean dünyası (`/v1/okean`)
Scroll ilə səthdən Mariana çökəkliyinin Çellencer dərinliyinə (10 935 m) dalış. Bütün data və
scroll xəritəsi `okean/dive.js`-dədir.

**Zonalar:** hər zona təxminən bərabər scroll payı alır, dərinlik zonanın içində xətti dəyişir.
Hər zona öz kartı ilə açılır, canlılar və nişanlar real dərinliklərində çıxır və faktları oxunana
qədər scroll yavaşlayır (hold).

| Zona | Dərinlik | Dayanacaqlar |
|------|----------|--------------|
| Günəşli (epipelagik) | 0–200 m | kloun balığı, delfinlər, yaşıl tısbağa, sardina sürüsü, mavi balina |
| Alatoran (mezopelagik) | 200–1 000 m | Humboldt kalmarı, balta balığı, fənərli balıq, sifonofor |
| Gecəyarısı (batipelagik) | 1 000–4 000 m | kaşalot, **Baykal xətti (1 642 m)**, Atolla meduzası, pelikan ilanbalığı, **Titanik (3 800 m)** |
| Uçurum (abissopelagik) | 4 000–6 000 m | "qara siqaret çəkən", ştativ balıq, dumbo ahtapotu, dəniz donuzu |
| Çökəklik (hadal) | 6 000–10 935 m | ksenofiofor, Mariana ilbizbalığı, **Everest xətti (8 849 m)**, nəhəng amfipod, dibə enənlər (Trieste 1960, Kemeron 2012, Veskovo 2019) |
| Dib | 10 935 m | Çellencer dərinliyi kartı + "Səthə qayıt ↑" |

**Komponentlər:**
- `WaterColumn`: suyun rəngi, səth və günəş şüaları
- `MarineSnow`: canvas "dəniz qarı"
- `Terrain`: uçurum düzənliyi və çökəkliyin V divarları
- `DepthHud`: dərinlik, təzyiq, temperatur, işıq və real miqyaslı zona zolağı
- `ZoneTitle`, `Creature`, `Landmark`: zona kartı, canlı və nişan dayanacaqları
- `Seabed`: dib və final kartı

**Musiqi** (`audio/oceanMusic.js`): dərinləşdikcə akkordlar alçalır və boğuqlaşır, dalğa səsi
itir, uğultu artır, dərində sonar siqnalları eşidilir.

**Mobil:** dik telefonda foto üstdə, mətn altda olur. Alçaq ekranlarda (`short`, hündürlük ≤520px)
yığcam layout işləyir.

## 7. Agent Quruluşu
Layihə köməkçi agentlərlə quruldu, hamısı **Claude Sonnet** ilə:

| Agent | Rol | Nə etdi |
|-------|-----|---------|
| **Biznes Analitik** | Fikir / konsept | İstifadəçi axını, prioritetləşdirilmiş xüsusiyyət siyahısı, 3 alternativ istiqamət, UX tələləri |
| **Developer** | Kod | React + Vite + Tailwind + Framer Motion ilə faylları yazır (`.claude/agents/developer.md`) |
| **Tester** | QA | `npm install` + `npm run build` yoxladı, təhlükəsizlik qaydalarını və kompilyasiyanı təsdiqlədi |

Orkestrasiyanı əsas (Opus) agent aparır: BA → Developer → Tester → təhvil.

## 8. Dizayn Qaydaları (təhlükəsizlik / etika)
Tətbiq qəsdən **zərərsiz və açıq zarafat** kimi qurulub. Bu qaydalar məcburidir:
- ✅ Animasiya yalnız istifadəçi klikindən sonra başlayır (gizli başlatma yoxdur).
- ✅ Bütün loglar aydın cəfəngiyyatdır (pizza, corab, pişik). Real breach iddiası yoxdur.
- ✅ Səs və tam ekran yalnız jestdən (klikdən) sonra başlayır. Səs həmişə açıqdır (mute yoxdur).
- ✅ `prefers-reduced-motion` dəstəklənir. Saniyədə 3-dən çox flaş yoxdur.
- ✅ Kamera, mikrofon, geolokasiya yoxdur. Real data oxunmur.
- ✅ Dünyalardakı faktlar maarifləndiricidir, fotolar açıq lisenziyalıdır və müəllifi göstərilir.

## 9. Sonrakı İşlər (nice-to-have)
- Qalan dünyaları (toy, aurora, pisikler) kosmos və okean kimi scroll səyahətinə çevirmək.
- Okean faktlarını mənbələrlə yoxlamaq (bəzi rəqəmlər təxminidir).
- Temalar, rejimlər, lokallaşdırma.
