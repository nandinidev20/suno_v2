import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { 
  Users, 
  Music, 
  TrendingUp, 
  DollarSign,
  Activity
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { adminApiService } from '../../utils/adminApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { adminToken } = useAdminAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [userStats, tracksResponse] = await Promise.all([
          adminApiService.getUserStats(adminToken),
          adminApiService.getTracks(adminToken)
        ]);
        
        setStats({
          ...userStats.data.data,
          totalTracks: tracksResponse.data.data?.length || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Set default stats if there's an error
        setStats({
          totalUsers: 0,
          premiumUsers: 0,
          activeSubscriptions: 0,
          totalTracks: 0
        });
      } finally {
        setLoading(false);
      }
    };

    if (adminToken) {
      fetchStats();
    }
  }, [adminToken]);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Premium Users',
      value: stats?.premiumUsers || 0,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Active Subscriptions',
      value: stats?.activeSubscriptions || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Total Tracks',
      value: stats?.totalTracks || 0,
      icon: Music,
      color: 'bg-orange-500',
      change: '+23%',
      changeType: 'positive'
    }
  ];

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100">
        <AdminHeader title="Dashboard" />
        
        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className={`p-4 rounded-2xl ${stat.color} shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className={`text-sm font-semibold ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">from last month</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Users</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-semibold text-gray-900">New user registered</p>
                      <p className="text-xs text-purple-600">2 minutes ago</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-semibold text-gray-900">Premium subscription</p>
                      <p className="text-xs text-green-600">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105">
                  <Users className="w-4 h-4 mr-2" />
                  View All Users
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 border border-purple-200 rounded-xl shadow-lg text-sm font-semibold text-purple-700 bg-white hover:bg-purple-50 transition-all duration-200 transform hover:scale-105">
                  <Music className="w-4 h-4 mr-2" />
                  Manage Music
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 border border-blue-200 rounded-xl shadow-lg text-sm font-semibold text-blue-700 bg-white hover:bg-blue-50 transition-all duration-200 transform hover:scale-105">
                  <Activity className="w-4 h-4 mr-2" />
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
