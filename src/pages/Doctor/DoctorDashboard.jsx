import React, { useContext, useEffect, useState, useMemo } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { Link } from 'react-router-dom';
import {
    Calendar, Clock, DollarSign, User, CheckCircle, Award, MessageSquare, Briefcase
} from 'lucide-react';
import { toast } from 'react-toastify';

const DoctorDashboard = () => {
    // Destructure properties from DoctorContext
    // CHANGE THIS LINE: Use 'getDoctorProfile' instead of 'fetchDoctorProfile'
    const { doctorAppointments, doctorProfileData, fetchDoctorAppointments, getDoctorProfile } = useContext(DoctorContext);
    const [loading, setLoading] = useState(true); // Local loading state for dashboard component

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch both appointments and profile concurrently for efficiency
                await Promise.all([
                    fetchDoctorAppointments(), // Correctly named
                    getDoctorProfile()         // <--- Corrected function call
                ]);
            } catch (error) {
                console.error("Error loading dashboard data:", error);
                toast.error("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        // Ensure you call the function inside the useEffect or where needed
        loadDashboardData();
    // CHANGE THIS LINE: Update the dependency array
    }, [fetchDoctorAppointments, getDoctorProfile]); // <--- Corrected dependency

    // Helper to parse the custom date string "D_M_YYYY" to "YYYY-MM-DD"
    const parseCustomDateString = (dateString) => {
        const parts = String(dateString).split('_');
        if (parts.length === 3) {
            let [day, month, year] = parts;
            day = day.padStart(2, '0');
            month = month.padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        console.warn(`Unexpected date format: "${dateString}". Attempting to use as-is.`);
        return dateString;
    };

    // Memoize dashboard statistics to prevent unnecessary recalculations
    const dashboardStats = useMemo(() => {
        let totalAppointments = 0;
        let completedAppointments = 0;
        let totalEarnings = 0;
        let todaysAppointments = [];
        let upcomingAppointments = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date to start of the day for accurate comparison

        if (!doctorAppointments || doctorAppointments.length === 0) {
            // Return default stats if no appointments are loaded
            return { totalAppointments: 0, completedAppointments: 0, totalEarnings: 0, todaysAppointments: [], upcomingAppointments: [] };
        }

        doctorAppointments.forEach(appt => {
            // Exclude appointments cancelled by the user from all counts
            if (appt.cancelled && appt.cancelledBy === 'user') {
                return;
            }

            const formattedSlotDate = parseCustomDateString(appt.slotDate);
            // Create a full Date object including time for precise comparison
            const apptDateTime = new Date(`${formattedSlotDate} ${appt.slotTime}`);

            if (isNaN(apptDateTime.getTime())) {
                console.warn(`Skipping appointment (ID: ${appt._id || 'N/A'}) in dashboard stats due to invalid date/time: "${appt.slotDate} ${appt.slotTime}"`);
                return;
            }

            totalAppointments++; // Count all non-user-cancelled appointments

            if (appt.isCompleted) {
                completedAppointments++;
                // Add to earnings only if the appointment was completed AND paid
                if (appt.paymentStatus === 'paid') {
                    totalEarnings += appt.amount || 0; // Ensure amount is treated as a number
                }
            }

            // For grouping Today's and Upcoming appointments (only non-completed, non-cancelled)
            const apptDateOnly = new Date(apptDateTime);
            apptDateOnly.setHours(0, 0, 0, 0); // Normalize to start of day for simple date comparison

            if (!appt.isCompleted && !appt.cancelled) { // Only consider active, future appointments
                if (apptDateOnly.getTime() === today.getTime()) {
                    todaysAppointments.push(appt);
                } else if (apptDateOnly > today) { // Future appointments
                    upcomingAppointments.push(appt);
                }
            }
        });

        // Sort today's appointments by time
        todaysAppointments.sort((a, b) => {
            const parseTime = (timeStr) => {
                const [time, ampm] = timeStr.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (ampm === 'PM' && hours !== 12) hours += 12;
                if (ampm === 'AM' && hours === 12) hours = 0;
                return hours * 60 + minutes;
            };
            return parseTime(a.slotTime) - parseTime(b.slotTime);
        });

        // Sort upcoming appointments by date, then by time
        upcomingAppointments.sort((a, b) => {
            const dateTimeA = new Date(`${parseCustomDateString(a.slotDate)} ${a.slotTime}`);
            const dateTimeB = new Date(`${parseCustomDateString(b.slotDate)} ${b.slotTime}`);
            if (isNaN(dateTimeA.getTime()) || isNaN(dateTimeB.getTime())) {
                return 0; // Maintain original order if dates are invalid
            }
            return dateTimeA.getTime() - dateTimeB.getTime();
        });

        // Limit the upcoming appointments display to the next 3 for a concise dashboard view
        const nextThreeUpcoming = upcomingAppointments.slice(0, 3);

        return {
            totalAppointments,
            completedAppointments,
            totalEarnings,
            todaysAppointments,
            upcomingAppointments: nextThreeUpcoming // Only show the top 3 on the dashboard
        };
    }, [doctorAppointments]); // Recalculate these stats only when `doctorAppointments` changes

    // Get the doctor's name from profile, with a fallback
    // Corrected to use doctorProfileData, as that's the state variable
    const doctorName = doctorProfileData?.fullName || doctorProfileData?.name || 'Doctor';

    // Display loading state for the dashboard
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)] text-gray-500 text-lg">
                Loading dashboard...
            </div>
        );
    }

    // Destructure the calculated stats for easy use in JSX
    const {
        totalAppointments,
        completedAppointments,
        totalEarnings,
        todaysAppointments,
        upcomingAppointments
    } = dashboardStats;

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome, {doctorName}!
            </h1>
            <p className="text-gray-600 mb-8">
                Here's a quick overview of your practice.
            </p>

            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Appointments Card */}
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                    <Calendar className="text-blue-500 mr-4 w-8 h-8" />
                    <div>
                        <p className="text-gray-500 text-sm">Total Appointments</p>
                        <p className="text-2xl font-bold text-gray-800">{totalAppointments}</p>
                    </div>
                </div>
                {/* Completed Appointments Card */}
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                    <CheckCircle className="text-green-500 mr-4 w-8 h-8" />
                    <div>
                        <p className="text-gray-500 text-sm">Completed Appointments</p>
                        <p className="text-2xl font-bold text-gray-800">{completedAppointments}</p>
                    </div>
                </div>
                {/* Total Earnings Card */}
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                    <DollarSign className="text-purple-500 mr-4 w-8 h-8" />
                    <div>
                        <p className="text-gray-500 text-sm">Total Earnings (Paid)</p>
                        <p className="text-2xl font-bold text-gray-800">₹{totalEarnings.toFixed(2)}</p>
                    </div>
                </div>
                {/* Doctor's Specialty Card */}
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                    <Briefcase className="text-orange-500 mr-4 w-8 h-8" />
                    <div>
                        <p className="text-gray-500 text-sm">Your Specialty</p>
                        {/* Corrected to use doctorProfileData */}
                        <p className="text-2xl font-bold text-gray-800 capitalize">
                            {doctorProfileData?.speciality || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid: Today's Appointments & Quick Actions/Upcoming */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Appointments Section (takes 2/3 width on large screens) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-500" /> Today's Appointments ({todaysAppointments.length})
                        </h2>
                        <Link to="/doctor/appointments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View All <span aria-hidden="true">&rarr;</span>
                        </Link>
                    </div>
                    {todaysAppointments.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {todaysAppointments.map(appt => (
                                <li key={appt._id} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                        <div>
                                            <p className="text-gray-800 font-medium">{appt.slotTime}</p>
                                            <p className="text-gray-600 text-sm">{appt.userData.name}</p>
                                        </div>
                                    </div>
                                    {/* Display payment status for today's appointments */}
                                    {appt.paymentStatus && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            appt.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                            appt.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {appt.paymentStatus.toUpperCase()}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600 text-center py-4">No appointments scheduled for today.</p>
                    )}
                </div>

                {/* Quick Actions & Upcoming Appointments (Combined in the right column, 1/3 width) */}
                <div className="lg:col-span-1">
                    {/* Quick Actions Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                            <Award className="w-5 h-5 mr-2 text-orange-500" /> Quick Actions
                        </h2>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/doctor-appointments" className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-md transition-colors">
                                    <Calendar className="w-5 h-5 mr-3" /> Manage Appointments
                                </Link>
                            </li>
                            <li>
                                <Link to="/doctor-profile" className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-md transition-colors">
                                    <User className="w-5 h-5 mr-3" /> Edit Profile
                                </Link>
                            </li>
                            <li>
                                <Link to="/doctor/messages" className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-md transition-colors">
                                    <MessageSquare className="w-5 h-5 mr-3" /> View Messages
                                </Link>
                            </li>
                            {/* Add more quick actions as needed */}
                        </ul>
                    </div>

                    {/* Upcoming Appointments Section (displays next 3) */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-green-500" /> Next Upcoming Appointments ({upcomingAppointments.length})
                        </h2>
                        {upcomingAppointments.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {upcomingAppointments.map(appt => (
                                    <li key={appt._id} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                            <div>
                                                <p className="text-gray-800 font-medium">{appt.slotTime}</p>
                                                <p className="text-gray-600 text-sm">{appt.userData.name} - {parseCustomDateString(appt.slotDate)}</p>
                                            </div>
                                        </div>
                                        {/* Display payment status for upcoming appointments */}
                                        {appt.paymentStatus && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                appt.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                appt.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {appt.paymentStatus.toUpperCase()}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-600 text-center py-4">No upcoming appointments to display.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;