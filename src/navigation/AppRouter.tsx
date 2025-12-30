import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getAllRoutes } from '../config/routes';
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout';

const AppRouter = () => {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const { currentOrganization } = useSelector((state: RootState) => state.organization);
  const routes = getAllRoutes();

  if (loading) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Root path redirect */}
        <Route 
          path="/" 
          element={
            user ? (
              currentOrganization ? (
                <Navigate to={`/orgs/${currentOrganization.id}/dashboard`} replace />
              ) : (
                <Navigate to="/orgs/" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
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
                  currentOrganization ? (
                    <Navigate to={`/orgs/${currentOrganization.id}/dashboard`} replace />
                  ) : (
                    <Navigate to="/orgs/" replace />
                  )
                ) : (
                  <route.component />
                )
              }
            />
          ))}

        {/* Organization Selection Page */}
        <Route
          path="/orgs/"
          element={
            user ? (
              <AuthenticatedLayout>
                <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                  {/* The modal will show here via AuthenticatedLayout context if no org selected */}
                </div>
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Protected routes wrapper */}
        <Route
          element={
            user ? (
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