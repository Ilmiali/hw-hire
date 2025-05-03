import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './store/slices/authSlice';
import { fetchUserOrganizations } from './store/slices/organizationSlice';
import { RootState } from './store';
import AppRouter from './navigation/AppRouter';
import type { AppDispatch } from './store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  // Dark mode
  useEffect(() => {
    // Add listener to update styles
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => onSelectMode(e.matches ? 'dark' : 'light'));
  
    // Setup dark/light mode for the first time
    onSelectMode(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  
    // Remove listener
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', () => {
      });
    }
  }, []);
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserOrganizations(user.uid));
    }
  }, [dispatch, user]);

  // Get the current theme from the document
  const onSelectMode = (mode: 'dark' | 'light') => {
    setIsDarkMode(mode === 'dark');
    document.documentElement.classList.add(mode);
  };

  return (
    <>
      <AppRouter />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? 'dark' : 'light'}
      />
    </>
  );
}

export default App;