import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx'; // Your main application component
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import AdminContextProvider from './context/AdminContext.jsx';
import DoctorContextProvider from './context/DoctorContext.jsx'; // Assuming this context exists
import AppContextProvider from './context/AppContext.jsx';

// Render the root React component
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter must wrap your entire application to enable routing */}
    <BrowserRouter>
      {/* All context providers should be nested inside BrowserRouter */}
      <AppContextProvider>
        <DoctorContextProvider>
          <AdminContextProvider>
            {/* App component will now contain all Routes */}
            <App />
          </AdminContextProvider>
        </DoctorContextProvider>
      </AppContextProvider>
    </BrowserRouter>
  </StrictMode>,
);
