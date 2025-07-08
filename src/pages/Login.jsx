// src/pages/Login.jsx
import React, { useContext, useState } from 'react';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext'; // Import DoctorContext
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [state, setState] = useState('Admin'); // Can be 'Admin' or 'Doctor'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { setAToken, backendUrl } = useContext(AdminContext);
    const { setDToken } = useContext(DoctorContext); // Get setDToken from DoctorContext

    const navigate = useNavigate();

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        const url = state === 'Admin'
            ? backendUrl + '/api/admin/login'
            : backendUrl + '/api/doctor/login';

        try {
            const { data } = await axios.post(url, { email, password });

            if (data.success) {
                if (state === 'Admin') {
                    localStorage.setItem('aToken', data.token);
                    setAToken(data.token);
                    toast.success('Admin Login Successful!');
                    const redirectPath = localStorage.getItem('redirectPath') || '/admin-dashboard';
                    localStorage.removeItem('redirectPath');
                    navigate(redirectPath);
                } else { // state === 'Doctor'
                    localStorage.setItem('dToken', data.token); // Store doctor token
                    setDToken(data.token); // Set doctor token in context
                    toast.success('Doctor Login Successful!');
                    const redirectPath = localStorage.getItem('redirectPath') || '/doctor-dashboard'; // Default for doctor
                    localStorage.removeItem('redirectPath');
                    navigate(redirectPath);
                }
            } else {
                // This 'else' block will be hit if the backend sends a 200 OK with success: false
                // (e.g., for doctor login with invalid credentials)
                toast.error(data.message || "Login failed. Please try again.");
            }
        } catch (error) {
            // Handle Axios errors (e.g., 401 for admin login, network errors)
            if (axios.isAxiosError(error) && error.response) {
                // If the error has a response, display its message
                toast.error(error.response.data.message || "An error occurred on the server.");
            } else if (axios.isAxiosError(error) && !error.response) {
                // Handle network errors (server unreachable, no response)
                toast.error("Network error or server unreachable. Please check your connection.");
            } else {
                // Handle any other unexpected errors
                console.error("Unexpected error during login:", error);
                toast.error("An unexpected error occurred during login.");
            }
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='min-h-screen flex items-center justify-center p-4'>
            <div className='flex flex-col gap-5 w-full max-w-sm p-8 border rounded-xl text-gray-700 shadow-xl bg-white'>
                <p className='text-3xl font-bold m-auto'>
                    <span className='text-primary'> {state} </span> Login
                </p>
                <div className='w-full'>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        id="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='border border-gray-300 rounded-md w-full p-3 mt-1 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200'
                    />
                </div>
                <div className='w-full'>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        id="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='border border-gray-300 rounded-md w-full p-3 mt-1 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200'
                    />
                </div>
                <button
                    type="submit"
                    className='bg-primary text-white w-full py-3 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors duration-200 shadow-md'
                >
                    Login
                </button>

                {state === 'Admin' ?
                    <p className='text-center text-sm'>
                        Doctor Login? <span className='text-primary underline cursor-pointer hover:text-primary/80 transition-colors' onClick={() => setState('Doctor')}>Click Here</span>
                    </p>
                    :
                    <p className='text-center text-sm'>
                        Admin Login? <span className='text-primary underline cursor-pointer hover:text-primary/80 transition-colors' onClick={() => setState('Admin')}>Click Here</span>
                    </p>
                }
            </div>
        </form>
    );
};

export default Login;