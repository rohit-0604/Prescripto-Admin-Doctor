import React, { useContext, useState, useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate here
import axios from 'axios';
import { toast } from 'react-toastify'; // Make sure react-toastify is installed and imported

import { AdminContext } from './src/context/AdminContext';

import Login from './src/pages/Login';
import NavBar from './src/components/NavBar';
import SideBar from './src/components/SideBar';

import Dashboard from './src/pages/Admin/Dashboard';
import AllAppointments from './src/pages/Admin/AllAppointments';
import DoctorsList from './src/pages/Admin/DoctorsList';
import AddDoctor from './src/pages/Admin/AddDoctor';

const AuthWrapper = () => {
    const { aToken, setAToken } = useContext(AdminContext); // Get setAToken from context
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate(); // Initialize useNavigate here

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        if (isSidebarOpen && window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]);

    // --- GLOBAL AXIOS INTERCEPTOR SETUP ---
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                // Only act on 401 errors from server responses
                if (error.response && error.response.status === 401) {
                    // Check if the specific message from your authAdmin middleware is present
                    // This helps differentiate from other 401s if you have them
                    if (error.response.data.message === "Not authorized. Please login again." ||
                        error.response.data.message === "Token expired or invalid.") // Add this if your backend sends it specifically
                     {
                        console.log("401 Unauthorized intercepted! Session expired or token invalid.");
                        localStorage.removeItem('aToken'); // Clear expired token from local storage
                        setAToken(''); // Clear token from context state

                        // Store current path to redirect back after successful login
                        localStorage.setItem('redirectPath', location.pathname);

                        toast.error("Your session has expired. Please log in again.");
                        navigate('/login'); // Redirect to login page
                    }
                }
                return Promise.reject(error); // Re-throw the error so component catch blocks can still handle other errors
            }
        );

        // Cleanup function for the effect: remove the interceptor when the component unmounts
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [setAToken, navigate, location]); // Dependencies for useEffect

    // If no token, render the Login component. It will handle its own redirection.
    if (!aToken) {
        return <Login />; // Login component will handle ToastContainer
    }

    // If token exists, render the dashboard layout
    return (
        <div className='flex flex-col h-screen bg-[#F8F9FD]'>
            <NavBar onToggleSidebar={toggleSidebar} />

            <div className='flex flex-1 overflow-hidden relative'>
                <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={toggleSidebar}
                    ></div>
                )}

                <main className='flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto'>
                    <Routes>
                        {/* Set the default route to Dashboard if aToken is present and user lands on '/' */}
                        <Route path='/' element={<Dashboard />} />
                        <Route path='/admin-dashboard' element={<Dashboard />} />
                        <Route path='/all-appointments' element={<AllAppointments />} />
                        <Route path='/add-doctor' element={<AddDoctor />} />
                        <Route path='/doctors-list' element={<DoctorsList />} />
                        {/* Add other admin routes here */}
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AuthWrapper;