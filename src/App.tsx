import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Loader } from './components/Loader';

// Задача 7 (сделано): страницы загружаются лениво через React.lazy,
// каждая попадает в отдельный чанк. Suspense стоит внутри Layout-маршрута,
// поэтому при загрузке страницы шапка с навигацией не пропадает.

const PostsPage = lazy(() => import('./pages/PostsPage'));
const PostPage = lazy(() => import('./pages/PostPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const PhotosPage = lazy(() => import('./pages/PhotosPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
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
