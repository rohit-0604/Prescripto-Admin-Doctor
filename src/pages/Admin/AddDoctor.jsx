import React, { useContext, useState } from 'react';
import { Upload, ChevronDown } from 'lucide-react';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddDoctor = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrlPreview, setImageUrlPreview] = useState(null);

  const [doctorName, setDoctorName] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [doctorEmail, setDoctorEmail] = useState('');
  const [degree, setDegree] = useState('');
  const [doctorPassword, setDoctorPassword] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [experience, setExperience] = useState('');
  const [fees, setFees] = useState('');
  const [aboutDoctor, setAboutDoctor] = useState('');

  const { backendUrl, aToken } = useContext(AdminContext);

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setImageUrlPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error("Please select a doctor's picture.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('name', doctorName);
      formData.append('email', doctorEmail);
      formData.append('password', doctorPassword);
      formData.append('experience', experience);
      formData.append('fees', Number(fees));
      formData.append('about', aboutDoctor);
      formData.append('speciality', speciality);
      formData.append('degree', degree);
      formData.append('address', JSON.stringify({ line1: address1, line2: address2 }));

      const { data } = await axios.post(backendUrl + '/api/admin/add-doctor', formData, {
        headers: {
          'Authorization': `Bearer ${aToken}`,
        },
      });

      if (data.success) {
        toast.success(data.message || "Doctor added successfully!");
        setImageFile(null);
        setImageUrlPreview(null);
        setDoctorName('');
        setSpeciality('');
        setDoctorEmail('');
        setDegree('');
        setDoctorPassword('');
        setAddress1('');
        setAddress2('');
        setExperience('');
        setFees('');
        setAboutDoctor('');
      } else {
        toast.error(data.message || "Failed to add doctor.");
      }
    } catch (error) {
      console.error("Error adding doctor:", error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status !== 401) {
            toast.error(error.response.data.message || `Error: ${error.response.status} - Server error.`);
          }
        } else if (error.request) {
          toast.error("Network error: No response from server.");
        } else {
          toast.error("Unexpected error setting up request.");
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-4xl flex flex-col h-full max-h-[calc(100vh-4rem)] border border-gray-100 mx-auto overflow-y-auto">
      <h2 className="sticky top-0 bg-white z-10 text-3xl font-bold mb-6 border-b border-gray-200 py-4">
        Add Doctor
      </h2>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-4 -mr-4 py-2">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Upload Image */}
          <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-lg border border-dashed border-primary/30 min-w-[180px] md:min-w-[200px] shadow-inner">
            <label htmlFor="doc-img" className="cursor-pointer flex flex-col items-center">
              <img
                src={imageUrlPreview || assets.upload_area}
                alt="Upload Doctor Picture"
                className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-primary/50 shadow-md mb-4 transition-transform duration-200 hover:scale-105"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/e0e0e0/000000?text=Upload&font=arial"; }}
              />
              <Upload className="w-7 h-7 text-primary mb-2" />
              <p className="text-center text-primary font-medium text-sm">
                Upload doctor <br /> picture
              </p>
            </label>
            <input type="file" id="doc-img" hidden onChange={handleImageChange} accept="image/*" />
          </div>

          {/* Form Inputs */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

            {/* Doctor Name */}
            <div>
              <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
              <input
                type="text"
                id="doctorName"
                placeholder="Name"
                required
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Speciality */}
            <div>
              <label htmlFor="speciality" className="block text-sm font-medium text-gray-700 mb-1">Speciality</label>
              <div className="relative">
                <select
                  id="speciality"
                  value={speciality}
                  onChange={(e) => setSpeciality(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm appearance-none focus:ring-primary focus:border-primary transition-all duration-200 pr-10 bg-white cursor-pointer"
                >
                  <option value="">Select Speciality</option>
                  <option value="General physician">General physician</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Neurologist">Neurologist</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Doctor Email */}
            <div>
              <label htmlFor="doctorEmail" className="block text-sm font-medium text-gray-700 mb-1">Doctor Email</label>
              <input
                type="email"
                id="doctorEmail"
                placeholder="admin@prescripto.com"
                required
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Degree */}
            <div>
              <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">Education</label>
              <input
                type="text"
                id="degree"
                placeholder="Education"
                required
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="doctorPassword" className="block text-sm font-medium text-gray-700 mb-1">Doctor Password</label>
              <input
                type="password"
                id="doctorPassword"
                placeholder="********"
                required
                value={doctorPassword}
                onChange={(e) => setDoctorPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                id="address1"
                placeholder="address 1"
                required
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition-all duration-200 mb-3 placeholder-gray-400"
              />
              <input
                type="text"
                id="address2"
                placeholder="address 2"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              <div className="relative">
                <select
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm appearance-none focus:ring-primary focus:border-primary transition-all duration-200 pr-10 bg-white cursor-pointer"
                >
                  <option value="">Select Experience</option>
                  {[...Array(11).keys()].map((year) =>
                    <option key={year} value={`${year} year${year !== 1 ? 's' : ''}`}>
                      {year} {year !== 1 ? 'Years' : 'Year'}
                    </option>
                  )}
                  <option value="10+ years">10+ Years</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Fees */}
            <div>
              <label htmlFor="fees" className="block text-sm font-medium text-gray-700 mb-1">Fees</label>
              <input
                type="number"
                id="fees"
                placeholder="fees"
                required
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* About Doctor */}
            <div className="md:col-span-2">
              <label htmlFor="aboutDoctor" className="block text-sm font-medium text-gray-700 mb-1">About Doctor</label>
              <textarea
                id="aboutDoctor"
                placeholder="write about doctor"
                rows="4"
                required
                value={aboutDoctor}
                onChange={(e) => setAboutDoctor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition-all duration-200 resize-y placeholder-gray-400"
              ></textarea>
            </div>

          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            type="submit"
            className="w-full md:w-auto px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
          >
            Add Doctor
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDoctor;
