import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getAllRoutes } from '../config/routes';
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout';

const AppRouter = () => {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const routes = getAllRoutes();

  if (loading) {
    return
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Root path redirect */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
        />

        {/* Public routes */}
        {routes
          .filter(route => route.layout !== 'authenticated')
          .map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                user && route.path === '/login' ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <route.component />
                )
              }
            />
          ))}

        {/* Protected routes wrapper */}
        <Route
          element={
            (user) ? (
              <AuthenticatedLayout>
                <Outlet />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/login" replace state={{ from: window.location.pathname }} />
            )
          }
        >
          {routes
            .filter(route => route.layout === 'authenticated')
            .map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.component />}
              />
            ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;