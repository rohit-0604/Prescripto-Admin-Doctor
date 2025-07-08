import { createContext, useEffect, useState, useCallback } from "react";
import axios from 'axios';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [aToken, setAToken] = useState(() => localStorage.getItem('aToken') || false);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patientsCount, setPatientsCount] = useState(0);  // NEW
  const navigate = useNavigate();

  const adminLogout = useCallback(() => {
    setAToken(false);
    localStorage.removeItem('aToken');
    toast.info("Admin logged out successfully.");
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          if (aToken) {
            setAToken(false);
            localStorage.removeItem('aToken');
            toast.info("Admin session expired. Please log in again.");
            navigate("/login");
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [aToken, navigate]);

  const getAllDoctors = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/all-doctors`, {
        headers: { Authorization: `Bearer ${aToken}` }
      });
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message || "Failed to fetch doctors.");
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      if (!(axios.isAxiosError(error) && error.response?.status === 401)) {
        toast.error(error.response?.data?.message || "Error fetching doctors.");
      }
    }
  }, [backendUrl, aToken]);

  const changeAvailability = useCallback(async (docId) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/change-availability`, { docId }, {
        headers: { Authorization: `Bearer ${aToken}` }
      });
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message || "Failed to change availability.");
      }
    } catch (error) {
      console.error("Error changing availability:", error);
      if (!(axios.isAxiosError(error) && error.response?.status === 401)) {
        toast.error(error.response?.data?.message || "Error changing availability.");
      }
    }
  }, [backendUrl, aToken, getAllDoctors]);

  const getAllAppointments = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/appointments`, {
        headers: { Authorization: `Bearer ${aToken}` }
      });
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message || "Failed to fetch appointments.");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      if (!(axios.isAxiosError(error) && error.response?.status === 401)) {
        toast.error(error.message || "Error fetching appointments.");
      }
    }
  }, [backendUrl, aToken]);

  // NEW: Fetch patients count
  const getPatientsCount = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/patients-count`, {
        headers: { Authorization: `Bearer ${aToken}` }
      });
      if (data.success) {
        setPatientsCount(data.count);
      } else {
        toast.error(data.message || "Failed to fetch patients count.");
      }
    } catch (error) {
      console.error("Error fetching patients count:", error);
      if (!(axios.isAxiosError(error) && error.response?.status === 401)) {
        toast.error(error.response?.data?.message || "Error fetching patients count.");
      }
    }
  }, [backendUrl, aToken]);

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
      getPatientsCount();  // NEW: Fetch on token change
    } else {
      setAppointments([]);
      setPatientsCount(0);
    }
  }, [aToken, getAllAppointments, getPatientsCount]);

  const value = {
    aToken, setAToken, backendUrl,
    doctors, getAllDoctors, changeAvailability,
    appointments, setAppointments, getAllAppointments,
    patientsCount,  // NEW: expose to context
    adminLogout,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
