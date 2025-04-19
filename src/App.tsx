import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './store/slices/authSlice';
import { fetchUserOrganizations } from './store/slices/organizationSlice';
import { RootState } from './store';
import AppRouter from './navigation/AppRouter';
import type { AppDispatch } from './store';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserOrganizations(user.uid));
    }
  }, [dispatch, user]);

  return (
      <AppRouter />
  );
}

export default App;