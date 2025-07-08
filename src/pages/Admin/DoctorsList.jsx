import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminContext)
  const [selectedSpecialty, setSelectedSpecialty] = useState('All')

  useEffect(() => {
    if (aToken) {
      getAllDoctors()
    }
  }, [aToken])

  // Filtered doctors based on selected speciality
  const filteredDoctors = selectedSpecialty === 'All'
    ? doctors
    : doctors.filter(doc => doc.speciality.toLowerCase() === selectedSpecialty.toLowerCase())

  const specialties = ['All', 'General physician', 'Gynecologist', 'Dermatologist', 'Pediatrician', 'Neurologist']

  return (
    <div className="p-6 w-full">
      {/* Heading */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">All Doctors</h1>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {specialties.map((spec, index) => (
          <button
            key={index}
            onClick={() => setSelectedSpecialty(spec)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300
              ${selectedSpecialty === spec
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredDoctors.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 border border-gray-100"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover bg-indigo-50 group-hover:bg-primary transition-all duration-300"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">{item.name}</h2>
              <p className="text-sm text-gray-500 mb-3">{item.speciality}</p>
              <div className="flex items-center gap-2 text-sm">
                <input onChange={()=>changeAvailability(item._id)} type="checkbox" checked={item.available} readOnly className="accent-primary" />
                <p className={`font-medium ${item.available ? 'text-green-600' : 'text-red-500'}`}>
                  {item.available ? 'Available' : 'Unavailable'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>  
    </div>
  )
}

export default DoctorsList
