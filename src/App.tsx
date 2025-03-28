import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeAuth } from './store/slices/authSlice';
import AppRouter from './navigation/AppRouter';
import type { AppDispatch } from './store';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
      <AppRouter />
  );
}

export default App;