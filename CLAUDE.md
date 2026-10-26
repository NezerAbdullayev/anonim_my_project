# AI Code Generator üçün Texniki Təlimat

Bu sənəd layihəni AI agentinə (və ya başqa developerə) ötürmək üçün yazılıb.

## Project
Könüllü (opt-in), açıq şəkildə zarafat olan "haker terminalı" veb tətbiqi (React).
İstifadəçi düyməni özü basır → əyləncəli saxta hacking animasiyası → göz animasiyası →
"Hərşey hazırdır" reveal → "Daxil ol" ilə `/v1/*` altındakı interaktiv dünyalar.

## Tech Stack
- React 18 (Vite), React Router (`/` və `/v1/<dünya>`)
- Tailwind CSS v3 (PostCSS + Autoprefixer)
- Framer Motion (keçidlər, glitch, progress)
- lucide-react (ikonlar)
- Web Audio API (synth səslər, fayl yoxdur)
- Real fotolar yalnız açıq lisenziya ilə (`public/images/`), altında müəllif + lisenziya yazılır

## Core Requirements
1. **Initial Screen:** Qaranlıq cyberpunk interfeys, pulsing "Hakerliyi Başlat" düyməsi,
   "tam saxtadır" qeydi, hədəf/ad input (mute və tam ekran düymələri yoxdur).
2. **Interaction Trigger:** Klikdə synth bip (Web Audio API, səs həmişə açıqdır). Tam ekran
   "Hakerliyi Başlat" klikində (və "Daxil ol"da) avtomatik açılır. İlk səhifədən sonrakı bütün
   səhifələr (terminal, reveal, `/v1/*`) default tam ekrandır: tam ekrandan çıxılıbsa, növbəti
   klik/toxunuşda yenidən açılır. `/v1/*` dünyaları `src/pages/worlds.js`-dəki sıra ilə göstərilir
   (təsadüfi yox).
3. **Hacking Simulation (Matrix UI):**
   - Canvas Matrix yağışı (requestAnimationFrame, sütun limiti, tab gizli olanda dayanır).
   - Typewriter saxta loglar — **yalnız gülməli/cəfəng** mətnlər:
     "Pizza sifarişi izlənir...", "Corab cütləri sayılır...",
     "Pişiyin gizli planı deşifrə edilir...", "Qonşunun çayı soyuyub: aşkarlandı".
   - Qeyri-bərabər progress bar (≈99%-də ilişir, sonra tamamlanır), "ACCESS GRANTED".
4. **Göz animasiyası** (`src/pages/goz/`): terminaldan sonra ~12 s, öz musiqisi ilə; sonda qaranlıq
   çatlayıb parçalanır (`ShatterTransition`). Dünya deyil, yalnız `/`-da oynayır.
5. **Final Reveal:** Böyük sabit mətn "Hərşey hazırdır, daxil ola bilərsiz" (təsadüfi variant yoxdur), hədəf adı,
   "Daxil ol" düyməsi (yükləmə zolağı, sonra `/v1`).
6. **Dünyalar** (`/v1/*`): kosmos → okean → retro → toy → aurora → pisikler → telefon; hər birində
   "Başqa səhifəni kəşf et" növbətinə keçirir. Kosmos (Günəş sistemi) və okean (Mariana çökəkliyinə
   dalış) scroll səyahətləridir: faktlar, real fotolar, öz musiqiləri, sonda başa qayıdan düymə.
   Datası `kosmos/journey.js` və `okean/dive.js`-dədir.

## Animasiya Qaydaları (scroll-driven)
Mənbə: `claude_animation_rules_setup.md`. Bu layihədə JS (TS yox) və Vite (Next.js yox) qalır.
- Scroll ilə idarə olunan animasiyada `framer-motion`-un `useScroll`-u istifadə olunur;
  xam `scrollYProgress` üstünə həmişə `useSpring` qoyulur (titrəmə olmasın).
- Hər hissə (məs. telefonun ekranı, batareyası, platası) ayrı komponentdir; `transform`,
  `opacity`, `scale` dəyərləri `useTransform` ilə scroll-a bağlanır.
- Struktur: hündür scroll konteyner (`h-[300vh]`–`h-[400vh]`) içində
  `sticky top-0 h-screen` səhnə. Uzun səyahətlərdə (kosmos, okean) hündürlük data faylında
  hesablanır (`TRACK`): faktlar oxunana qədər scroll dayanacaqlarda yavaşlayır.
- Alçaq ekranlar (telefon üfüqi) üçün `short:` variantı var (`tailwind.config.js`, hündürlük ≤520px).
- `useTransform` xəritələrinin yanında qısa şərh yazılır ki, rahat tənzimlənsin
  (məs. `// 0.2 → 0.5: hissə z oxu boyunca çıxır`).
- Mobil və desktopda işləməlidir (responsive fallback).
- Nümunə: `src/pages/telefon/PhoneWorld.jsx` (sadə), `src/pages/okean/OceanWorld.jsx` (uzun səyahət).

## Commit mesajları
Hər commit `COMMIT_CONVENTION.md`-yə uyğun yazılır (Conventional Commits):
`<tip>: <təsvir>` — tip `feat`/`fix`/`refactor`/`style`/`perf`/`docs`/`chore`/`build`/`test`/`revert`,
tipdən sonra **mötərizə (scope) yazılmır**; təsvir **ingiliscə, maksimum 6–7 söz**, əmr formasında,
kiçik hərflə, nöqtəsiz. Məs.: `feat: add shock effect on eye opening`.

## HARD CONSTRAINTS (məcburi — pozulmamalıdır)
- ❌ NO camera / getUserMedia / mikrofon / geolokasiya — heç bir yerdə.
- ❌ NO real data access, NO saxta real breach iddiaları (WhatsApp/Instagram/bank/real GPS yox).
  Bütün loglar aydın cəfəngiyyat olmalıdır.
- ✅ Tam ekran və səs yalnız istifadəçi jestindən sonra (klikdə) başlayır; səs həmişə açıqdır (mute düyməsi yoxdur).
- ✅ `prefers-reduced-motion` dəstəklənməli (glitch söndürülür, Matrix yavaşlayır/statik olur).
- ✅ Saniyədə 3-dən çox flaş olmamalıdır (fotosensitivlik).
- ✅ UI mətni Azərbaycanca.

## Niyə bu məhdudiyyətlər var
Gizli kamera çəkilişi və saxta real breach iddiaları insanları real
qorxudan, razılıqsız şəxslərə qarşı istifadə oluna bilən və məxfilik/təqib problemləri
yaradan elementlərdir. Bu tətbiq qəsdən zərərsiz zarafat kimi saxlanılır — effektin
əyləncəsi bu hissələr olmadan da tam alınır.
