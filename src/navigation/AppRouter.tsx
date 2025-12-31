import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getAllRoutes } from '../config/routes';
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout';

const AppRouter = () => {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const { currentOrganization } = useSelector((state: RootState) => state.organization);
  const routes = getAllRoutes();

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
            ) : loading ? (
               // While loading, we can just wait or redirect to orgs/dashboard if we assume success, 
               // but simpler to do nothing or let it fall through? 
               // actually root path '/' usually redirects. 
               // If loading, let's render a skeleton/fallback or just Null (but inside Router so it doesn't break).
               // But user wanted "application already".
               // If we render AuthenticatedLayout here it expects children. 
               // Let's redirect to a default likely route or just render empty.
               // Actually, if we are loading, we don't know if we should go to login or dashboard.
               // Let's hold off on redirecting '/' until loaded.
               // Render a blank placeholder for '/' while loading? 
               // Or render the protected layout?
               // The request is about "the given page" (e.g. FormBuilder).
               // So this '/' route matters less if they are deep linking.
               <div className="min-h-screen bg-white dark:bg-zinc-950" />
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
            user || loading ? (
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
            user || loading ? (
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