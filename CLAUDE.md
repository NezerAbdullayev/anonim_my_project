# AI Code Generator üçün Texniki Təlimat

Bu sənəd layihəni AI agentinə (və ya başqa developerə) ötürmək üçün yazılıb.

## Project
Könüllü (opt-in), açıq şəkildə zarafat olan "haker terminalı" veb tətbiqi (React).
İstifadəçi düyməni özü basır → əyləncəli saxta hacking animasiyası → "zarafat idi" reveal.

## Tech Stack
- React 18 (Vite)
- Tailwind CSS v3 (PostCSS + Autoprefixer)
- Framer Motion (keçidlər, glitch, progress)
- lucide-react (ikonlar)
- Web Audio API (synth səslər, fayl yoxdur)

## Core Requirements
1. **Initial Screen:** Qaranlıq cyberpunk interfeys, pulsing "Hakerliyi Başlat" düyməsi,
   "tam saxtadır" qeydi, hədəf/ad input (mute və tam ekran düymələri yoxdur).
2. **Interaction Trigger:** Klikdə synth bip (Web Audio API, səs həmişə açıqdır). Tam ekran
   "Hakerliyi Başlat" klikində (və "Yenidən"də) avtomatik açılır. İlk səhifədən sonrakı bütün
   səhifələr (terminal, reveal, `/v1/*`) default tam ekrandır: tam ekrandan çıxılıbsa, növbəti
   klik/toxunuşda yenidən açılır. `/v1/*` dünyaları `src/pages/worlds.js`-dəki sıra ilə göstərilir
   (təsadüfi yox).
3. **Hacking Simulation (Matrix UI):**
   - Canvas Matrix yağışı (requestAnimationFrame, sütun limiti, tab gizli olanda dayanır).
   - Typewriter saxta loglar — **yalnız gülməli/cəfəng** mətnlər:
     "Pizza sifarişi izlənir...", "Corab cütləri sayılır...",
     "Pişiyin gizli planı deşifrə edilir...", "Qonşunun çayı soyuyub: aşkarlandı".
   - Qeyri-bərabər progress bar (≈99%-də ilişir, sonra tamamlanır), "ACCESS GRANTED".
4. **Final Reveal:** Böyük sabit mətn "Hərşey hazırdır, daxil ola bilərsiz" (təsadüfi variant yoxdur), hədəf adı,
   "Yenidən" və "Dostuna göndər" (navigator.share + clipboard fallback).

## Animasiya Qaydaları (scroll-driven)
Mənbə: `claude_animation_rules_setup.md`. Bu layihədə JS (TS yox) və Vite (Next.js yox) qalır.
- Scroll ilə idarə olunan animasiyada `framer-motion`-un `useScroll`-u istifadə olunur;
  xam `scrollYProgress` üstünə həmişə `useSpring` qoyulur (titrəmə olmasın).
- Hər hissə (məs. telefonun ekranı, batareyası, platası) ayrı komponentdir; `transform`,
  `opacity`, `scale` dəyərləri `useTransform` ilə scroll-a bağlanır.
- Struktur: hündür scroll konteyner (`h-[300vh]`–`h-[400vh]`) içində
  `sticky top-0 h-screen` səhnə.
- `useTransform` xəritələrinin yanında qısa şərh yazılır ki, rahat tənzimlənsin
  (məs. `// 0.2 → 0.5: hissə z oxu boyunca çıxır`).
- Mobil və desktopda işləməlidir (responsive fallback).
- Nümunə: `src/pages/telefon/PhoneWorld.jsx`.

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
