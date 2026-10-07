import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';

import { endpoints } from '../api/endpoints';
import { useFetch } from '../hooks/useFetch';
import { Loader } from '../components/Loader';

import type { Post, Comment } from '../types';
import { ErrorMessage } from '../components/ErrorMessage';
import { AuthorBadge } from '../components/AuthorBadge';
import { CommentList } from '../components/CommentList';
import { CommentForm } from '../components/CommentForm';

/**
 * Задача 4 (сделано): страница поста.
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
  const urlPost = endpoints.post(postId)
  const urlComments = endpoints.postComments(postId)

  const [newComments, setNewComments] = useState<Comment[]>([])

  const { data: post, isLoading: isLoadingPost, error: errorPost,
          status: statusPost, refetch: refetchPost } = useFetch<Post>(urlPost)

  const {data: comments, isLoading: isLoadingComments, 
        error: errorComments, refetch: refetchComments } = useFetch<Comment[]>(urlComments)

  if (isLoadingPost) return <Loader/>;
  if (statusPost === 404){
    return (
      <section>
        <h1>Пост не найден</h1>
        <Link to="/posts" className="back-link">← К списку постов</Link>
      </section>
    )
  }   
  if (errorPost) return <ErrorMessage message={errorPost} onRetry={refetchPost} />;
  
  if (!post) return null;

  const allComments = [...(comments ?? []), ...newComments]

  function handleCreated(comment: Comment) {
    setNewComments(prev => [...prev, { ...comment, id: Date.now() }])
  }
  return (
    <section>
      <Link to="/posts" className="back-link">
        ← К списку постов
      </Link>
  
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <AuthorBadge userId={post.userId} />

      {isLoadingComments && <Loader/>}
      {errorComments && <ErrorMessage message={errorComments} onRetry={refetchComments}/>}
      {!isLoadingComments && !errorComments && <CommentList comments={allComments}/>}

      <CommentForm postId={post.id} onCreated={handleCreated}/>
    </section>
  );
}
