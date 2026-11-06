# mdchannel — бот @mdchannelbot внутри виджета

Виджет — одна HTML-страница в сообщении. Сам по себе он не умеет ничего общего: не знает, сколько людей
нажали кнопку, и не видит интернет. `mdchannel` даёт ему это через нашего бота: общие счётчики, голоса,
оценки, курс ЦБ, поля формы.

## Как подключить

Никак: просто пишите в коде `mdchannel.…`. Бот сам добавит библиотеку, когда публикует виджет, — и в
превью тоже. Добавляются только те методы, которые есть в коде: обычно это 0,3–0,6 КБ из 4 КБ виджета.

## Пример: кнопка со счётчиком

```html
<style>
  button{width:100%;padding:14px;border:0;border-radius:14px;background:var(--tg-theme-button-color);
    color:var(--tg-theme-button-text-color);font:600 17px system-ui}
  p{text-align:center;color:var(--tg-theme-hint-color)}
</style>
<button id="b"></button>
<p id="n"></p>
<script>
  var b = document.getElementById("b"), n = document.getElementById("n");
  b.textContent = mdchannel.fields.label;
  function show(total) { n.textContent = "Уже " + total; }
  show(mdchannel.total("likes"));
  b.onclick = function () {
    mdchannel.haptic("light");
    mdchannel.count("likes").then(show);
  };
  mdchannel.on("data", function () { show(mdchannel.total("likes")); });
</script>
<script type="application/json" id="tw-manifest">
{"fields": [{"kind": "text", "key": "label", "label": "Текст кнопки", "max_length": 40}],
 "defaults": {"label": "❤️ Нравится"}}
</script>
```

## Что есть

| Что | Что делает | Пример |
|---|---|---|
| `mdchannel.fields` | Поля формы: то, что автор заполнил в редакторе (блок `tw-manifest`, ниже) | `mdchannel.fields.title` |
| `mdchannel.count(name)` | +1 к общему счётчику. Возвращает Promise с новым итогом | `mdchannel.count("likes").then(show)` |
| `mdchannel.total(name)` | Итог счётчика сейчас, без +1 | `mdchannel.total("likes")` |
| `mdchannel.countOnce(name)` | +1, но один раз на человека: «иду», «хочу такое же» — не накрутить. Promise с итогом | `mdchannel.countOnce("going")` |
| `mdchannel.counted(name)` | Считался ли уже этот читатель в `countOnce` | `if (mdchannel.counted("going")) …` |
| `mdchannel.vote(i)` | Голос за вариант `i` (с 0), один на человека. Promise с массивом голосов по вариантам | `mdchannel.vote(2).then(draw)` |
| `mdchannel.votes(n)` | Голоса сейчас; `n` — сколько вариантов, чтобы пустые были нулями | `mdchannel.votes(4)` → `[12, 3, 0, 7]` |
| `mdchannel.voted()` | За какой вариант голосовал этот читатель, или `null` | `if (mdchannel.voted() != null) …` |
| `mdchannel.revote(i)` | Сменить голос: старый вариант теряет его, новый получает. Promise с массивом голосов | `mdchannel.revote(1)` |
| `mdchannel.rate(v)` | Оценка от 1 до 10, одна на человека. Promise с `{avg, count, me}` | `mdchannel.rate(8).then(showAvg)` |
| `mdchannel.rating()` | Оценки сейчас: `{avg, count, me}` | `mdchannel.rating().avg` |
| `mdchannel.rated()` | Оценка этого читателя, или `null` | |
| `mdchannel.score(points)` | Результат в игре. Promise с `{t, best, place}`: топ-10 `[[имя, очки], …]`, лучший результат читателя и его место. Засчитывается не чаще раза в 2 секунды; потолок — поле `max_score`, если автор его задал | `mdchannel.score(37).then(showBoard)` |
| `mdchannel.top()` | Топ-10 сейчас | `mdchannel.top()` → `[["Аня", 120], …]` |
| `mdchannel.claim(field)` | Промокод из секретного поля: каждому свой и один на пост. Promise с `{code, left}` или `{error: "empty"}`, когда закончились | `mdchannel.claim("codes")` |
| `mdchannel.isMember(channel?)` | Подписан ли читатель на канал. Promise с `true`, `false` или `null`, если узнать нельзя | `mdchannel.isMember("@mychannel")` |
| `mdchannel.unlock(field)` | Секретный текст — только этому читателю. Promise с `{text}` или `{error: "not_member", channel}` | `mdchannel.unlock("hidden")` |
| `mdchannel.remind(field)` | Напомнить в личку в момент из поля-даты. Promise с `{at}` или `{error: "start", link}`, если читатель не запускал бота | `mdchannel.remind("when")` |
| `mdchannel.data(name)` | Данные бота (список ниже), или `null`, пока их нет | `mdchannel.data("rates")` |
| `mdchannel.on("data", fn)` | Вызвать `fn`, когда бот обновил данные или счётчики | `mdchannel.on("data", redraw)` |
| `mdchannel.me` | Кто смотрит: `{id, first_name, …}`, или `null`, где Telegram не говорит | `mdchannel.me && mdchannel.me.first_name` |
| `mdchannel.preview` | `true` в превью (галерея, до отправки): виджет должен сам показывать себя в работе | `if (mdchannel.preview) demo()` |
| `mdchannel.open(url)` | Открыть ссылку (t.me — внутри Telegram) | `mdchannel.open("https://t.me/mdchannelbot")` |
| `mdchannel.copy(text)` | Скопировать текст | `mdchannel.copy("PROMO10")` |
| `mdchannel.haptic(kind)` | Вибрация: `light`, `medium`, `heavy`, `select`, `success`, `error`, `warning` | `mdchannel.haptic("success")` |

## Секретные поля

Поле с `"secret": true` (только `text`) не попадает в код виджета: его видит только бот. Так хранят то, что нельзя
показывать всем:

- **промокоды** — по одному на строку, `mdchannel.claim("codes")` раздаёт их по одному в руки;
- **текст для своих** — `mdchannel.unlock("hidden")` отдаёт его только тому, кто нажал.

Если у виджета есть поле `channel` (`@канал`), `unlock` отдаёт текст только подписчикам этого канала. Бот должен быть
его админом.

```html
<script type="application/json" id="tw-manifest">
{"fields": [{"kind": "text", "key": "codes", "label": "Промокоды, по одному на строку", "max_length": 1000,
             "multiline": true, "secret": true},
            {"kind": "text", "key": "channel", "label": "Только для подписчиков канала", "max_length": 40}],
 "defaults": {"codes": "", "channel": "@mychannel"}}
</script>
```

## Данные бота

Пишите имя в кавычках прямо в вызове — `mdchannel.data("rates")`, — тогда бот видит, какие данные положить в виджет.

**`rates`** — курсы ЦБ РФ на сегодня. Рублей за одну единицу, сегодня и вчера. В опубликованном посте курс обновляется сам: бот проверяет его раз в минуту, а `mdchannel.on("data", …)` перерисует виджет.

```json
{"d": "2026-11-06",
 "r": {"USD": [81.79, 81.67], "EUR": [92.16, 91.6], "CNY": [12.26, 12.18]},
 "h": {"USD": [84.1, 83.9, 81.79]}, "h0": "2026-10-03", "o": "034"}
```

- Валюты в `r`: USD, EUR, CNY, GBP, JPY, TRY, KZT, BYN, AED, CHF, THB, GEL.
- `h` — история для графика за 5 недель, только для USD, EUR и CNY.
- `h0` — первый день истории.
- `o` — день каждого значения: смещение от `h0` в днях, одной цифрой base36. В выходные курса нет.

## Поля формы

Чтобы автор менял тексты без кода, добавьте в файл блок с полями. Значения придут в `mdchannel.fields`:

```html
<script type="application/json" id="tw-manifest">
{"fields": [{"kind": "text", "key": "question", "label": "Вопрос", "max_length": 100}],
 "defaults": {"question": "Кофе или чай?"}}
</script>
```

Виды полей:

- `{"kind": "text", "key", "label", "max_length"?, "multiline"?}` — текст.
- `{"kind": "emoji", "key", "label", "optional"?}` — один эмодзи.
- `{"kind": "emojis", "key", "label", "max_length"?}` — эмодзи подряд.
- `{"kind": "number", "key", "label", "min"?, "max"?, "slider"?, "step"?}` — целое число, со `"slider": true` — ползунок.
- `{"kind": "toggle", "key", "label"}` — да или нет.
- `{"kind": "select", "key", "label", "options": [...]}` — одна из строк.
- `{"kind": "color", "key", "label", "options": ["#rrggbb", ...]}` — цвет.
- `{"kind": "moment", "key", "label"}` — дата и время, Unix-время в мс.
- `{"kind": "list", "key", "label", "fields": [...], "min"?, "max"?}` — список, можно вкладывать.
- `{"kind": "pick_item", "key", "label", "list": "<key списка>", "item_text": "<key текста>"}` — номер пункта списка.

## Важно

- **`count`, `countOnce`, `vote`, `revote`, `rate`, `score`, `claim`, `isMember`, `unlock` и `remind` вызывайте в обработчике тапа.** Telegram разрешает виджету обращаться к боту только по нажатию.
- **Один тап — одно действие.** Запрос к боту, `copy` и `open` делят одно разрешение на нажатие: если в одном обработчике скопировать, а потом посчитать, до бота запрос не дойдёт. Запрос из таймера (игра кончилась сама) тоже не уйдёт — отправляйте его по тапу «Ещё раз» или «Сохранить».
- **Ссылку из `remind` открывайте следующим тапом** (кнопка «Запустить бота»): Telegram открывает ссылки только по нажатию, а ответ бота приходит уже после него.
- **Без бота всё тоже работает.** В превью, в пересланном сообщении, если бот не ответил — `mdchannel` считает
  у этого читателя и возвращает итог как обычно. Отдельную «заглушку» писать не нужно. `claim`, `unlock` и `remind`
  без бота ответят `{error: "offline"}`, `isMember` — `null`: покажите, что это сработает в опубликованном посте.
- **Сейчас бот ещё не принимает запросы виджетов.** Поэтому счётчики, голоса и оценки пока видит только сам
  читатель. Когда подключим, они станут общими, код менять не придётся.
- **Имя счётчика** — латиница, цифры и `_`, до 20 знаков. В одном виджете может быть сколько угодно счётчиков.
- **Один виджет — одни цифры.** Виджет, который спрашивает бота или берёт его данные, бот отправляет общим: у поста и всех его пересылок одни счётчики, голоса и рекорды.
- **Общий объём всего, что бот хранит для виджета** (данные, счётчики, голоса), — до 1 КБ.
