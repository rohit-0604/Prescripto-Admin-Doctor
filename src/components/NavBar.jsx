// src/components/NavBar.jsx
import React, { useContext } from 'react';
import { LogOut, Menu } from 'lucide-react';
import { AdminContext } from '../context/AdminContext'; // Import AdminContext
import { DoctorContext } from '../context/DoctorContext'; // Import DoctorContext

const NavBar = ({ onToggleSidebar }) => {
    // Get both tokens and their respective logout functions from contexts
    const { aToken, adminLogout } = useContext(AdminContext);
    const { dToken, doctorLogout } = useContext(DoctorContext);

    const handleLogout = () => {
        if (aToken) {
            adminLogout(); // Use the adminLogout function from AdminContext
        } else if (dToken) {
            doctorLogout(); // Use the doctorLogout function from DoctorContext
        }
        // No else needed, as the button won't be visible if neither is logged in,
        // or the App.jsx logic will redirect if tokens are absent.
    };

    // Determine if any user is logged in to show the logout button
    const isLoggedIn = aToken || dToken;

    return (
        <nav className="flex justify-between items-center p-4 bg-white shadow-md h-16 w-full border-b border-gray-100">
            <button
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                onClick={onToggleSidebar}
                aria-label="Toggle sidebar menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* App Name/Logo - visible on mobile in NavBar */}
            <div className="md:hidden text-2xl font-bold text-gray-800">Prescripto</div>

            {/* Logout button - align right */}
            {isLoggedIn && ( // Only show logout button if either admin or doctor is logged in
                <button
                    onClick={handleLogout} // Call the dynamic handleLogout function
                    className="flex items-center px-5 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary/90 transition-colors duration-200 text-sm font-medium ml-auto"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </button>
            )}
        </nav>
    );
}

export default NavBar;