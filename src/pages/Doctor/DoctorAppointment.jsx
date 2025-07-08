import React, { useContext, useEffect, useState, useMemo } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { Clock, Calendar, DollarSign, User, CheckCircle, XCircle, MoreHorizontal, Mail, Phone } from 'lucide-react';
import { toast } from 'react-toastify';

const DoctorAppointment = () => {
    const { doctorAppointments, fetchDoctorAppointments, markAppointmentAsCompleted } = useContext(DoctorContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getAppointments = async () => {
            setLoading(true);
            await fetchDoctorAppointments();
            setLoading(false);
        };
        getAppointments();
    }, [fetchDoctorAppointments]);

    // Helper to parse the custom date string "D_M_YYYY" to "YYYY-MM-DD"
    const parseCustomDateString = (dateString) => {
        const parts = String(dateString).split('_');
        if (parts.length === 3) {
            let [day, month, year] = parts;
            day = day.padStart(2, '0');
            month = month.padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return dateString;
    };

    // Helper to format date for display and comparison
    const formatDate = (dateString) => {
        const date = new Date(parseCustomDateString(dateString));
        if (isNaN(date.getTime())) {
            console.warn("Invalid dateString received in formatDate (after parsing):", dateString);
            return "N/A Date";
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDayName = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const apptDate = new Date(parseCustomDateString(dateString));
        if (isNaN(apptDate.getTime())) {
            console.warn("Invalid dateString received in getDayName (after parsing):", dateString);
            return "N/A Day";
        }

        apptDate.setHours(0, 0, 0, 0);

        const diffTime = apptDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 7 && diffDays > 1) {
            const displayDate = new Date(parseCustomDateString(dateString));
            return isNaN(displayDate.getTime()) ? "Invalid Day" : displayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        }
        const displayDate = new Date(parseCustomDateString(dateString));
        return isNaN(displayDate.getTime()) ? "Invalid Date" : displayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const groupedAppointments = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(today.getTime())) {
            console.error("System date is invalid, cannot group appointments.");
            toast.error("Error: Cannot display appointments. System date is invalid.");
            return { orderedUpcoming: [], past: [], cancelled: [] };
        }

        const upcoming = new Map();
        const past = [];
        const cancelled = []; // This will now only store doctor-cancelled appointments

        const nextSevenDaysISO = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            return d.toISOString().split('T')[0];
        });

        doctorAppointments.forEach(appt => {
            const formattedSlotDate = parseCustomDateString(appt.slotDate);
            const apptDate = new Date(formattedSlotDate);

            if (isNaN(apptDate.getTime())) {
                console.warn(`Skipping appointment (ID: ${appt._id || 'N/A'}) due to invalid slotDate: "${appt.slotDate}"`);
                return;
            }

            // Filter cancelled appointments: only add to cancelled if NOT cancelled by user
            if (appt.cancelled) {
                // Ensure 'cancelledBy' exists and is not 'user'.
                // If 'cancelledBy' is undefined or something else, it will be included in 'cancelled'
                if (appt.cancelledBy !== 'user') {
                    cancelled.push(appt);
                }
                return;
            }

            apptDate.setHours(0, 0, 0, 0);
            const apptDayISO = apptDate.toISOString().split('T')[0];

            if (apptDate >= today) {
                if (nextSevenDaysISO.includes(apptDayISO)) {
                    if (!upcoming.has(apptDayISO)) {
                        upcoming.set(apptDayISO, []);
                    }
                    upcoming.get(apptDayISO).push(appt);
                } else {
                    if (!upcoming.has('future')) {
                        upcoming.set('future', []);
                    }
                    upcoming.get('future').push(appt);
                }
            } else {
                past.push(appt);
            }
        });

        upcoming.forEach(list => list.sort((a, b) => {
            const parseTime = (timeStr) => {
                const [time, ampm] = timeStr.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (ampm === 'PM' && hours !== 12) hours += 12;
                if (ampm === 'AM' && hours === 12) hours = 0;
                return hours * 60 + minutes;
            };
            return parseTime(a.slotTime) - parseTime(b.slotTime);
        }));

        if (upcoming.has('future')) {
            upcoming.get('future').sort((a, b) => {
                const formattedSlotDateA = parseCustomDateString(a.slotDate);
                const formattedSlotDateB = parseCustomDateString(b.slotDate);
                const dateA = new Date(`${formattedSlotDateA} ${a.slotTime}`);
                const dateB = new Date(`${formattedSlotDateB} ${b.slotTime}`);
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                    return 0;
                }
                return dateA - dateB;
            });
        }

        past.sort((a, b) => {
            const formattedSlotDateA = parseCustomDateString(a.slotDate);
            const formattedSlotDateB = parseCustomDateString(b.slotDate);
            const dateA = new Date(`${formattedSlotDateA} ${a.slotTime}`);
            const dateB = new Date(`${formattedSlotDateB} ${b.slotTime}`);
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                return 0;
            }
            return dateB - dateA;
        });

        cancelled.sort((a, b) => {
            const formattedSlotDateA = parseCustomDateString(a.slotDate);
            const formattedSlotDateB = parseCustomDateString(b.slotDate);
            const dateA = new Date(`${formattedSlotDateA} ${a.slotTime}`);
            const dateB = new Date(`${formattedSlotDateB} ${b.slotTime}`);
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                return 0;
            }
            return dateB - dateA;
        });

        const orderedUpcoming = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const dayISO = d.toISOString().split('T')[0];
            if (upcoming.has(dayISO)) {
                orderedUpcoming.push({
                    date: dayISO,
                    appointments: upcoming.get(dayISO)
                });
            }
        }
        if (upcoming.has('future')) {
            orderedUpcoming.push({
                date: 'future',
                appointments: upcoming.get('future')
            });
        }

        return { orderedUpcoming, past, cancelled };

    }, [doctorAppointments]);

    const handleMarkCompleted = async (appointmentId) => {
        if (window.confirm("Are you sure you want to mark this appointment as completed?")) {
            await markAppointmentAsCompleted(appointmentId);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)] text-gray-500 text-lg">
                Loading appointments...
            </div>
        );
    }

    const { orderedUpcoming, past, cancelled } = groupedAppointments;

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center md:text-left">My Appointments</h1>

            {doctorAppointments.length === 0 ? (
                <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md text-center text-gray-600">
                    <p>You have no appointments scheduled yet.</p>
                </div>
            ) : (
                <>
                    {/* Upcoming Appointments (Next 7 Days + Beyond) */}
                    {orderedUpcoming.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Upcoming Appointments</h2>
                            {orderedUpcoming.map(({ date, appointments }) => (
                                <div key={date} className="mb-6">
                                    <h3 className="text-xl font-medium text-gray-800 bg-gray-100 p-3 rounded-t-lg flex justify-between items-center">
                                        {date === 'future' ? 'Future Appointments (Beyond 7 Days)' : `${getDayName(date)}`}
                                        <span className="text-sm font-semibold text-primary px-3 py-1 bg-primary-light rounded-full">
                                            {appointments.length}
                                        </span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white rounded-b-lg shadow-sm">
                                        {appointments.map(appointment => (
                                            <div key={appointment._id} className="border-l-4 border-blue-500 p-4 rounded-lg shadow-md">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                                                        <User className="w-4 h-4 mr-2 text-blue-500" />
                                                        {appointment.userData.name}
                                                    </h4>
                                                    {/* Payment Status for Upcoming */}
                                                    {appointment.paymentStatus && (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                            appointment.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                            appointment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {appointment.paymentStatus.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-1 text-gray-600 text-sm">
                                                    <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-500" /> {formatDate(appointment.slotDate)}</p>
                                                    <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-500" /> {appointment.slotTime}</p>
                                                    <p className="flex items-center"><DollarSign className="w-4 h-4 mr-2 text-gray-500" /> ${appointment.amount}</p>
                                                    {appointment.userData.email && <p className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-500" /> {appointment.userData.email}</p>}
                                                    {appointment.userData.phone && <p className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-500" /> {appointment.userData.phone}</p>}
                                                </div>
                                                {!appointment.isCompleted && !appointment.cancelled && (
                                                    <button
                                                        onClick={() => handleMarkCompleted(appointment._id)}
                                                        className="mt-4 w-full px-3 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors flex items-center justify-center"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2" /> Mark as Completed
                                                    </button>
                                                )}
                                                {appointment.isCompleted && (
                                                    <p className="mt-4 text-center text-green-600 text-sm font-medium flex items-center justify-center">
                                                        <CheckCircle className="w-4 h-4 mr-2" /> Completed
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Past Appointments */}
                    {past.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Past Appointments</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {past.map(appointment => (
                                    <div key={appointment._id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-400 opacity-80">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-lg font-semibold text-gray-700 flex items-center">
                                                <User className="w-4 h-4 mr-2 text-gray-500" />
                                                {appointment.userData.name}
                                            </h4>
                                            {/* Payment Status for Past */}
                                            {appointment.paymentStatus && (
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    appointment.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {appointment.paymentStatus.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-1 text-gray-600 text-sm">
                                            <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-500" /> {formatDate(appointment.slotDate)}</p>
                                            <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-500" /> {appointment.slotTime}</p>
                                            <p className="flex items-center"><DollarSign className="w-4 h-4 mr-2 text-gray-500" /> ${appointment.amount}</p>
                                            {appointment.userData.email && <p className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-500" /> {appointment.userData.email}</p>}
                                            {appointment.userData.phone && <p className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-500" /> {appointment.userData.phone}</p>}
                                        </div>
                                        {appointment.isCompleted && (
                                            <p className="mt-4 text-center text-green-600 text-sm font-medium flex items-center justify-center">
                                                <CheckCircle className="w-4 h-4 mr-2" /> Completed
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cancelled Appointments */}
                    {cancelled.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Cancelled Appointments</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {cancelled.map(appointment => (
                                    <div key={appointment._id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 opacity-80">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-lg font-semibold text-gray-700 flex items-center">
                                                <User className="w-4 h-4 mr-2 text-red-500" />
                                                {appointment.userData.name}
                                            </h4>
                                            {/* Removed payment status from here */}
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                CANCELLED
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-gray-600 text-sm">
                                            <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-500" /> {formatDate(appointment.slotDate)}</p>
                                            <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-500" /> {appointment.slotTime}</p>
                                            <p className="flex items-center"><DollarSign className="w-4 h-4 mr-2 text-gray-500" /> ${appointment.amount}</p>
                                            {appointment.userData.email && <p className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-500" /> {appointment.userData.email}</p>}
                                            {appointment.userData.phone && <p className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-500" /> {appointment.userData.phone}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DoctorAppointment;