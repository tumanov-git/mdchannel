---
name: mdchannel
description: Write Telegram widgets for @mdchannelbot — one HTML file shown live in a message (polls, games, counters, rates, promo codes). Use when asked to make a widget for a Telegram channel or for @mdchannelbot, or to use the mdchannel library (shared counters, votes, ratings, the Central Bank rates, form fields).
---

# Telegram-виджет для @mdchannelbot

Виджет — одна HTML-страница, которая работает прямо в сообщении Telegram. Готовый файл автор загружает в
@mdchannelbot: «Новый виджет» → «Свой виджет». Ответь **одним HTML-файлом**.

Полная документация: https://github.com/tumanov-git/mdchannel (`docs/mdchannel.md`, `docs/widgets.md`).

## Жёсткие правила Telegram

- **Один файл:** стили и скрипт внутри.
- **Размер:** после zlib-9 не больше 4096 байт, сам файл до 32 КБ. Пиши компактно, без комментариев.
- **Сети нет:** внешние картинки, шрифты, `fetch` не работают. Картинки — эмодзи, CSS, SVG, canvas. Данные извне — только через `mdchannel.data`.
- **Высота:** до 600 px и постоянная, пока виджетом пользуются. Все экраны (вопрос, ответ, итог) в одной коробке фиксированной высоты.
- **Цвета из темы:** `var(--tg-theme-bg-color)`, `var(--tg-theme-text-color)`, `var(--tg-theme-hint-color)`, `var(--tg-theme-button-color)`, `var(--tg-theme-button-text-color)`.
- **Не больше 16 «тяжёлых» элементов одновременно:** `box-shadow`, `filter`, `opacity` < 1, анимации `opacity`/`filter`/`box-shadow`. Иначе Telegram остановит виджет. Появление и мигание — через цвет, `transform`, `background`.
- **Не работают:** 3D-трансформации, `backdrop-filter`, `filter` кроме `blur`, SMIL, GIF.
- **Анимации:** без `fill:"forwards"` (конечный стиль задай элементу сам), элемент после анимации удаляй через 300 мс. Иначе после 64 анимаций движок перестаёт рисовать.
- **Не читай размеры раскладки:** `clientWidth`, `getBoundingClientRect`, `offsetX` в превью дают 0. Размечай в процентах или в canvas фиксированного размера (CSS `width:100%;height:100%`). Зоны нажатия — отдельные элементы со своими обработчиками.
- **Демо:** если `mdchannel.preview`, виджет сам по кругу показывает себя в работе, в спокойном темпе.
- **Управление — тапами.** Свайп вбок на iPhone начинает ответ на сообщение.

## mdchannel — бот внутри виджета

Подключать не нужно: просто пиши `mdchannel.…`, бот вставит библиотеку сам.

| Что | Что делает |
|---|---|
| `mdchannel.fields` | поля формы (блок `tw-manifest` ниже) |
| `mdchannel.count(name)` → Promise<число> | +1 к общему счётчику; `mdchannel.total(name)` — итог сейчас |
| `mdchannel.countOnce(name)` → Promise<число> | +1 один раз на человека («иду», «хочу») |
| `mdchannel.vote(i)` → Promise<[голоса]> | голос за вариант `i` с 0, один на человека; `votes(n)`, `voted()`; `revote(i)` — сменить голос |
| `mdchannel.rate(1..10)` → Promise<{avg, count, me}> | оценка, одна на человека; `rating()`, `rated()` |
| `mdchannel.data("rates")` | данные бота или `null`; `mdchannel.on("data", fn)` — обновились |
| `mdchannel.score(n)` → Promise<{t, best, place}> | рекорд: топ-10 `[[имя, очки]]`, лучший и место читателя; `top()` |
| `mdchannel.claim("codes")` → Promise<{code, left}> | промокод из секретного поля, каждому свой; `{error:"empty"}` — кончились |
| `mdchannel.isMember("@канал")` → Promise<true/false/null> | подписан ли читатель (бот — админ канала) |
| `mdchannel.unlock("hidden")` → Promise<{text}> | секретный текст только этому читателю; `{error:"not_member"}`, `{error:"not_paid"}` |
| `mdchannel.remind("when")` → Promise<{at}> | напомнить в личку в момент из поля-даты; `{error:"start", link}` |
| `mdchannel.me` | кто смотрит или `null` |
| `mdchannel.preview` | `true` в превью: показывай демо |
| `mdchannel.open(url)`, `copy(text)`, `haptic(kind)` | ссылка, копирование, вибрация (`light`, `select`, `success`, `error`…) |

Ещё правила для `mdchannel`:
- Один тап — одно действие: запрос к боту, `copy`, `open` делят одно разрешение на нажатие. Из таймера запрос не уйдёт.
- Все запросы к боту (`count`, `countOnce`, `vote`, `revote`, `rate`, `score`, `claim`, `isMember`, `unlock`, `remind`) — только в обработчике тапа. Ссылку из ответа `remind` открывай следующим тапом.
- Секретное поле: `{"kind":"text",…,"secret":true}` — его видит только бот (промокоды по строке, текст для своих). У `unlock` условие по полю `channel` (только подписчики).
- Без бота (превью, пересылка) библиотека считает у читателя сама. Заглушки не пиши.
- `rates` — курсы ЦБ: `{"d":"2026-11-06","r":{"USD":[сегодня, вчера],…},"h":{"USD":[…]},"h0":"…","o":"…"}`. История `h` есть для USD, EUR, CNY за 5 недель; `o` — день каждого значения, смещение от `h0` в днях цифрой base36.

## Поля формы

Тексты, которые автор будет менять без кода, вынеси в поля. Значения придут в `mdchannel.fields`:

```html
<script type="application/json" id="tw-manifest">
{"fields": [{"kind": "text", "key": "question", "label": "Вопрос", "max_length": 100},
            {"kind": "color", "key": "color", "label": "Цвет", "options": ["#007aff", "#34c759", "#ff9500"]}],
 "defaults": {"question": "Кофе или чай?", "color": "#007aff"},
 "height": 320}
</script>
```

- **Виды полей:** `text`, `emoji`, `emojis`, `number` (`"slider": true` — ползунок), `toggle`, `select` (`"labels"` — подписи вариантов в форме), `color`, `moment` (мс), `list` (вложенные `fields`), `pick_item`.
- **`key`** — латиницей, **`label`** — по-русски.
- **`"height"`** — высота при ширине 340 px.

## Пример

```html
<style>button{width:100%;padding:14px;border:0;border-radius:14px;background:var(--tg-theme-button-color);color:var(--tg-theme-button-text-color);font:600 17px system-ui}p{text-align:center;color:var(--tg-theme-hint-color)}</style>
<button id="b"></button><p id="n"></p>
<script>
var b=document.getElementById("b"),n=document.getElementById("n");
b.textContent=mdchannel.fields.label;
function show(t){n.textContent="Уже "+t}
show(mdchannel.total("likes"));
b.onclick=function(){mdchannel.haptic("light");mdchannel.count("likes").then(show)};
mdchannel.on("data",function(){show(mdchannel.total("likes"))});
</script>
<script type="application/json" id="tw-manifest">{"fields":[{"kind":"text","key":"label","label":"Текст кнопки","max_length":40}],"defaults":{"label":"❤️ Нравится"},"height":110}</script>
```

## Проверь перед ответом

- [ ] Один файл, без внешних ссылок и сети.
- [ ] Высота постоянная, `"height"` указан.
- [ ] Цвета из темы, не больше 16 тяжёлых элементов.
- [ ] Нет чтения размеров раскладки.
- [ ] Есть демо по `mdchannel.preview`.
- [ ] Тексты — в полях, читаются из `mdchannel.fields`.
