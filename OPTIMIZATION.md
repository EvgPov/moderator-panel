# Оптимизация страницы «Медиатека» (`pages/PhotosPage.tsx`)

## 1. Лишние перерисовки строк списка

### Проблема
Компонент `PhotoRow` перерисовывался при каждом рендере родителя `PhotosPage`:
при вводе в поиск, клике «В избранное», тике таймера. Каждая строка вызывает
`simulateHeavyRender()`, поэтому перерисовка всех строк блокировала интерфейс.

Причин две:
- `PhotoRow` не был обёрнут в `React.memo`, поэтому React перерисовывал его
  вместе с родителем, даже если пропсы не изменились;
- обработчик `handleToggleFavorite` создавался заново при каждом рендере
  `PhotosPage`. Даже с `memo` строка получала бы «новый» пропс `onToggleFavorite`
  и всё равно перерисовывалась.

### Решение
1. `PhotoRow` обёрнут в `memo`: строка перерисовывается, только если изменились
   её пропсы (`photo`, `isFavorite`, `onToggleFavorite`).
2. `handleToggleFavorite` обёрнут в `useCallback` с пустым массивом зависимостей.
   Чтобы не зависеть от `favorites`, state обновляется через функцию-обновлятор
   `setFavorites(prev => ...)`: React сам передаёт актуальный массив.
   Функция создаётся один раз, и ссылка на неё не меняется между рендерами.

```tsx
const PhotoRow = memo(function PhotoRow({ photo, isFavorite, onToggleFavorite }: PhotoRowProps) {
  simulateHeavyRender();
  // ...
});

const handleToggleFavorite = useCallback((id: number) => {
  setFavorites(prev => {
    let next: number[];
    if (prev.includes(id)) {
      next = prev.filter(prevId => prevId !== id);
    } else {
      next = [...prev, id];
    }
    return next;
  });
}, []);
```
### Результат
- При клике «В избранное» перерисовывается только одна строка — та,
  у которой изменился `isFavorite`. Остальные строки пропускают рендер.
- При тике таймера строки не перерисовываются совсем: их пропсы не меняются.
- `simulateHeavyRender()` вызывается только для строк, которые действительно
  изменились, а не для всего списка при каждом рендере родителя.

## 2. Фильтрация и сортировка 5000 записей на каждом рендере

### Проблема
Список `visiblePhotos` вычислялся прямо в теле компонента: два `filter` и `sort`
по 5000 записям выполнялись при **каждом** рендере `PhotosPage` — на каждом
тике таймера и при клике «В избранное», хотя ни поиск, ни альбом, ни сортировка
не менялись. Сортировка через `localeCompare` особенно дорогая.

Кроме того, `query.toLowerCase()` вызывался внутри `filter`, то есть заново
для каждой из 5000 записей, хотя результат всегда один и тот же.

### Решение
1. Вычисление обёрнуто в `useMemo` с зависимостями
   `[photos, albumId, query, sortOrder]` — ровно теми значениями, которые
   используются внутри. Список пересчитывается, только когда пользователь
   меняет фильтр, сортировку или приходят новые данные.
2. Строка поиска приводится к нижнему регистру один раз перед фильтрацией
   (`normalizedQuery`), а не для каждой записи.

```tsx
const visiblePhotos = useMemo(() => {
  const normalizedQuery = query.toLowerCase();
  return (photos ?? [])
    .filter(photo => albumId === 'all' || photo.albumId === Number(albumId))
    .filter(photo => photo.title.toLowerCase().includes(normalizedQuery))
    .sort((a, b) =>
      sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
}, [photos, albumId, query, sortOrder]);
```

### Результат
- При тике таймера и клике «В избранное» фильтрация и сортировка не выполняются:
  `useMemo` возвращает сохранённый массив.
- Ссылка на `visiblePhotos` между такими рендерами не меняется, поэтому
  объекты `photo`, передаваемые в `PhotoRow`, остаются теми же — это
  поддерживает работу `memo` из пункта 1.
- Логика не изменилась: результат пересчитывается при любом изменении
  поиска, альбома или сортировки.

  ## 3. Таймер перерисовывал всю страницу каждую секунду

### Проблема
Счётчик «Вы на странице N с» хранился в state самой `PhotosPage`
(`secondsOnPage`). `setInterval` каждую секунду вызывал `setSecondsOnPage`,
и React перерисовывал всю страницу: тулбар, счётчики и список из 5000 строк.
Из-за этого страница подтормаживала, даже когда пользователь ничего не делал.

При этом значение секунд нужно только одному абзацу текста.

### Решение
Таймер вынесен в отдельный компонент `SecondsOnPage` со своим state и
`setInterval` (перенос состояния вниз, state colocation). Теперь тик таймера
меняет state только этого компонента, и перерисовывается только он, а
`PhotosPage` и список не затрагиваются.

Чтобы сохранить исходную логику (отсчёт идёт с момента открытия страницы,
включая время загрузки), `PhotosPage` один раз запоминает момент открытия
`openedAt` и передаёт его в таймер. Таймер вычисляет секунды как разницу
между текущим временем и `openedAt`. `openedAt` задаётся один раз и не меняется,
поэтому новых перерисовок `PhotosPage` не добавляет.

```tsx
type SecondsOnPageProps = {
  openedAt: number;
};

function SecondsOnPage({ openedAt }: SecondsOnPageProps) {
  const [secondsOnPage, setSecondsOnPage] = useState(
    () => Math.floor((Date.now() - openedAt) / 1000)
  );

  useEffect(() => {
    const timer = setInterval(
      () => setSecondsOnPage(Math.floor((Date.now() - openedAt) / 1000)),
      1000
    );
    return () => clearInterval(timer);
  }, [openedAt]);

  return <p className="muted">Вы на странице {secondsOnPage} с</p>;
}

// в PhotosPage
const [openedAt] = useState(() => Date.now());
// ...
<SecondsOnPage openedAt={openedAt} />
```

### Результат
- При тике таймера перерисовывается только `SecondsOnPage` — один абзац текста.
- `PhotosPage`, тулбар и строки списка в простое больше не перерисовываются.
- Внешний вид и логика не изменились: счётчик по-прежнему считает время
  с момента открытия страницы. Секунды вычисляются от `openedAt`, поэтому
  значение остаётся точным, даже если браузер замедляет `setInterval`
  в фоновой вкладке.

## 4. Фильтрация на каждое нажатие клавиши в поиске

### Проблема
Поле поиска меняло `query` на каждую букву, а `query` был зависимостью
`useMemo`. Поэтому на каждое нажатие заново выполнялись фильтрация и сортировка
5000 записей и перерисовывался список. Пока шли вычисления, поле ввода
не успевало обновиться, и поиск реагировал с задержкой.

### Решение
Значение поиска разделено на два:
- `query` — привязан к `<input>` и обновляется сразу, на каждую букву;
- `debouncedQuery = useDebounce(query, 500)` — используется в `useMemo`
  и обновляется только через 500 мс после окончания ввода.

Используется хук `useDebounce`, уже реализованный в проекте (задача 2).

```tsx
const debouncedQuery = useDebounce(query, 500);

const visiblePhotos = useMemo(() => {
  const normalizedQuery = debouncedQuery.toLowerCase();
  // ...
}, [photos, albumId, debouncedQuery, sortOrder]);
```

### Результат
- Поле ввода отзывается мгновенно: на каждую букву обновляется только
  `query`, без пересчёта списка.
- Фильтрация и сортировка выполняются один раз после окончания ввода,
  а не на каждое нажатие.
- Логика не изменилась: итоговый результат поиска тот же.

## 5. В DOM рендерились все 5000 строк списка

### Проблема
Список выводил все отфильтрованные записи сразу — до 5000 элементов `PhotoRow`,
хотя в контейнер высотой 500px помещается около 9 строк. Это давало:
- тысячи DOM-узлов, которые браузеру нужно создать, разместить и отрисовать;
- тысячи вызовов `simulateHeavyRender()` при первом показе и при каждой
  смене фильтра или сортировки;
- при любом рендере `PhotosPage` React обходил все 5000 элементов
  и сравнивал их пропсы, даже если строки не менялись.

### Решение
Список виртуализирован с помощью `useVirtualizer` из `@tanstack/react-virtual`.
Виртуализатор следит за прокруткой контейнера `.photo-list` и отдаёт только
те строки, которые сейчас видны, плюс небольшой запас сверху и снизу (`overscan`).

- Внутри контейнера стоит блок высотой `getTotalSize()` — полная высота всех
  строк. Благодаря ему полоса прокрутки выглядит так же, как для полного списка.
- Видимые строки позиционируются абсолютно через `transform: translateY(start)`.
- Высота строки `estimateSize: () => 56` взята из CSS (`.photo-row { height: 56px }`,
  `box-sizing: border-box`), поэтому внешний вид не изменился.

```tsx
const parentRef = useRef<HTMLDivElement>(null);

const virtualizer = useVirtualizer({
  count: visiblePhotos.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 56,
  overscan: 5,
});

const virtualItems = virtualizer.getVirtualItems();

// ...

<div className="photo-list" ref={parentRef}>
  <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
    {virtualItems.map(virtualRow => {
      const photo = visiblePhotos[virtualRow.index];
      return (
        <div
          key={photo.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualRow.start}px)`,
          }}
        >
          <PhotoRow
            photo={photo}
            isFavorite={favorites.includes(photo.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      );
    })}
  </div>
</div>
```

### Результат
- В DOM одновременно находится около 15–20 строк вместо 5000.
- `simulateHeavyRender()` вызывается только для видимых строк — при открытии
  страницы, смене фильтра и при прокрутке для появляющихся строк.
- Смена поиска, альбома и сортировки обрабатывается быстро: перерисовываются
  только видимые строки.
- Внешний вид и логика не изменились: высота контейнера, строки, прокрутка,
  счётчики и избранное работают как раньше.