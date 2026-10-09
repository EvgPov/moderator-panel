import { useState } from 'react';
import { Pagination } from '../components/Pagination';
import { PostCard } from '../components/PostCard';
import type { Post } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';
import { endpoints, POSTS_PER_PAGE } from '../api/endpoints'
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';

export default function PostsPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  // Поисковый запрос уходит на сервер через 500 мс после окончания ввода
  const debouncedQuery = useDebounce(query, 500)

  const url = endpoints.posts({page, query: debouncedQuery})

  const { data, isLoading, error, refetch } = useFetch<Post[]>(url)
  // Пока данных нет (загрузка или ошибка) — пустой массив
  const posts: Post[] = data ?? [];

  function handleQueryChange(value: string) {
    setQuery(value);
    // Новый поиск всегда начинается с первой страницы
    setPage(1)
  }

  return (
    <section>
      <h1>Посты</h1>

      <input
        className="input"
        value={query}
        onChange={e => handleQueryChange(e.target.value)}
        placeholder="Поиск по заголовку и тексту"
      />

      {/* Состояния: ввод ещё идёт, загрузка, ошибка с повтором, пустой результат.
          «Ничего не найдено» — только после успешной загрузки: пустой массив
          бывает и во время загрузки, и при ошибке. */}
      {query !== debouncedQuery && <p className="muted">Печатаете...</p>}
      {isLoading && <Loader/>}
      {error && <ErrorMessage message={error} onRetry={refetch}/>}
      {!isLoading && !error && posts.length === 0 &&  <EmptyState text="Ничего не найдено"/>}

      <ul className="list">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </ul>

      {/* Если постов пришло меньше POSTS_PER_PAGE, следующей страницы нет.
          Во время загрузки кнопки заблокированы. */}
      <Pagination page={page} hasNext={posts.length === POSTS_PER_PAGE} isDisabled={isLoading} onChange={setPage} />
    </section>
  );
}
