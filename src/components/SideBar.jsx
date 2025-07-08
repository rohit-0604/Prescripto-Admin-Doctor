// src/components/SideBar.jsx
import React, { useContext } from 'react'; // Import useContext
import { LayoutDashboard, Calendar, Users, Plus, UserCircle, Stethoscope } from 'lucide-react'; // Added Stethoscope for doctor icon
import { Link, useLocation } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext'; // Import AdminContext
import { DoctorContext } from '../context/DoctorContext'; // Import DoctorContext

const SideBar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const { aToken } = useContext(AdminContext); // Get aToken
    const { dToken } = useContext(DoctorContext); // Get dToken

    // Define navigation items for Admin
    const adminNavItems = [
        { path: '/admin-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/all-appointments', icon: Calendar, label: 'Appointments' },
        { path: '/add-doctor', icon: Plus, label: 'Add Doctor' },
        { path: '/doctors-list', icon: Users, label: 'Doctors List' },
    ];

    // Define navigation items for Doctor
    const doctorNavItems = [
        { path: '/doctor-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/doctor-appointments', icon: Calendar, label: 'My Appointments' },
        { path: '/doctor-profile', icon: UserCircle, label: 'Profile' },
    ];

    // Determine which set of nav items to display
    let currentNavItems = [];
    let roleTag = '';
    let roleIcon = null;

    if (aToken) {
        currentNavItems = adminNavItems;
        roleTag = 'Admin';
        roleIcon = <UserCircle className="w-5 h-5 mr-2" />; // Or specific admin icon
    } else if (dToken) {
        currentNavItems = doctorNavItems;
        roleTag = 'Doctor';
        roleIcon = <Stethoscope className="w-5 h-5 mr-2" />;
    } else {
        // If neither is logged in, sidebar might not be visible or will be empty
        return null; // Or render a placeholder if desired
    }

    const handleNavLinkClick = () => {
        // Close sidebar on mobile after clicking a link
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
    };

    return (
        <div
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md p-6 border-r border-gray-200 h-screen
                        transform transition-transform duration-300 ease-in-out
                        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                        md:relative md:translate-x-0 md:flex md:flex-col`}
        >
            <div className="flex items-center mb-10 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 md:block hidden">Prescripto</h2>
                {roleTag && (
                    <span className="ml-2 px-3 py-1 bg-blue-100 text-primary text-xs font-semibold rounded-full shadow-sm flex items-center">
                        {roleIcon} {roleTag}
                    </span>
                )}
            </div>
            {/* Sidebar Navigation */}
            <nav className="flex-1">
                <ul>
                    {currentNavItems.map((item) => (
                        <li key={item.path} className="mb-3">
                            <Link
                                to={item.path}
                                onClick={handleNavLinkClick}
                                className={`flex items-center p-3 rounded-lg transition-all duration-200
                                    ${location.pathname === item.path
                                        ? 'text-primary bg-blue-50 font-semibold shadow-sm'
                                        : 'text-gray-600 hover:text-primary hover:bg-blue-50'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}

export default SideBar;