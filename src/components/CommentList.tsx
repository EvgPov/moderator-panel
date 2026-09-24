import type { Comment } from '../types';
import { EmptyState } from './EmptyState';

type CommentListProps = {
  comments: Comment[];
};

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <EmptyState text="Комментариев пока нет" />;
  }

  return (
    <ul className="list">
      {comments.map(comment => (
        <li key={comment.id} className="card">
          <p className="card__title">{comment.name}</p>
          <p className="muted">{comment.email}</p>
          <p className="card__text">{comment.body}</p>
        </li>
      ))}
    </ul>
  );
}
