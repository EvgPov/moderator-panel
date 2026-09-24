import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';

// TODO (задача 7): сейчас код всех страниц попадает в один бандл.
// Переведите импорты страниц на React.lazy и добавьте Suspense с fallback.
import PostsPage from './pages/PostsPage';
import PostPage from './pages/PostPage';
import UsersPage from './pages/UsersPage';
import PhotosPage from './pages/PhotosPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/posts" replace />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/posts/:postId" element={<PostPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/photos" element={<PhotosPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
