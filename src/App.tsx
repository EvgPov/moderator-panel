import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Loader } from './components/Loader';

// Страницы загружаются лениво (React.lazy): код каждой собирается в отдельный
// чанк и скачивается при первом переходе на неё.

const PostsPage = lazy(() => import('./pages/PostsPage'));
const PostPage = lazy(() => import('./pages/PostPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const PhotosPage = lazy(() => import('./pages/PhotosPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Маршрут без path оборачивает страницы в Suspense ниже Layout:
            пока грузится код страницы, индикатор заменяет только её,
            а шапка с навигацией остаётся на месте. */}
        <Route
          element={
            <Suspense fallback={<Loader text="Загрузка страницы..." />}>
              <Outlet />
            </Suspense>
          }
        >
          <Route path="/" element={<Navigate to="/posts" replace />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/:postId" element={<PostPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/photos" element={<PhotosPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
