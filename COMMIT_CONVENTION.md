# Commit mesajı qaydaları

Bu layihədə commit mesajları [Conventional Commits](https://www.conventionalcommits.org/) standartına uyğun yazılır, amma **sahə (scope) mötərizəsi işlədilmir**.

## Format

```
<tip>: <qısa təsvir>
```

- **tip** — məcburidir, aşağıdakı siyahıdan biri (kiçik hərflə). Tipdən dərhal sonra `:` və bir boşluq gəlir.
- Tipdən sonra **mötərizə yazılmır**: `feat(eye): ...` ❌ → `feat: ...` ✅
- **qısa təsvir** — **ingiliscə**, **maksimum 6–7 söz**:
  - əmr formasında: `add`, `fix`, `remove`, `update` (`added` / `adds` yox);
  - kiçik hərflə başlayır;
  - sonunda nöqtə qoyulmur.

## Tiplər

| Tip | Nə vaxt |
|---|---|
| `feat` | Yeni funksiya, səhifə, animasiya |
| `fix` | Xətanın düzəldilməsi |
| `refactor` | Davranışı dəyişməyən kod yenidən quruluşu |
| `style` | Yalnız görünüş/format: CSS, şrift, boşluqlar |
| `perf` | Performans yaxşılaşdırması |
| `docs` | Yalnız sənədlər: `.md` faylları, şərhlər |
| `chore` | Köməkçi işlər: paketlər, `.gitignore`, konfiqurasiya |
| `build` | Build sistemi, Vite/Tailwind konfiqurasiyası |
| `test` | Testlər |
| `revert` | Əvvəlki commit-in geri qaytarılması |

## Nümunələr

```
feat: add shock effect on eye opening
fix: clamp negative audio schedule times
style: use Exo 2 font for title
refactor: move worlds into page folders
docs: add commit message convention
chore: ignore IDE settings folder
```

## Əlavə qeydlər

- Bir commit = bir məntiqi dəyişiklik. Fərqli işlər ayrı commit-lərdə olsun.
- Ətraflı izah lazımdırsa, başlıqdan sonra bir boş sətir buraxıb gövdəyə yazılır. Gövdə Azərbaycanca və ya ingiliscə ola bilər.
- Geriyə uyğunluğu pozan dəyişiklik: tipdən sonra `!` (`feat!: ...`) və gövdədə `BREAKING CHANGE:` qeydi.
