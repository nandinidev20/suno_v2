import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { 
  Search, 
  Eye,
  Edit,
  Trash2,
  Crown,
  User,
  Save,
  X
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { adminApiService } from '../../utils/adminApi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPremium, setFilterPremium] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const { adminToken } = useAdminAuth();

  useEffect(() => {
    if (adminToken) {
      fetchUsers();
    }
  }, [adminToken]);

  const fetchUsers = async () => {
    try {
      const response = await adminApiService.getUsers(adminToken);
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Set empty array if there's an error
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setEditForm({
      email: user.email,
      is_premium: user.is_premium,
      subscription_status: user.subscription_status || ''
    });
  };

  const handleSaveEdit = async (userId) => {
    try {
      const response = await adminApiService.updateUser(adminToken, userId, editForm);
      if (response.data.success) {
        const updatedUsers = users.map(user => 
          user.id === userId 
            ? { ...user, ...editForm }
            : user
        );
        setUsers(updatedUsers);
        setEditingUser(null);
        setEditForm({});
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error updating user:', error);
      // You could add an error toast here
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await adminApiService.deleteUser(adminToken, userId);
        if (response.data.success) {
          setUsers(users.filter(user => user.id !== userId));
          // You could add a toast notification here
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        // You could add an error toast here
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPremium === 'all' || 
      (filterPremium === 'premium' && user.is_premium) ||
      (filterPremium === 'regular' && !user.is_premium);
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (user) => {
    if (user.is_premium) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <User className="w-3 h-3 mr-1" />
        Regular
      </span>
    );
  };

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
        <AdminHeader title="Users Management" />
        
        <main className="p-6">
          {/* Filters and Search */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-purple-500" />
              </div>
              <input
                type="text"
                placeholder="Search users by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-purple-200 rounded-xl leading-5 bg-white placeholder-purple-400 focus:outline-none focus:placeholder-purple-500 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
              />
            </div>
            
            <select
              value={filterPremium}
              onChange={(e) => setFilterPremium(e.target.value)}
              className="px-4 py-3 border border-purple-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
            >
              <option value="all">All Users</option>
              <option value="premium">Premium Only</option>
              <option value="regular">Regular Only</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/50 bg-gradient-to-r from-purple-50 to-blue-50">
              <h3 className="text-xl font-semibold text-gray-900">
                Users ({filteredUsers.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/50">
                <thead className="bg-gradient-to-r from-purple-100 to-blue-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      Daily Count
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-white/50">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/80 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-sm font-semibold text-white">
                              {user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {editingUser === user.id ? (
                                <input
                                  type="email"
                                  value={editForm.email}
                                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                  className="w-full px-2 py-1 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                                />
                              ) : (
                                user.email
                              )}
                            </div>
                            <div className="text-sm text-purple-600">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {editingUser === user.id ? (
                            <select
                              value={editForm.subscription_status}
                              onChange={(e) => setEditForm({...editForm, subscription_status: e.target.value})}
                              className="w-full px-2 py-1 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                            >
                              <option value="">No subscription</option>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            user.subscription_status || 'No subscription'
                          )}
                        </div>
                        {user.stripe_customer_id && (
                          <div className="text-xs text-purple-600">
                            Customer: {user.stripe_customer_id}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.daily_count}/3
                        </div>
                        <div className="text-xs text-purple-600">
                          Last reset: {formatDate(user.last_reset)}
                        </div>
                      </td>
                                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                         {formatDate(user.created_at)}
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200">
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {editingUser === user.id ? (
                            <>
                              <button 
                                onClick={() => handleSaveEdit(user.id)}
                                className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-all duration-200"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={handleCancelEdit}
                                className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-all duration-200"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-purple-500">
                  {searchTerm || filterPremium !== 'all' 
                    ? 'No users found matching your criteria.' 
                    : 'No users found.'}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;
