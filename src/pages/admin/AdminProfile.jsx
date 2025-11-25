import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Settings,
  Key
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdminProfile = () => {
  const { admin } = useAdminAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: admin?.username || 'admin',
    email: admin?.email || 'admin@musicapp.com',
    role: admin?.role || 'super_admin',
    fullName: 'John Doe',
    bio: 'Experienced administrator with expertise in music platform management and user administration.',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    joinDate: '2024-01-15'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the profile
    setIsEditing(false);
    // You could add a toast notification here
  };

  const handleCancel = () => {
    // Reset to original data
    setProfileData({
      username: admin?.username || 'admin',
      email: admin?.email || 'admin@musicapp.com',
      role: admin?.role || 'super_admin',
      fullName: 'John Doe',
      bio: 'Experienced administrator with expertise in music platform management and user administration.',
      phone: '+1 (555) 123-4567',
      location: 'New York, USA',
      joinDate: '2024-01-15'
    });
    setIsEditing(false);
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      super_admin: { color: 'bg-red-100 text-red-800', label: 'Super Admin' },
      admin: { color: 'bg-blue-100 text-blue-800', label: 'Admin' }
    };
    
    const config = roleConfig[role] || roleConfig.admin;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Shield className="w-4 h-4 mr-2" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100">
        <AdminHeader title="Admin Profile" />
        
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                    <User className="w-16 h-16 text-white" />
                  </div>
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-purple-200 hover:border-purple-400 transition-colors">
                    <Camera className="w-5 h-5 text-purple-600" />
                  </button>
                </div>
                
                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">{profileData.fullName}</h1>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {profileData.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Shield className="w-4 h-4 mr-2" />
                      {getRoleBadge(profileData.role)}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Member since {profileData.joinDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-600" />
                  Personal Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.fullName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <p className="text-gray-900">{profileData.username}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{profileData.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={profileData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.location}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-600" />
                  Additional Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.bio}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <p className="text-gray-900">{getRoleBadge(profileData.role)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                    <p className="text-gray-900">{profileData.joinDate}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            {/* <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Key className="w-5 h-5 mr-2 text-purple-600" />
                Security & Access
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                  <h3 className="font-medium text-gray-900 mb-2">Password</h3>
                  <p className="text-sm text-gray-600 mb-3">Last changed 30 days ago</p>
                  <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                    Change Password
                  </button>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <h3 className="font-medium text-gray-900 mb-2">Two-Factor Auth</h3>
                  <p className="text-sm text-gray-600 mb-3">Not enabled</p>
                  <button className="text-sm text-green-600 hover:text-green-800 font-medium">
                    Enable 2FA
                  </button>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                  <h3 className="font-medium text-gray-900 mb-2">Login Sessions</h3>
                  <p className="text-sm text-gray-600 mb-3">2 active sessions</p>
                  <button className="text-sm text-orange-600 hover:text-orange-800 font-medium">
                    View Sessions
                  </button>
                </div>
              </div>
            </div> */}

            {/* Edit Actions */}
            {isEditing && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4 mr-2 inline" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
                >
                  <Save className="w-4 h-4 mr-2 inline" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminProfile;
