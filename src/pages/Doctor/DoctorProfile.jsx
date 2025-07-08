// frontend/src/pages/Doctor/DoctorProfile.jsx
import React, { useContext, useState, useEffect } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { toast } from 'react-toastify';
import { Mail, Briefcase, GraduationCap, Info, MapPin, DollarSign, CalendarDays, Edit2, Save, XCircle } from 'lucide-react';

const DoctorProfile = () => {
    const { doctorProfileData, updateDoctorProfile, toggleDoctorAvailability } = useContext(DoctorContext);

    // State for managing edit mode
    const [isEditing, setIsEditing] = useState(false);
    // State for holding form data (editable fields)
    const [formData, setFormData] = useState({
        name: '',
        fees: '',
        address: { line1: '', line2: '' },
        about: '',
        experience: ''
    });
    // State for availability checkbox (separate from edit mode)
    const [isAvailable, setIsAvailable] = useState(false);

    // Effect to initialize form data and availability when doctorProfileData changes
    useEffect(() => {
        if (doctorProfileData) {
            setFormData({
                name: doctorProfileData.name || '',
                fees: doctorProfileData.fees || '',
                address: {
                    line1: doctorProfileData.address?.line1 || '', // Use optional chaining for safety
                    line2: doctorProfileData.address?.line2 || ''  // Use optional chaining for safety
                },
                about: doctorProfileData.about || '',
                experience: doctorProfileData.experience || ''
            });
            setIsAvailable(doctorProfileData.available);
        }
    }, [doctorProfileData]); // Re-run when doctorProfileData from context changes

    // Handler for input changes in edit mode
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'line1' || name === 'line2') {
            setFormData(prevData => ({
                ...prevData,
                address: {
                    ...prevData.address,
                    [name]: value
                }
            }));
        } else {
            setFormData(prevData => ({
                ...prevData,
                [name]: value
            }));
        }
    };

    // Handler for "Edit Profile" button click
    const handleEditClick = () => {
        setIsEditing(true);
    };

    // Handler for "Cancel" button click
    const handleCancelClick = () => {
        setIsEditing(false);
        // Reset form data to original profile data on cancel
        if (doctorProfileData) {
            setFormData({
                name: doctorProfileData.name || '',
                fees: doctorProfileData.fees || '',
                address: {
                    line1: doctorProfileData.address?.line1 || '',
                    line2: doctorProfileData.address?.line2 || ''
                },
                about: doctorProfileData.about || '',
                experience: doctorProfileData.experience || ''
            });
        }
    };

    // Handler for "Save Information" button click
    const handleSaveClick = async () => {
        // Basic Validation (add more robust validation as needed)
        if (!formData.name || !formData.fees || !formData.address.line1 || !formData.about || !formData.experience) {
            toast.error("Please fill in all required profile fields.");
            return;
        }
        if (isNaN(formData.fees) || parseFloat(formData.fees) <= 0) {
            toast.error("Fees must be a positive number.");
            return;
        }
        if (isNaN(formData.experience) || parseFloat(formData.experience) < 0) {
            toast.error("Experience must be a non-negative number.");
            return;
        }

        const result = await updateDoctorProfile(formData);
        if (result.success) {
            setIsEditing(false);
            // doctorProfileData in context is already updated by updateDoctorProfile
            // The useEffect hook will then sync this local formData with the updated context data
        }
        // No else needed here, as toast messages are handled in context function
    };

    // Handler for Availability Toggle (Checkbox)
    const handleAvailabilityToggle = async () => {
        // Toggle local state immediately for a snappier UI, then call API
        setIsAvailable(prev => !prev);
        const result = await toggleDoctorAvailability();
        if (!result.success) {
            // If API call failed, revert the local state back
            setIsAvailable(prev => !prev);
        }
        // No else needed here, as toast messages are handled in context function
    };


    if (!doctorProfileData) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)] text-gray-500 text-lg">
                Loading doctor profile...
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center md:text-left">My Profile</h1>

            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6 pb-6 border-b border-gray-200">
                    <img
                        src={doctorProfileData.image || '/path/to/default/avatar.png'} // Consider default avatar path
                        alt={doctorProfileData.name}
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-primary shadow-md flex-shrink-0"
                    />
                    <div className="text-center md:text-left flex-1">
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="text-2xl sm:text-3xl font-semibold text-gray-900 w-full mb-1 p-1 border rounded-md focus:ring-primary focus:border-primary"
                                placeholder="Doctor Name"
                            />
                        ) : (
                            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">{doctorProfileData.name}</h2>
                        )}

                        <p className="text-primary text-md sm:text-lg font-medium">{doctorProfileData.speciality}</p>

                        {/* Availability Toggle - Separate Functionality */}
                        <div className="mt-2 flex items-center justify-center md:justify-start space-x-2">
                            <label htmlFor="availability-toggle" className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="availability-toggle"
                                    className="sr-only peer"
                                    checked={isAvailable}
                                    onChange={handleAvailabilityToggle}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                <span className="ml-3 text-sm font-medium text-gray-900">
                                    {isAvailable ? 'Available' : 'Not Available'}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Edit/Save/Cancel Buttons */}
                    <div className="md:self-start md:ml-auto flex items-center gap-2 mt-4 md:mt-0">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSaveClick}
                                    className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors tooltip"
                                    title="Save Changes" // Tooltip
                                >
                                    <Save className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleCancelClick}
                                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors tooltip"
                                    title="Cancel Edit" // Tooltip
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleEditClick}
                                className="p-2 rounded-full bg-primary text-white hover:bg-blue-600 transition-colors tooltip"
                                title="Edit Profile" // Tooltip
                            >
                                <Edit2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700">
                    <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                        <span className="font-medium">Email:</span> <span className="break-words">{doctorProfileData.email}</span>
                    </div>
                    <div className="flex items-center">
                        <GraduationCap className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                        <span className="font-medium">Degree:</span> {doctorProfileData.degree}
                    </div>

                    <div className="flex items-center">
                        <Briefcase className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                        <span className="font-medium">Experience:</span>
                        {isEditing ? (
                            <input
                                type="number" // Changed to number input
                                name="experience"
                                value={formData.experience}
                                onChange={handleInputChange}
                                className="ml-2 flex-1 p-1 border rounded-md focus:ring-primary focus:border-primary"
                                placeholder="Years of Experience"
                            />
                        ) : (
                            doctorProfileData.experience
                        )}
                    </div>
                    <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                        <span className="font-medium">Fees:</span>
                        {isEditing ? (
                            <input
                                type="number"
                                name="fees"
                                value={formData.fees}
                                onChange={handleInputChange}
                                className="ml-2 flex-1 p-1 border rounded-md focus:ring-primary focus:border-primary"
                                placeholder="Consultation Fees"
                            />
                        ) : (
                            `$${doctorProfileData.fees}`
                        )}
                    </div>

                    <div className="flex items-start col-span-1 md:col-span-2">
                        <MapPin className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0 mt-1" />
                        <div>
                            <span className="font-medium block">Address:</span>
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        name="line1"
                                        value={formData.address.line1}
                                        onChange={handleInputChange}
                                        placeholder="Address Line 1"
                                        className="w-full mb-1 p-1 border rounded-md focus:ring-primary focus:border-primary"
                                    />
                                    <input
                                        type="text"
                                        name="line2"
                                        value={formData.address.line2}
                                        onChange={handleInputChange}
                                        placeholder="Address Line 2 (Optional)"
                                        className="w-full p-1 border rounded-md focus:ring-primary focus:border-primary"
                                    />
                                </>
                            ) : (
                                <p className="mt-1 leading-relaxed">
                                    {doctorProfileData.address?.line1}
                                    {doctorProfileData.address?.line2 ? `, ${doctorProfileData.address.line2}` : ''}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start col-span-1 md:col-span-2">
                        <Info className="w-5 h-5 text-gray-500 mr-3 mt-1 flex-shrink-0" />
                        <div>
                            <span className="font-medium block">About:</span>
                            {isEditing ? (
                                <textarea
                                    name="about"
                                    value={formData.about}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                                    placeholder="Tell us about yourself..."
                                ></textarea>
                            ) : (
                                <p className="mt-1 leading-relaxed">{doctorProfileData.about}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <CalendarDays className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                        <span className="font-medium">Registration Date:</span> {new Date(doctorProfileData.date).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;