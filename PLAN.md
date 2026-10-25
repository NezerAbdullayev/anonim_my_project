# Layihə Planı — "Hakerlik Simulyatoru (zarafat)"

## 1. Məqsəd
Könüllü (opt-in) işləyən, açıq şəkildə zarafat olan "haker terminalı" veb tətbiqi.
İstifadəçi düyməni **özü** basır, əyləncəli saxta "hacking" animasiyası oynayır
(Matrix yağışı, gülməli loglar, saxta progress bar, glitch, synth səslər) və sonda
"Zarafat idi! 😄" ekranı çıxır. Dostlara göstərmək / paylaşmaq üçün party-trick formatı.

## 2. Texnologiya Stack-i
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (v3) + PostCSS + Autoprefixer
- **Animasiya:** Framer Motion
- **İkonlar:** lucide-react
- **Audio:** Native Web Audio API (fayl yoxdur, synth səslər)

## 3. Fayl Strukturu
```
my_new_prank/
├── index.html
├── package.json
├── vite.config.js
├── postcss.config.js
├── tailwind.config.js
├── .gitignore
├── README.md
├── PLAN.md                 # bu fayl
├── CLAUDE.md               # AI üçün texniki təlimat
└── src/
    ├── main.jsx            # giriş nöqtəsi (MotionConfig reducedMotion="user")
    ├── index.css           # tailwind + glitch/scanline CSS + reduced-motion
    ├── App.jsx             # state machine: landing -> running -> reveal
    ├── audio/
    │   └── soundEffects.js # Web Audio API synth bip/alarm (həmişə açıq, mute yoxdur)
    └── components/
        ├── Landing.jsx        # giriş ekranı, ad input, Başlat düyməsi
        ├── MatrixRain.jsx     # canvas Matrix yağışı (dekorativ)
        ├── HackerTerminal.jsx # saxta loglar + progress + glitch
        └── PrankReveal.jsx    # final "zarafat idi" ekranı + paylaş
```

## 4. İstifadəçi Axını (State Machine)
1. **landing** — başlıq, "tam saxtadır" qeydi, hədəf/ad input, "Hakerliyi Başlat" düyməsi,
   (mute və tam ekran düymələri yoxdur; tam ekran Başlat klikində avtomatik açılır).
2. **running** — tam ekran terminal: Matrix yağışı + typewriter saxta loglar +
   qeyri-bərabər progress bar (≈99%-də ilişir) + glitch + səslər. "ACCESS GRANTED" ilə bitir.
3. **reveal** — "Zarafat idi! 😄" (8 variantdan təsadüfi), hədəf adı, "Yenidən" və
   "Dostuna göndər" (navigator.share + clipboard fallback).

## 5. Addım-addım Qurma (MVP ardıcıllığı)
1. Landing + Başlat.
2. Matrix canvas + saxta loglar + progress bar.
3. Reveal ekranı + Yenidən + Paylaş.
4. Glitch + səs + ad fərdiləşdirməsi.
5. (Nice-to-have) temalar, rejimlər, lokallaşdırma.

## 6. Agent Quruluşu (bu layihədə istifadə olunan)
Layihə 3 köməkçi agentlə (hamısı **Claude Sonnet** — kiçik iş üçün kifayətdir) quruldu:

| Agent | Rol | Nə etdi |
|-------|-----|---------|
| **Biznes Analitik** | Fikir / konsept | İstifadəçi axını, prioritetləşdirilmiş xüsusiyyət siyahısı, 3 alternativ istiqamət, UX tələləri |
| **Developer** | Kod | React + Vite + Tailwind + Framer Motion ilə bütün faylları yazdı |
| **Tester** | QA | `npm install` + `npm run build` yoxladı (uğurlu), təhlükəsizlik qaydalarını və kompilyasiyanı təsdiqlədi, kiçik buglar üçün hesabat verdi |

Orkestrasiya əsas (Opus) agent tərəfindən aparıldı: BA → Developer → Tester → təhvil.

## 7. Dizayn Qaydaları (təhlükəsizlik / etika)
Tətbiq qəsdən **zərərsiz və açıq zarafat** kimi qurulub. Bu qaydalar məcburidir:
- ✅ Animasiya yalnız istifadəçi klikindən sonra başlayır (gizli başlatma yoxdur).
- ✅ Bütün loglar aydın cəfəngiyyatdır (pizza, corab, pişik) — real breach iddiası yoxdur.
- ✅ Səs və tam ekran yalnız jestdən (klikdən) sonra başlayır; səs həmişə açıqdır (mute yoxdur).
- ✅ `prefers-reduced-motion` dəstəklənir; saniyədə 3-dən çox flaş yoxdur.
