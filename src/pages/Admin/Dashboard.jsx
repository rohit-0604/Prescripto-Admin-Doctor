import React, { useContext, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUserMd,
  FaUser,
  FaCalendarCheck,
  FaClock,
  FaTimesCircle,
  FaPlusCircle,
  FaListAlt,
  FaStethoscope,
} from 'react-icons/fa';
import { AdminContext } from '../../context/AdminContext';

const Dashboard = () => {
  const { aToken, doctors, patientsCount, appointments, getAllDoctors, getAllAppointments } = useContext(AdminContext);

  useEffect(() => {
    if (aToken && doctors.length === 0) getAllDoctors();
    if (aToken && appointments.length === 0) getAllAppointments();
  }, [aToken, doctors.length, appointments.length, getAllDoctors, getAllAppointments]);

  const getAppointmentDateTimeObject = (appointment) => {
    const [day, month, year] = appointment.slotDate.split('_').map(Number);
    let [hour, minute] = appointment.slotTime.split(' ')[0].split(':').map(Number);
    const ampm = appointment.slotTime.split(' ')[1];
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return new Date(year, month - 1, day, hour, minute);
  };

  const { stats, specialityDistribution } = useMemo(() => {
    const now = new Date();
    let totalDoctors = doctors.length;
    let totalAppointments = appointments.length;
    let upcomingAppointments = 0;
    let pastAppointments = 0;
    let cancelledAppointments = 0;
    const specialityCounts = {};

    appointments.forEach((appt) => {
      if (appt.cancelled) cancelledAppointments++;
      else {
        const apptDateTime = getAppointmentDateTimeObject(appt);
        if (apptDateTime >= now) upcomingAppointments++;
        else pastAppointments++;
      }
    });

    doctors.forEach((doc) => {
      specialityCounts[doc.speciality] = (specialityCounts[doc.speciality] || 0) + 1;
    });

    return {
      stats: {
        totalDoctors,
        totalPatients: patientsCount, // ✅ Corrected key here
        totalAppointments,
        upcomingAppointments,
        pastAppointments,
        cancelledAppointments,
      },
      specialityDistribution: Object.entries(specialityCounts).sort(([, a], [, b]) => b - a),
    };
  }, [doctors, appointments, patientsCount]);

  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [appointments]);

  return (
    <div className="min-h-screen max-w-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b-2 pb-4">Admin Dashboard</h2>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<FaUserMd className="text-blue-600 text-4xl" />} label="Total Doctors" value={stats.totalDoctors} />
        <StatCard icon={<FaUser className="text-indigo-600 text-4xl" />} label="Total Patients" value={stats.totalPatients} />
        <StatCard icon={<FaCalendarCheck className="text-green-600 text-4xl" />} label="Total Appointments" value={stats.totalAppointments} />
        <StatCard icon={<FaClock className="text-yellow-600 text-4xl" />} label="Upcoming" value={stats.upcomingAppointments} />
        <StatCard icon={<FaTimesCircle className="text-red-600 text-4xl" />} label="Cancelled" value={stats.cancelledAppointments} />
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Link to="/add-doctor" className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 text-lg font-medium">
            <FaPlusCircle className="mr-2" /> Add New Doctor
          </Link>
          <Link to="/all-appointments" className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200 text-lg font-medium">
            <FaListAlt className="mr-2" /> View All Appointments
          </Link>
          <Link to="/doctors-list" className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200 text-lg font-medium">
            <FaUserMd className="mr-2" /> Manage Doctors
          </Link>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Recent Appointments</h3>
        {recentAppointments.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {recentAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{appointment.userData.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{appointment.docData.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(
                        parseInt(appointment.slotDate.split('_')[2]),
                        parseInt(appointment.slotDate.split('_')[1]) - 1,
                        parseInt(appointment.slotDate.split('_')[0])
                      ).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}{' '}
                      at {appointment.slotTime}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                        appointment.cancelled
                          ? 'bg-red-100 text-red-800'
                          : appointment.isCompleted
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.cancelled ? 'Cancelled' : appointment.isCompleted ? 'Completed' : 'Upcoming'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6 bg-gray-50 rounded-lg shadow-sm">No recent appointments to display.</p>
        )}
      </div>

      {/* Speciality Stats */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Doctor Speciality Distribution</h3>
        {specialityDistribution.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Speciality</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Doctors</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {specialityDistribution.map(([speciality, count]) => (
                  <tr key={speciality} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 flex items-center gap-2">
                      <FaStethoscope className="text-purple-600" />
                      {speciality}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6 bg-gray-50 rounded-lg shadow-sm">No doctor speciality data to display.</p>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-4 hover:shadow-xl transition-shadow duration-300 cursor-default">
    <div>{icon}</div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

export default Dashboard;
