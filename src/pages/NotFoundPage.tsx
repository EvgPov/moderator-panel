import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section>
      <h1>Страница не найдена</h1>
      <p>
        Проверьте адрес или вернитесь к <Link to="/posts">списку постов</Link>.
      </p>
    </section>
  );
}
