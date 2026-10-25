# Hakerlik Simulyatoru (zarafat)

Dostlarınıza göstərmək üçün əyləncəli, **tam saxta** "haker terminalı" animasiyası.

## Necə işlətmək olar

```bash
npm install
npm run dev
```

Sonra brauzerdə terminalda göstərilən ünvanı (adətən http://localhost:5173) açın.

Production üçün: `npm run build` və `npm run preview`.

## Bu nədir?

- Hədəf adı yazırsınız, "Hakerliyi Başlat" düyməsinə basırsınız və yaşıl-qara matrix animasiyası ilə sırf gülməli (pizza, corab, pişik, ay) saxta log sətirləri axır.
- Sonda "Zarafat idi!" mesajı çıxır. Dostunuza göndərmək üçün paylaş düyməsi var.

## Zərərsizdir və könüllüdür

- Heç bir real məlumata girişi yoxdur, heç nə oxunmur, heç nə göndərilmir.
- Kamera, mikrofon və məkan (geolokasiya) istifadə olunmur.
- Animasiya yalnız siz düyməyə basdıqdan sonra başlayır.
- Tam ekran "Hakerliyi Başlat" klikində avtomatik açılır, səs də yalnız kliklə başlayır və həmişə açıqdır.
- `prefers-reduced-motion` nəzərə alınır, işıqlanma saniyədə 3-dən azdır.
