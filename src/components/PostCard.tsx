import { Link } from 'react-router-dom';
import type { Post } from '../types';

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <li className="card">
      <Link to={`/posts/${post.id}`} className="card__title">
        #{post.id}. {post.title}
      </Link>
      <p className="card__text">{post.body}</p>
    </li>
  );
}
