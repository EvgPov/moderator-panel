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

  // POST-запрос на создание комментария
  const { isLoading, error, execute } = useMutation<Comment>(endpoints.comments)
  
  const isValid = name.trim() !== '' && email.trim() !== '' && body.trim() !== '';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = await execute({ postId, name, email, body });

    // execute возвращает null при ошибке: тогда поля не очищаются,
    // а текст ошибки выводится под формой
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
