# HISTORY — Affiliate 3D-print site (passed_links.txt)

> Рабочая папка: `C:\Users\1999d\OneDrive\Documents\Default Project\3d-prinr-site`
> Источник товаров: Creative Fabrica (198 URL в `passed_links.txt`)
> Формат страниц: `папка/index.html` (без сборщиков, чистый HTML5, как в `create_html_prompt.txt`)
> Язык всего видимого текста: английский.

---

## 1. Что изучено
- `create_html_prompt.txt` — промпт генерации одностраничного HTML-каталога: извлечение названия/описания/картинки с Product URL, уникальные заголовки (Title Case, 6-12 слов) и описания (50-85 слов), кнопка `DOWNLOAD DESIGN`, `rel="nofollow sponsored noopener noreferrer"`, `target="_blank"`, JSON-LD `ItemList`, адаптив, системные шрифты, без внешних CSS/JS. Этот стиль переиспользуем карточками товаров.
- `passed_links.txt` — 198 товаров 3D-печати (STL/3MF). Названия разбирались ТОЛЬКО по slug, страницы не открывались (как и просили).
- Сгенерирован артефакт `_page_assignment.md` — полная раскладка каждого товара по страницам (один товар = одна страница, по приоритету), для использования при сборке.

## 2. Предложенная структура сайта (папки = страницы)
```
/index.html                    — главная: все темы карточками
/christmas/index.html          — Рождество / Зима
/halloween/index.html          — Хэллоуин
/easter/index.html             — Пасха / Весна
/valentine/index.html          — Валентин / Любовь
/wedding/index.html            — Свадьба
/dragons-fantasy/index.html    — Драконы / Фэнтези
/flexi-toys/index.html         — Флекси-игрушки (артикулированные)
/planters/index.html           — Плантеры / Горшки
/lamps-lights/index.html       — Подсвечники / Ночники / Лампы
/organizers/index.html         — Органайзеры / Холдеры
/keychains-accessories/index.html — Ключницы / Аксессуары / Вырезы
/decor-figurines/index.html    — Декор / Фигурки / Статуэтки
/gothic-dark/index.html        — Готика / Тёмная эстетика
/kawaii-cute/index.html        — Kawaii / Милые
/education/index.html          — Образование / Детское
```

## 3. Разбор passed_links.txt по категориям (198 товаров)
Первичная раскладка (каждый товар на ОДНУ страницу, приоритет: wedding→valentine→easter→halloween→christmas→dragons→gothic→kawaii→flexi→planters→lamps→education→keychains→organizers→decor).

| Страница | Товаров | Комментарий |
|---|---|---|
| christmas | 22 | отлично покрыто (reindeer, snowman, nutcracker, santa, elf, angel) |
| halloween | 23 | отлично (ghost, witch, skeleton, straw-toppers, cauldron, light-stand) |
| easter | 14 | хорошо (bunny, gnome, egg, farm-animals, sakura) |
| valentine | 8 | нормально (rose, heart-vase, bear-heart, storage-box) |
| wedding | 1 | **ОЧЕНЬ мало** — только `wedding-dress-makeup-brush-holder`; `dress-jewelry-holder` ушёл в organizers. Реально ~1-3 шт. |
| dragons-fantasy | 17 | хорошо (dragon, baby-dragon, skeleton, phoenix, bust, shelf) |
| gothic-dark | 8 | нормально (coffin, skull, cathedral, rococo brush-holders) |
| kawaii-cute | 15 | хорошо (cloud, owl, penguin, chibi-kitty, sleeping-dino) |
| flexi-toys | 11 | умеренно (octopus, snake, axolotl, gecko, stingray, hedgehog, bear, starfish, chameleon, cat) |
| planters | 5 | **маловато** (happy-face, book, geometric, faceted-vase, monstera, bookshelf) — можно добавить vases из valentine/heart |
| lamps-lights | 9 | нормально (night-light, candle-holder, wind-spinner, ginkgo-lamp, light-house) |
| education | 7 | нормально (alphabet-bead, letters, graduation, planner, musical, letter-organizer) |
| keychains-accessories | 27 | много, **доминируют clay-cutter/earring/floral** (~15 шт однотипных) + keychains, badges, magnets, backpack |
| organizers | 16 | хорошо (phone/pen/brush holders, bowls, coasters, boxes, trays) |
| decor-figurines | 15 | хорошо (balloon-dog, castle-birdhouse, statue, mermaid, alien, duck, bull, diamond) |

**Итого: 198** (покрыты все 15 страниц).

### Наблюдения / что можно улучшить
1. **Wedding (1)** и **planters (5)** — самые тонкие. Wedding в принципе скудный в `passed_links.txt`; либо оставить как маленькую страницу, либо слить в `valentine`/общую. Planters можно усилить, перенеся туда `heart-vase` и `faceted-vase` из valentine/decor.
2. **Пересечения** (ожидаемы): brush-holder'ы распределились между `gothic` (rococo/cathedral/skull), `kawaii` (cloud), `organizers` (quilted/floral/vanity) — это логично. Clay-cutter'ы почти все в `keychains-accessories`.
3. **Однотипный шум в keychains**: ~15 `clay-cutter-stl-floral-earring-*` почти одинаковые — на странице их лучше сгруппировать компактной сеткой, а не длинным списком, иначе будет выглядеть спамом.
4. **`snow-flurry-texture-roller-stl-file`** ушёл в decor по умолчанию — это текстурный ролик/каттер, логичнее в `keychains-accessories`. Перенести при сборке.
5. Товары можно дублировать на 2 страницы (напр. halloween-kawaii на обе) ради охвата, но для SEO лучше держать один primary + перекрёстные ссылки внизу.

## 4. План сборки (когда перейдём к коду)
- Каждый `папка/index.html` = категорийная страница: H1 + вступление + сетка/список карточек товаров (картинка + уник. заголовок + описание + кнопка `DOWNLOAD DESIGN` → исходный URL, `rel="nofollow sponsored noopener noreferrer"`, `target="_blank"`).
- **Картинки** берутся прямо с Product URL (полноразмерные, убираем суффикс `-ЧИСЛОxЧИСЛО` перед расширением) — как описано в `create_html_prompt.txt`, этап 1.
- **Правый стики-блок с рекламой 3D-принтеров**: двухколоночный макет (контент + правая колонка `position: sticky`). На мобильных — сворачивается/скрывается.
  - **Файл картинки:** `printer-ad.png`
  - **Куда положить:** папка `assets/` в корне сайта → `assets/printer-ad.png`
  - **Размер рекомендую:** вертикальный баннер ~300×600 px (CSS адаптирует под колонку).
  - **Ссылка блока:** пока `#` (плейсхолдер) → потом заменю на ваш affiliate-URL на 3D-принтеры.
  - Вы загрузите картинку сами; до этого блок будет показывать серый плейсхолдер с подписью.
- Дизайн: светлый фон, белые карточки, мягкие тени, скругления, системный шрифт, без Google Fonts/фреймворков/JS (кроме JSON-LD). Главная `/index.html` — карточки всех 15 тем с ссылками на разделы.

## 5. Открытые вопросы (уточнить ДО сборки)
- **«используя hallmark»** — значение неясно. Трактую как «фирменный узнаваемый стиль/качество на всех страницах» (единый header/footer, палитра, компоновка карточек). Если имелся в виду конкретный инструмент/фреймворк — уточните.
- Нужно ли дублировать товары на смежные страницы или строго одна страница на товар?
- Реальный affiliate-URL для блока 3D-принтеров (или оставляем `#`)?
- Wedding оставляем отдельной страницей (будет почти пустой) или объединяем?

---
## 6. ИТОГ СБОРКИ (выполнено)

Решения пользователя:
- **hallmark** = анти-AI-слоп дизайн (применён скилл high-end-visual-design в адаптации под чистый HTML/CSS: тёплый «бумажный» фон + зерно, серифные заголовки системным шрифтом, скруглённые радиусы, мягкие тени, eyebrow-теги, пилюлеобразные кнопки со вложенной иконкой, кастомный cubic-bezier hover, стики-блок рекламы).
- Тонкие страницы **объединены** (по инструкции «мало → убрать/слить»):
  - `wedding` → слит в **valentine** (→ «Valentine's & Wedding»)
  - `education` → слит в **flexi-toys** (→ «Flexi Toys & Learning»)
  - `planters` → слит в **decor** (→ «Decor, Planters & Figurines»)
- Итого: **13 страниц** = главная + 12 тематических.

### Структура (готова, все файлы в `3d-prinr-site/`)
```
index.html                         — главная: 12 тем карточками + стики-блок
christmas/      (17)   halloween/    (22)   easter/     (15)
valentine/      (9)    dragons-fantasy/ (18) flexi-toys/ (17)
lamps-lights/   (10)   organizers/   (23)   keychains-accessories/ (28)
decor-planters/ (22)   gothic-dark/  (8)    kawaii-cute/ (9)
```
Всего карточек товаров: **198** (проверено). Каждый товар: уникальный H2 (Title Case) + уникальное описание (2 предложения, английский) + кнопка `DOWNLOAD DESIGN` → исходный URL с `rel="nofollow sponsored noopener noreferrer"`, `target="_blank"`. JSON-LD `ItemList` на каждой странице.

Файлы: `assets/style.css`, `assets/printer-ad.svg` (плейсхолдер рекламы), `assets/ph-<theme>.svg` (12 тематических плейсхолдеров картинок), `fetch-images.js`, `build.js`, `verify.js`, `data/*.json` (контент по страницам).

### Картинки — ВАЖНО
Creative Fabrica **блокирует серверные запросы (403)**, а headless-браузер Playwright в этом окружении не установился. Поэтому реальные фото автоматом скачать здесь нельзя. Решение:
- Карточки сейчас ссылаются на `assets/img/<slug>.webp` с `onerror`-фолбэком на тематический `assets/ph-<theme>.svg` — сайт выглядит заполненным и не битым.
- Реальные фото подгружаются одним скриптом локально (он открывает страницы в реальном браузере и обходит 403):
  ```
  npx playwright install chromium
  node fetch-images.js
  ```
  Скрипт скачает `og:image` каждого товара в `assets/img/<slug>.webp`. **Править страницы не нужно** — фолбэк сам заменится на фото.

### Рекламный блок 3D-принтеров (стики, справа)
- Блок `position: sticky` в правой колонке, на мобильных сворачивается.
- Ссылка на баннер: **`assets/printer-ad.png`** — положите сюда свой баннер ≈300×600 (пока фолбэк `printer-ad.svg`).
- Ссылка блока сейчас `#` (плейсхолдер). Дайте affiliate-URL на принтеры → я пересоберу (`build.js` → `adRail`) или замените `href="#"` в блоке рекламы вручную.

### Что осталось сделать пользователю
1. Залить баннер `printer-ad.png` в `assets/` (или заменить ссылку `#` на свой affiliate-URL).
2. При смене бренда/текстов — править `data/*.json` + перезапуск `build.js`.

---
## 7. РЕАЛЬНЫЕ КАРТИНКИ ЗАГРУЖЕНЫ (выполнено)

Проблема 403 решена через скилл **browser-use** + браузер пользователя **Comet** (Perplexity, Chromium 151):
- `browser-use` (pip, v0.13.10) подключается к Comet через CDP: `BU_CDP_URL=http://127.0.0.1:9222`.
- Comet запущен с `--remote-debugging-port=9222 --profile-directory="Profile 3"` (ограничение Chromium 136+ на дефолтный user-data-dir НЕ сработало — флаг принят).
- Скрипт `_extract.py` прогнал все 198 страниц через ОДНУ вкладку (goto_url + чтение og:image/og:title), порциями по 40 с сохранением прогресса в `_fetch_state.json`.
- Результат: **198/198 OK, ноль капч/предупреждений**. Сами картинки CDN качались напрямую (Invoke-WebRequest) — **198/198, 0 ошибок**, в `assets/img/` (136 png, 61 jpg, 1 jpeg).
- `build.js` теперь читает `_fetch_state.json` и подставляет реальное расширение (`imgFile(slug)`); страницы пересобраны. Проверка: 396 ссылок на картинки, 0 битых, 0 ссылок на `.webp`.
- Разрешение конфликтов: пип-пакет `browser-use` обновил `starlette` (конфликт с `fastapi` в Python-окружении пользователя, программы Windows/браузеры не затронуты).

Восстановление Comet в обычный режим: закрыть и открыть как обычно (без флагов). Отладочный порт живёт только пока Comet запущен с флагом.

Dev-артефакты (сайту не нужны, но полезны для пересборки): `_extract.py`, `_fetch_state.json`, `_assignment.json`, `build.js`, `verify.js`, `assign.js`, `fetch-images.js` (больше не нужен — заменён связкой browser-use + Comet).

### Осталось (по решению пользователя)
1. **Редизайн фона/стиля** — белесый фон выглядит как слоп; переделать арт-направленность страниц.
2. Баннер `printer-ad.png` в `assets/` + affiliate-URL для стики-блока (сейчас `#`).

---
## 8. РЕДИЗАЙН ПОД SHOPVIBE (выполнено)

Пользователь дал дизайн-систему `shopvibe-DESIGN.md` и 4 референс-компонента (React). Перенесено на ванильный HTML/CSS/JS:

1. **ShopVibe-токены** в `assets/style.css`: Primary #D946EF (CTA), Secondary #22D3EE, Tertiary #FACC15, фон #FAFAFA, поверхность #FFF, текст #171717/#525252/#A3A3A3, бордеры #E5E5E5/#D4D4D4; радиусы 4/12/16/24/9999; Material-тени (включая Product Hover с фуксиа-отливом); шрифты Poppins/Nunito/Space Mono через Google Fonts (офлайн — системный фолбэк); чипы 34px, кнопки-пилюли.
2. **Рекламный блок = 3D-карточка** (порт InteractiveProductCard): aspect 9/12, радиус 24, `printer-ad.webp` фоном, градиент, glassmorphism-шапка, пилюля «Shop printers →», декоративные точки, 3D-tilt на mousemove (±8°, perspective 1000px, только для мыши — `assets/site.js`).
3. **Карточки товаров = «большая карточка с текстом»** (порт PlaceCard, без цен/рейтингов — их нельзя выдумывать): фото 280px cover с чипами (номер + «3D Model»), заголовок Poppins 20, мета-строка, описание, футер «via Creative Fabrica» + кнопка «Download Design» со стрелкой; hover translateY(-3px) + фуксиа-тень.
4. **Главная-герой = «текст слева + картинка появляется»** (порт HeroSection): текст слева (overline, display 56/800, фуксиа-акцентбар, CTA «Browse the themes», мета 3 пункта с иконками), справа `assets/main.webp` с clip-path reveal анимацией (polygon → 1.2s circOut). На мобиле — колонкой.
5. **Бургер-меню для телефона** (порт GSAP-меню на CSS/JS): кнопка Menu/Close с плюсом, вращающимся в X; фуллскрин-панель справа со слоистым выездом (3 слоя: fuchsia-soft/cyan-soft/white, stagger 0.06s, ease cubic-bezier(.65,.01,.05,.99) — как CustomEase из референса), ссылки выезжают снизу с каскадом; закрытие по крестику/оверею/Esc/клику по ссылке. Виден <980px, на десктопе чипы.
6. **Рекламная ссылка** подключена на всех страницах: `https://rzekl.com/g/1e8d11449451da3d44eb16525dc3e8/?ulp=...aliexpress...3D-Printer.html` (rel nofollow sponsored).

Медиа: `assets/main.webp` (герой), `assets/printer-ad.webp` (3D-баннер) — скопированы из `D:\Downloads`. ВАЖНО: в этой сессии модель не поддерживает image input — содержимое картинок НЕ просматривалось, подключены с cover-подгонкой.

Проверка после сборки: 198 карточек, 0 отсутствующих локальных ассетов, main.webp/printer-ad.webp/affiliate-link/site.js на всех страницах. `assets/site.js` — единственный внешний JS (бургер + tilt), подключается defer.

---
## 9. ИТЕРАЦИЯ v3 (по фидбеку) — выполнено

1. **Баннер:** убраны надписи «Sponsored» и «Sponsored affiliate link…». Серый экран починен: у `.card3d` убран фон (картинка с translateZ(-20px) рендерилась ПОЗАДИ фона карточки) и отрицательный Z у картинки; `backdrop-filter` в стек-шапке заменён на полупрозрачный тёмный фон (не ломает 3D).
2. **Центрирование:** `.layout` max-width 1150 + margin auto; колонка статей/карточек `.main` max-width 820; баннер правее без растяжения.
3. **«via Creative Fabrica»** удалена со всех карточек (кнопка справа).
4. **Десктоп-меню:** дропдаун «Themes ▾» (12 тем: эмодзи + название + кол-во, hover-пилюля) + «Blog». Чипы в ряд убраны. Мобильный бургер сохранён (+ пункт Blog).
5. **Блог:** `/blog/` хаб + 3 оригинальные статьи (тексты написаны с нуля по темам источников modelica3d.ru/habr/iqb — не копипаст, копирайт): подготовка модели к печати (чек-лист), софт для 3D-печати, первая неделя с принтером. Перелинковка: статьи↔категории (rt-карточки), статьи↔статьи (prev/next), категории→блог («Useful reading» row-карточки), главная→блог.
6. **Главная = воронка:** герой (сохранён) → темы с 3 tip-блоками между карточками (PLA vs PETG, print-in-place, финишная обработка) → «From theme to printed shelf» (3 шага, Space Mono цифры) → «From the blog» (3 карточки) → фуксиа CTA-баннер «Not sure where to start?» → Flexi Toys. Рекламный баннер с главной убран (на остальных 12 страницах есть).
7. **Юридические страницы:** `/privacy/` (Privacy & Cookies: нет своих кук/трекеров, аффилиатная атрибуция на стороне мерчантов) и `/terms/` (Terms of Use: лицензии моделей определяет CF, as-is, IP). Ссылки в футере всех страниц.
8. **Отчёт по ссылкам:** в `passed_links.txt` — **198**, использовано **198 (100%)**, неиспользованных **0**. Распределение: christmas 17, halloween 22, easter 15, valentine 9, dragons 18, flexi 17, lamps 10, organizers 23, keychains 28, decor 22, gothic 8, kawaii 9.

Итого сайт: **19 HTML-страниц** (главная + 12 тем + блог-хаб + 3 статьи + privacy + terms).

---
## 10. ИТЕРАЦИЯ v4 (по фидбеку) — выполнено

1. **Горизонтальное переполнение устранено** — виновник: реклама-картинка `scale(1.08)` вылезала за контейнер у края экрана. Заменено на `.c3d-imgwrap` с `overflow:hidden` + `overflow-x: clip` на html/body.
2. **Центрирование:** `.layout` = 3 колонки `1fr | auto(≤820px) | 1fr` — статья строго по центру экрана, реклама в правом поле; на 1280px и ниже — 2 колонки, на мобильных — стопка.
3. **Интро перед каждой моделью:** `data/intros.json` — 198 уникальных строк-подводок («№ 01 · …»), вставляются перед карточкой.
4. **Блог расширен до 20 гайдов** (`articles.js`): подготовка модели, софт, первая неделя, FDM vs Resin, филаменты, адгезия, поддержки, print-in-place, настройки слайсера, stringing/warping, покраска, мультицвет без AMS, новогодние подарки, хэллоуин-пропсы, подарки на 14 февраля, Пасха с детьми, апгрейды стола, безопасность, хранение филамента, скорость vs качество. У каждой статьи «Put it into practice» → 3 категории; у каждой категории «Useful reading» → 3 подобранных статьи (READING-карта); на главной — 3 featured.
5. **Affiliate note** убран из футера, живёт в `/privacy/` (раздел Affiliate disclosure).
6. **Оптимизация:** удалены `fetch-images.js`, `_page_assignment.md`; все 198 картинок конвертированы в **WebP** (sharp, 1100px, q82): **282.7 МБ → 10.5 МБ**. `build.js` сам находит файлы на диске (`imgFile()` сканирует assets/img, приоритет webp). Весь сайт теперь **11.7 МБ**.
7. **Мобильная оптимизация:** бургер-меню (полноэкранное), реклама уходит под контент, сетки в 1-2 колонки, кнопки на всю ширину, уменьшенные отступы, `prefers-reduced-motion`.
8. **Все 198 ссылок перезаписаны с рефом:** `…/product/<slug>/ref/16881082/` — 792 вхождений (198×3 в карточках + 198 в JSON-LD), непереписанных — 0.

Итог: **36 страниц** (главная + 12 тем + блог-хаб + 20 статей + privacy + terms), 198/198 товаров, 11.7 МБ.

---
## 11. ИТЕРАЦИЯ v5 (по фидбеку) — выполнено

1. **Реклама наезжала на контент** — причина: фиксированные 300px баннера в колонке ~166px (сетка жалась в `.wrap` 1240px). Решение: `.layout` вынесен из `.wrap` на всю ширину экрана, колонка статьи `≤820px` строго по центру, ширина баннера вычисляется: `min(300px, calc((100vw - 820px)/2 - 60px))` — физически не может пересечь контент. <1240px — двухколоночный фолбэк, <980px — баннер уходит под контент.
2. **Подводки стали заметными:** `.p-intro` теперь 16.5px тёмным текстом, номер модели — фуксиа-пилюлей. Они были в HTML и раньше (проверено), но выглядели слишком блёкло.
3. **Чистота корня:** все dev-файлы (build.js, assign.js, verify.js, articles.js, data/, _assignment.json, _fetch_state.json, _extract.py, passed_links.txt, create_html_prompt.txt, HISTORY.md) переехали в **`_dev/`**; скрипты обновлены (DEV/ROOT). В корне только HTML-страницы + `assets/`. **`assets/site.js` — часть сайта** (мобильное меню + 3D-наклон баннера), не мусор.

Структура корня: `index.html`, 12 папок тем, `blog/`, `privacy/`, `terms/`, `assets/`, `_dev/`.
