import { useState } from 'react';
import { Pagination } from '../components/Pagination';
import { PostCard } from '../components/PostCard';
import type { Post } from '../types';

export default function PostsPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  // TODO (задача 3.1): отложите query через useDebounce с задержкой 500 мс.
  // TODO (задача 3.2): загрузите посты через useFetch<Post[]>.
  //   URL возьмите из endpoints.posts({ page, query: debouncedQuery }).
  // TODO (задача 3.3): вместо заглушки ниже используйте данные из хука.
  const posts: Post[] = [];

  function handleQueryChange(value: string) {
    setQuery(value);
    // TODO (задача 3.4): при новом поиске возвращайте пользователя на первую страницу.
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
        TODO (задача 3.5): добавьте отображение состояний:
        - пока пользователь печатает (query !== debouncedQuery) -- «Печатаете...»;
        - загрузка -- компонент Loader;
        - ошибка -- ErrorMessage с кнопкой «Повторить» (refetch из useFetch);
        - пустой результат -- EmptyState «Ничего не найдено».
      */}

      <ul className="list">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </ul>

      {/*
        TODO (задача 3.6): hasNext -- есть ли следующая страница.
        Если постов пришло меньше POSTS_PER_PAGE, следующей страницы нет.
        isDisabled -- блокируйте кнопки во время загрузки.
      */}
      <Pagination page={page} hasNext={false} isDisabled={false} onChange={setPage} />
    </section>
  );
}
