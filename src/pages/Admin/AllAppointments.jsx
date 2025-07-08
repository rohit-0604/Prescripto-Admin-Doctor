// src/pages/admin/AllAppointments.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments } = useContext(AdminContext);

  const [showUpcomingSection, setShowUpcomingSection] = useState(true);
  const [showPastSection, setShowPastSection] = useState(false);
  const [showCancelledSection, setShowCancelledSection] = useState(false);
  const [collapsedDates, setCollapsedDates] = useState({});

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken, getAllAppointments]);

  const formatDate = (dateObj) =>
    dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });

  const parseDateTime = (appointment) => {
    const [day, month, year] = appointment.slotDate.split('_').map(Number);
    let [hour, minute] = appointment.slotTime.split(' ')[0].split(':').map(Number);
    const ampm = appointment.slotTime.split(' ')[1];

    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    return new Date(year, month - 1, day, hour, minute);
  };

  const sevenDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const { upcomingGrouped, pastAppointments, cancelledAppointments } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcoming = {};
    sevenDays.forEach(day => {
      upcoming[formatDate(day)] = [];
    });

    const past = [];
    const cancelled = [];

    appointments.forEach(appointment => {
      if (appointment.cancelled) {
        cancelled.push(appointment);
      } else {
        const dt = parseDateTime(appointment);
        const dateOnly = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());

        if (dateOnly >= now) {
          const str = formatDate(dateOnly);
          if (upcoming[str]) upcoming[str].push(appointment);
        } else {
          past.push(appointment);
        }
      }
    });

    Object.keys(upcoming).forEach(date => {
      upcoming[date].sort((a, b) => parseDateTime(a) - parseDateTime(b));
    });

    const sortDesc = (a, b) => parseDateTime(b) - parseDateTime(a);
    past.sort(sortDesc);
    cancelled.sort(sortDesc);

    return { upcomingGrouped: upcoming, pastAppointments: past, cancelledAppointments: cancelled };
  }, [appointments, sevenDays]);

  const getStatusBadgeClass = (paymentStatus, isCancelled, isCompleted, appointment) => {
    const dt = parseDateTime(appointment);
    const now = new Date();

    if (isCancelled) return 'bg-red-100 text-red-800';
    if (isCompleted) return 'bg-blue-100 text-blue-800';
    if (paymentStatus === 'failed') return 'bg-red-100 text-red-800';
    if (paymentStatus === 'paid') return 'bg-green-100 text-green-800';
    if (dt < now) return 'bg-gray-100 text-gray-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (paymentStatus, isCancelled, isCompleted, appointment) => {
    if (isCancelled) return 'Cancelled';
    if (isCompleted) return 'Completed';

    const dt = parseDateTime(appointment);
    const now = new Date();

    if (dt < now) {
      return paymentStatus === 'paid' ? 'Completed' : 'Missed (Unpaid)';
    }
    return 'Upcoming';
  };

  const renderAppointmentsTable = (list) => (
    <div className="overflow-x-auto bg-white shadow-xl rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Doctor</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Booked</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Txn ID</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {list.map(appointment => (
            <tr key={appointment._id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <div className="text-sm font-medium">{appointment.userData.name}</div>
                <div className="text-xs text-gray-500">{appointment.userData.email}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium">{appointment.docData.name}</div>
                <div className="text-xs text-gray-500">{appointment.docData.speciality}</div>
              </td>
              <td className="px-6 py-4 text-sm">{appointment.slotTime}</td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-800">₹{appointment.amount.toFixed(2)}</td>
              <td className="px-6 py-4">
                <span className={`px-2 inline-flex text-xs rounded-full font-semibold ${getStatusBadgeClass(appointment.paymentStatus, appointment.cancelled, appointment.isCompleted, appointment)}`}>
                  {appointment.paymentStatus === 'paid' ? 'Paid' :
                   appointment.paymentStatus === 'failed' ? 'Failed' : 'Pending'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 inline-flex text-xs rounded-full font-semibold ${getStatusBadgeClass(appointment.paymentStatus, appointment.cancelled, appointment.isCompleted, appointment)}`}>
                  {getStatusText(appointment.paymentStatus, appointment.cancelled, appointment.isCompleted, appointment)}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(appointment.date).toLocaleDateString('en-US')}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {appointment.payuTxnId?.slice(0, 8) + '...' || 'N/A'}
                {appointment.payuPaymentId && (
                  <div className="text-xs text-gray-400">PayU ID: {appointment.payuPaymentId.slice(0, 8) + '...'}</div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-4 max-w-6xl mx-auto mt-12">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b-2 pb-4">All Appointments</h2>

      {appointments.length === 0 ? (
        <p className="text-center text-gray-500 py-12 text-lg">No appointments found.</p>
      ) : (
        <div className="space-y-10">
          {/* ✅ Upcoming Section */}
          {Object.values(upcomingGrouped).flat().length > 0 && (
            <Section
              title="Upcoming Appointments"
              count={Object.values(upcomingGrouped).flat().length}
              color="blue"
              isOpen={showUpcomingSection}
              toggle={() => setShowUpcomingSection(p => !p)}
            >
              {Object.entries(upcomingGrouped).map(([date, list]) => (
                list.length > 0 && (
                  <div key={date} className="mb-6">
                    <h4
                      onClick={() =>
                        setCollapsedDates(prev => ({ ...prev, [date]: !prev[date] }))
                      }
                      className="flex justify-between items-center text-lg font-medium text-gray-700 mb-2 bg-gray-100 px-3 py-2 rounded cursor-pointer"
                    >
                      <span>{date} ({list.length})</span>
                      {collapsedDates[date] ? <FaChevronDown /> : <FaChevronUp />}
                    </h4>
                    <div className={`${collapsedDates[date] ? 'max-h-0' : 'max-h-[3000px]'} overflow-hidden transition-all duration-500`}>
                      {renderAppointmentsTable(list)}
                    </div>
                  </div>
                )
              ))}
            </Section>
          )}

          {/* ✅ Past Section */}
          {pastAppointments.length > 0 && (
            <Section
              title="Past Appointments"
              count={pastAppointments.length}
              color="gray"
              isOpen={showPastSection}
              toggle={() => setShowPastSection(p => !p)}
            >
              {renderAppointmentsTable(pastAppointments)}
            </Section>
          )}

          {/* ✅ Cancelled Section */}
          {cancelledAppointments.length > 0 && (
            <Section
              title="Cancelled Appointments"
              count={cancelledAppointments.length}
              color="red"
              isOpen={showCancelledSection}
              toggle={() => setShowCancelledSection(p => !p)}
            >
              {renderAppointmentsTable(cancelledAppointments)}
            </Section>
          )}
        </div>
      )}
    </div>
  );
};

const Section = ({ title, count, color, isOpen, toggle, children }) => (
  <div className={`border rounded-lg shadow-md overflow-hidden`}>
    <div
      onClick={toggle}
      className={`flex justify-between items-center bg-${color}-50 p-4 cursor-pointer hover:bg-${color}-100 transition-colors`}
    >
      <h3 className={`text-xl font-semibold text-${color}-800`}>
        {title} ({count})
      </h3>
      {isOpen ? <FaChevronUp className={`text-${color}-600`} /> : <FaChevronDown className={`text-${color}-600`} />}
    </div>
    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[3000px]' : 'max-h-0'}`}>
      <div className="p-4">{children}</div>
    </div>
  </div>
);

export default AllAppointments;
