import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Music, 
  LogOut,
  Settings,
  User
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdminSidebar = () => {
  const { logout, admin } = useAdminAuth();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: Home },
    { path: '/admin/users', label: 'Manage Users', icon: Users },
    { path: '/admin/music', label: 'Manage Music List', icon: Music },
    { path: '/admin/profile', label: 'Admin Profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex flex-col shadow-2xl">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-white/20 bg-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white"><img src="/img/logo.png" alt="TRIBA"  style={{width:'145px', height:'36px;', paddingBottom:'11px'}}/></h1>
            <p className="text-sm text-purple-200">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => {
                    const baseClasses = "flex items-center px-4 py-3 text-purple-200 rounded-xl transition-all duration-200 hover:bg-white/10 hover:text-white group";
                    const activeClasses = isActive ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" : "";
                    return `${baseClasses} ${activeClasses}`;
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 mr-3 transition-colors ${
                        isActive ? 'text-white' : 'text-purple-300 group-hover:text-white'
                      }`} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Admin Info & Logout */}
      <div className="p-4 border-t border-white/20 bg-white/5">
        <div className="mb-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
          <p className="text-sm text-purple-200">Logged in as</p>
          <p className="text-white font-semibold text-lg">{admin?.username}</p>
          <p className="text-xs text-purple-300 capitalize">{admin?.role}</p>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-purple-200 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white group"
        >
          <LogOut className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
