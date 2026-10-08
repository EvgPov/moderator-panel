import { useState, type FormEvent } from 'react';
import type { Comment } from '../types';
import { endpoints } from '../api/endpoints';
import { useMutation } from '../hooks/useMutation';

type CommentFormProps = {
  postId: number;
  onCreated: (comment: Comment) => void;
};

export function CommentForm({ postId, onCreated }: CommentFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');

  // Задача 5.1 (сделано): подключен useMutation<Comment> для POST-запроса
  // на endpoints.comments. isLoading, error, execute взяты из хука.

  const { isLoading, error, execute } = useMutation<Comment>(endpoints.comments)
  
  const isValid = name.trim() !== '' && email.trim() !== '' && body.trim() !== '';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Задача 5.2 (сделано):
    // 1. отправка { postId, name, email, body } через execute;
    // 2. если сервер вернул комментарий -- передаётся в onCreated
    //    и очищаются поля формы;
    // 3. если вернулся null -- поля не очищаются, ошибку показывает разметка ниже.
    event.preventDefault();
    const created = await execute({ postId, name, email, body });

    if (created) {
      onCreated(created)
      setName('')
      setEmail('')
      setBody('')
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>Новый комментарий</h3>
      <input
        className="input"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Тема"
      />
      <input
        className="input"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
      />
      <textarea
        className="input"
        rows={3}
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Текст комментария"
      />
      <button type="submit" className="button" disabled={!isValid || isLoading}>
        {isLoading ? 'Отправка...' : 'Отправить'}
      </button>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
