import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import Login from '../screens/Login'; 
import Dashboard from '../screens/Dashboard'; 
import Profile from '../screens/Profile';
import AuthenticatedRoute from './AuthenticatedRoute';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout';

const AppRouter = () => { 
  const [user] = useAuthState(auth);

  return ( 
    <BrowserRouter> 
      <Routes> 
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Authenticated routes with layout */}
        <Route element={<AuthenticatedRoute><AuthenticatedLayout /></AuthenticatedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes> 
    </BrowserRouter> 
  );
};

export default AppRouter;