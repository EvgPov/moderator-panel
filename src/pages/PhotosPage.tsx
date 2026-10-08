import { useEffect, useState, memo, useCallback, useMemo, useRef } from 'react';
import { endpoints } from '../api/endpoints';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { useFetch } from '../hooks/useFetch';
import type { Photo } from '../types';
import { simulateHeavyRender } from '../utils/simulateHeavyRender';
import { useDebounce } from '../hooks/useDebounce';
import { useVirtualizer } from '@tanstack/react-virtual';

// Задача 6 (сделано): оптимизация медиатеки.
// Исправлено пять проблем производительности, подробности в OPTIMIZATION.md.
// Логика и внешний вид страницы не изменились.

const ALBUM_IDS = Array.from({ length: 100 }, (_, i) => i + 1);

type PhotoRowProps = {
  photo: Photo;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
};

// memo: строка перерисовывается, только если изменились её пропсы.
// Без memo каждая из строк вызывала simulateHeavyRender() при любом рендере родителя.
const PhotoRow = memo(function PhotoRow({
  photo,
  isFavorite,
  onToggleFavorite
}: PhotoRowProps) {
  simulateHeavyRender();

  return (
    <div className="photo-row">
      <span className="photo-row__id">#{photo.id}</span>
      <span className="photo-row__title">{photo.title}</span>
      <span className="muted">Альбом {photo.albumId}</span>
      <button type="button" className="button" onClick={() => onToggleFavorite(photo.id)}>
        {isFavorite ? 'Убрать' : 'В избранное'}
      </button>
    </div>
  );
});

type SecondsOnPageProps = {
  openedAt: number;
}
// Таймер вынесен в отдельный компонент: его state меняется каждую секунду,
// и теперь при тике перерисовывается только этот абзац, а не вся PhotosPage
// со списком. Секунды считаются от момента открытия страницы (openedAt),
// поэтому значение точное и совпадает с исходной логикой.
function SecondsOnPage({openedAt}: SecondsOnPageProps) {
  const [secondsOnPage, setSecondsOnPage] = useState(
    () => Math.floor((Date.now() - openedAt) / 1000)
  );

  useEffect(() => {
    const timer = setInterval(
      () => setSecondsOnPage(Math.floor((Date.now() - openedAt) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [openedAt]);

  return (
    <p className="muted">Вы на странице {secondsOnPage} с</p>
  );
}

export default function PhotosPage() {
  const { data: photos, isLoading, error, refetch } = useFetch<Photo[]>(endpoints.photos);

  const [query, setQuery] = useState('');
  const [albumId, setAlbumId] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [favorites, setFavorites] = useState<number[]>([]);

  // Момент открытия страницы: задаётся один раз и не меняется,
  // поэтому не вызывает перерисовок. Нужен таймеру для отсчёта секунд.
  const [openedAt] = useState(() => Date.now());

  // Поиск с задержкой: поле ввода обновляется сразу (query), а тяжёлая фильтрация
  // запускается только через 500 мс после окончания ввода (debouncedQuery),
  // а не на каждую букву.
  const debouncedQuery = useDebounce(query, 500);

  // useMemo: фильтрация и сортировка 5000 записей выполняются только при изменении
  // photos, albumId, debouncedQuery или sortOrder, а не на каждом рендере (тик таймера,
  // клик «В избранное»). Строка поиска приводится к нижнему регистру один раз,
  // а не для каждой записи.
  const visiblePhotos = useMemo(() => {
    const normalizedQuery = debouncedQuery.toLowerCase();
    return (photos ?? [])
      .filter(photo => albumId === 'all' || photo.albumId === Number(albumId))
      .filter(photo => photo.title.toLowerCase().includes(normalizedQuery))
      .sort((a, b) =>
        sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      );
  }, [photos, albumId, debouncedQuery, sortOrder]);

  // Виртуализация: рендерятся только строки, видимые в контейнере .photo-list
  // (около 9) плюс запас overscan, а не все 5000. Высота строки 56px взята из CSS
  // .photo-row. Хуки стоят до ранних return, как требуют правила хуков.
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: visiblePhotos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // useCallback с пустыми зависимостями: функция создаётся один раз,
  // поэтому memo у PhotoRow не сбрасывается из-за «нового» пропса onToggleFavorite.
  // State обновляется через prev => ..., чтобы не читать favorites снаружи
  // и не добавлять его в зависимости (иначе функция пересоздавалась бы при каждом клике).
  const handleToggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      let next: number[];
      if (prev.includes(id)) {
        next = prev.filter(prevId => prevId !== id);
      } else {
        next = [...prev, id];
      }
      return next;
    });
  }, []);

  if (isLoading) return <Loader text="Загружаем медиатеку..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <section>
      <h1>Медиатека</h1>
      <SecondsOnPage openedAt={openedAt} />

      <div className="toolbar">
        <input
          className="input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Поиск по названию"
        />
        <select className="input" value={albumId} onChange={e => setAlbumId(e.target.value)}>
          <option value="all">Все альбомы</option>
          {ALBUM_IDS.map(id => (
            <option key={id} value={id}>
              Альбом {id}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
        >
          <option value="asc">А–Я</option>
          <option value="desc">Я–А</option>
        </select>
      </div>

      <p>
        Показано: {visiblePhotos.length} из {photos?.length ?? 0}. В избранном: {favorites.length}
      </p>

      {/* Внутренний блок высотой getTotalSize() создаёт полосу прокрутки
          как для полного списка; видимые строки позиционируются абсолютно
          по virtualRow.start. */}
      <div className="photo-list" ref={parentRef}>
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
          {virtualItems.map(virtualRow => {
            const photo = visiblePhotos[virtualRow.index];
            return (
              <div key={photo.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`
                }}>
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
    </section>
  );
}
