// frontend/src/context/DoctorContext.jsx
import { useState, createContext, useCallback, useEffect, useRef } from "react";
import axios from 'axios';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [dToken, setDToken] = useState(() => localStorage.getItem('dToken') || null);
    const [doctorProfileData, setDoctorProfileData] = useState(null);
    const [doctorAppointments, setDoctorAppointments] = useState([]); // NEW: State for doctor's appointments
    const navigate = useNavigate();
    const hasFetchedProfile = useRef(false);

    const doctorLogout = useCallback(() => {
        setDToken(null);
        setDoctorProfileData(null);
        setDoctorAppointments([]); // Clear appointments on logout
        localStorage.removeItem('dToken');
        hasFetchedProfile.current = false;
        toast.info("Doctor logged out successfully.");
        navigate("/login");
    }, [navigate]);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    if (dToken) {
                        doctorLogout();
                        toast.info("Your doctor session has expired. Please log in again.");
                    }
                }
                return Promise.reject(error);
            }
        );
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [dToken, doctorLogout]);

    const getDoctorProfile = useCallback(async () => {
        if (!dToken || hasFetchedProfile.current) {
            return;
        }
        try {
            const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
                headers: { Authorization: `Bearer ${dToken}` }
            });
            if (data.success) {
                setDoctorProfileData(data.doctor);
                hasFetchedProfile.current = true;
            } else {
                toast.error(data.message || "Failed to fetch doctor profile.");
                setDoctorProfileData(null);
                hasFetchedProfile.current = false;
            }
        } catch (error) {
            console.error("Error fetching doctor profile in DoctorContext:", error);
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.message || "Error fetching doctor profile from server.");
            } else if (axios.isAxiosError(error) && !error.response) {
                toast.error("Network error: Server is unreachable or offline.");
            } else {
                toast.error("An unexpected error occurred while fetching profile.");
            }
            setDoctorProfileData(null);
            hasFetchedProfile.current = false;
        }
    }, [backendUrl, dToken]);

    const updateDoctorProfile = useCallback(async (formData) => {
        if (!dToken) {
            toast.error("You are not authenticated to perform this action.");
            return { success: false, message: "Not authenticated" };
        }
        try {
            const { data } = await axios.put(`${backendUrl}/api/doctor/profile/update`, formData, {
                headers: { Authorization: `Bearer ${dToken}` }
            });

            if (data.success) {
                setDoctorProfileData(data.doctor);
                toast.success(data.message);
                return { success: true, doctor: data.doctor };
            } else {
                toast.error(data.message || "Failed to update profile.");
                return { success: false, message: data.message || "Failed to update profile." };
            }
        } catch (error) {
            console.error("Error updating doctor profile:", error);
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.message || "Error updating doctor profile from server.");
            } else if (axios.isAxiosError(error) && !error.response) {
                toast.error("Network error: Server is unreachable or offline.");
            } else {
                toast.error("An unexpected error occurred while updating profile.");
            }
            return { success: false, message: error.response?.data?.message || "An error occurred." };
        }
    }, [backendUrl, dToken]);

    const toggleDoctorAvailability = useCallback(async () => {
        if (!dToken || !doctorProfileData?._id) {
            toast.error("Authentication or doctor ID missing.");
            return { success: false };
        }
        try {
            const { data } = await axios.put(`${backendUrl}/api/doctor/profile/availability`, {}, {
                headers: { Authorization: `Bearer ${dToken}` }
            });

            if (data.success) {
                setDoctorProfileData(prevData => ({
                    ...prevData,
                    available: !prevData.available
                }));
                toast.success(data.message);
                return { success: true };
            } else {
                toast.error(data.message || "Failed to toggle availability.");
                return { success: false };
            }
        } catch (error) {
            console.error("Error toggling doctor availability:", error);
            toast.error(error.response?.data?.message || "Error toggling availability.");
            return { success: false };
        }
    }, [backendUrl, dToken, doctorProfileData]);

    const fetchDoctorAppointments = useCallback(async () => {
        if (!dToken) {
            setDoctorAppointments([]); // Clear appointments if no token
            return;
        }
        try {
            const { data } = await axios.get(`${backendUrl}/api/doctor/appointments`, {
                headers: { Authorization: `Bearer ${dToken}` }
            });

            if (data.success) {
                setDoctorAppointments(data.appointments);
            } else {
                toast.error(data.message || "Failed to fetch appointments.");
                setDoctorAppointments([]);
            }
        } catch (error) {
            console.error("Error fetching doctor appointments in DoctorContext:", error);
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.message || "Error fetching appointments from server.");
            } else if (axios.isAxiosError(error) && !error.response) {
                toast.error("Network error: Server is unreachable or offline.");
            } else {
                toast.error("An unexpected error occurred while fetching appointments.");
            }
            setDoctorAppointments([]);
        }
    }, [backendUrl, dToken]);

    // Main useEffect for initial profile fetch
    useEffect(() => {
        getDoctorProfile();
        return () => {
            if (!dToken) {
                setDoctorProfileData(null);
                hasFetchedProfile.current = false;
            }
        };
    }, [dToken, getDoctorProfile]);

    const value = {
        dToken,
        setDToken,
        backendUrl,
        doctorLogout,
        doctorProfileData,
        getDoctorProfile,
        updateDoctorProfile,
        toggleDoctorAvailability,
        doctorAppointments,
        fetchDoctorAppointments, 
    };

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    );
};

export default DoctorContextProvider;