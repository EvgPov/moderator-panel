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

  // Задача 3.1 (сделано): отложите query через useDebounce с задержкой 500 мс.
  const debouncedQuery = useDebounce(query, 500)

  // Задача 3.2 (сделано): загрузите посты через useFetch<Post[]>.
  const url = endpoints.posts({page, query: debouncedQuery})

  const { data, isLoading, error, refetch } = useFetch<Post[]>(url)
  // URL взято из endpoints.posts({ page, query: debouncedQuery }).
  // Задача 3.3 (сделано): данные из хука; пока их нет (загрузка/ошибка) — пустой массив.
  const posts: Post[] = data ?? [];

  function handleQueryChange(value: string) {
    setQuery(value);
  // Задача 3.4 (сделано): при новом поиске возвращайте пользователя на первую страницу.
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

      {/*
        Задача 3.5 (сделано): добавьте отображение состояний:
        - пока пользователь печатает (query !== debouncedQuery) -- «Печатаете...»;
        - загрузка -- компонент Loader;
        - ошибка -- ErrorMessage с кнопкой «Повторить» (refetch из useFetch);
        - пустой результат -- EmptyState «Ничего не найдено».
      */}
      {query !== debouncedQuery && <p className="muted">Печатаете...</p>}
      {isLoading && <Loader/>}
      {error && <ErrorMessage message={error} onRetry={refetch}/>}
      {!isLoading && !error && posts.length === 0 &&  <EmptyState text="Ничего не найдено"/>}

      <ul className="list">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </ul>

      {/*
        Задача 3.6 (сделано): hasNext -- есть ли следующая страница.
        Если постов пришло меньше POSTS_PER_PAGE, следующей страницы нет.
        isDisabled -- блокируйте кнопки во время загрузки.
      */}
      
      <Pagination page={page} hasNext={posts.length === POSTS_PER_PAGE} isDisabled={isLoading} onChange={setPage} />
    </section>
  );
}
