import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import { getAllRoutes } from '../config/routes';
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout';

const AppRouter = () => {
  const [user] = useAuthState(auth);
  const routes = getAllRoutes();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        
        {routes.map((route) => {
          const RouteComponent = route.component;
          
          if (route.layout === 'authenticated') {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <AuthenticatedLayout>
                    <RouteComponent />
                  </AuthenticatedLayout>
                }
              />
            );
          }
          
          return (
            <Route
              key={route.path}
              path={route.path}
              element={<RouteComponent />}
            />
          );
        })}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;