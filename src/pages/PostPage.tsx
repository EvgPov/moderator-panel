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
 * Страница поста: пост, автор, комментарии и форма нового комментария.
 *
 * Пост — основное содержимое: его загрузка, 404 и ошибка заменяют всю страницу.
 * У комментариев свои состояния загрузки и ошибки, они не скрывают пост.
 * Новые комментарии хранятся в локальном state и выводятся вместе с загруженными.
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

  // 404 проверяется раньше общей ошибки: error заполнен при любой ошибке,
  // а повторять запрос несуществующего поста бессмысленно
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

  // JSONPlaceholder не сохраняет данные и всегда возвращает id: 501,
  // поэтому id заменяется, чтобы key в списке не повторялся
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
