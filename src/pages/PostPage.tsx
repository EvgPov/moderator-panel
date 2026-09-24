import { Link, useParams } from 'react-router-dom';

/**
 * TODO (задача 4): соберите страницу поста.
 *
 * 1. Загрузите пост: useFetch<Post>(endpoints.post(postId)).
 * 2. Загрузите комментарии: useFetch<Comment[]>(endpoints.postComments(postId)).
 * 3. Обработайте состояния поста:
 *    - загрузка -- Loader;
 *    - статус 404 -- сообщение «Пост не найден» и ссылка на /posts
 *      (проверьте на адресе /posts/9999);
 *    - любая другая ошибка -- ErrorMessage с кнопкой «Повторить».
 * 4. Покажите заголовок и текст поста, под ними -- <AuthorBadge userId={post.userId} />.
 * 5. Покажите комментарии через CommentList (со своими состояниями загрузки и ошибки).
 * 6. Под списком -- CommentForm. Новый комментарий храните в локальном state
 *    и выводите вместе с загруженными.
 *
 * Подсказка: jsonplaceholder не сохраняет данные и всегда возвращает id: 501.
 * Чтобы key не повторялся, перед добавлением замените id, например на Date.now().
 */
export default function PostPage() {
  const { postId = '' } = useParams();

  return (
    <section>
      <Link to="/posts" className="back-link">
        ← К списку постов
      </Link>
      <p className="muted">Здесь должна появиться страница поста #{postId}.</p>
    </section>
  );
}
