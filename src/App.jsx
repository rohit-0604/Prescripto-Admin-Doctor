// App.jsx (Your original, unmodified App.jsx)
import React, { useContext, useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/AdminContext';
import { DoctorContext } from './context/DoctorContext'; // Import DoctorContext
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Login from './pages/Login';

import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import DoctorsList from './pages/Admin/DoctorsList';
import AddDoctor from './pages/Admin/AddDoctor';

import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import DoctorAppointment from './pages/Doctor/DoctorAppointment'


const App = () => {
    const { aToken } = useContext(AdminContext);
    const { dToken } = useContext(DoctorContext); // Get dToken
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        if (isSidebarOpen && window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname, isSidebarOpen]);

    // NEW/UPDATED: Persistent Login Logic
    useEffect(() => {
        if (location.pathname !== '/login') {
            if (!aToken && !dToken) {
                localStorage.setItem('redirectPath', location.pathname);
                navigate('/login');
            }
        }
    }, [aToken, dToken, location.pathname, navigate]);


    return (
        <div className='flex flex-col h-screen bg-[#F8F9FD]'>
            <ToastContainer />
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* Admin Routes - accessible only if aToken is present */}
                {aToken && (
                    <>
                        {/* Default route for admin login is dashboard */}
                        <Route path="/" element={<Layout toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen}>
                            <Dashboard /></Layout>} />
                        <Route path="/admin-dashboard" element={<Layout toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen}><Dashboard /></Layout>} />
                        <Route path="/all-appointments" element={<Layout toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen}><AllAppointments /></Layout>} />
                        <Route path="/add-doctor" element={<Layout toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen}><AddDoctor /></Layout>} />
                        <Route path="/doctors-list" element={<Layout toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen}><DoctorsList /></Layout>} />
                    </>
                )}

                {/* Doctor Routes - accessible only if dToken is present */}
                {dToken && (
                    <>
                        <Route path="/doctor-dashboard" element={<Layout toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen}><DoctorDashboard /></Layout>} />
                        <Route path="/doctor-profile" element={<Layout toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen}><DoctorProfile /></Layout>} />
                        <Route path="/doctor-appointments" element={<Layout toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen}><DoctorAppointment /></Layout>} />
                    </>
                )}

                {/* Fallback route if neither token is present and not on login page
                    or if accessing a non-existent route while logged out/in
                    You might want a 404 page here */}
                {(!aToken && !dToken) && location.pathname !== '/login' && (
                    <Route path="*" element={<Login />} /> // Or a dedicated "Not Authorized" / 404 page
                )}
                    {(aToken || dToken) && (
                        <Route path="*" element={
                            // Redirect to admin dashboard if admin token, else doctor dashboard
                            aToken ? <Layout toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen}><Dashboard /></Layout> :
                                     <Layout toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen}><DoctorDashboard /></Layout>
                        } />
                )}

            </Routes>
        </div>
    );
};

// Wrapper layout for navbar/sidebar
const Layout = ({ children, toggleSidebar, isSidebarOpen }) => (
    <>
        <NavBar onToggleSidebar={toggleSidebar} />
        <div className='flex flex-1 overflow-hidden relative'>
            <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}
            <main className='flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto'>
                {children}
            </main>
        </div>
    </>
);

export default App;