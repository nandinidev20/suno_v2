import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';

const AdminHeader = ({ title, children }) => {
  const location = useLocation();
  
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path === '/admin/users') return 'Users Management';
    if (path === '/admin/music') return 'Music Management';
    return 'Admin Panel';
  };

  return (
    <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 border-b border-white/20 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title || getBreadcrumb()}</h1>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <span className="text-purple-200">Admin Panel</span>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-purple-300">/</span>
                  <span className="text-white">{getBreadcrumb()}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-purple-300" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full pl-10 pr-3 py-2 border border-white/30 rounded-xl leading-5 bg-white/20 placeholder-purple-200 text-white focus:outline-none focus:placeholder-purple-100 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 backdrop-blur-sm"
            />
          </div>
          
          {/* Notifications */}
          <button className="p-2 text-purple-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-xl transition-all duration-200 hover:bg-white/10">
            <Bell className="h-6 w-6" />
          </button>
          
          {/* Additional actions */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
