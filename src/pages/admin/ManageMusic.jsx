import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { 
  Search, 
  Play, 
  Pause, 
  Trash2, 
  Download, 
  Eye, 
  Music, 
  User, 
  Calendar,
  Filter
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { adminApiService } from '../../utils/adminApi';

const ManageMusic = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStyle, setFilterStyle] = useState('all');
  const { adminToken } = useAdminAuth();

  useEffect(() => {
    if (adminToken) {
      fetchTracks();
    }
  }, [adminToken]);

  const fetchTracks = async () => {
    try {
      const response = await adminApiService.getTracks(adminToken);
      setTracks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      // Set empty array if there's an error
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrack = async (trackId) => {
    if (window.confirm('Are you sure you want to delete this track?')) {
      try {
        await adminApiService.deleteTrack(adminToken, trackId);
        setTracks(tracks.filter(track => track.id !== trackId));
        // You could add a toast notification here
      } catch (error) {
        console.error('Error deleting track:', error);
        // You could add an error toast here
      }
    }
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || track.status === filterStatus;
    const matchesStyle = filterStyle === 'all' || track.style === filterStyle;
    
    return matchesSearch && matchesStatus && matchesStyle;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      completed: { color: 'bg-green-100 text-green-800', icon: '✅' },
      failed: { color: 'bg-red-100 text-red-800', icon: '❌' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStyleBadge = (style) => {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        {style.charAt(0).toUpperCase() + style.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100">
        <AdminHeader title="Music Management" />
        
        <main className="p-6">
          {/* Filters and Search */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-purple-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search tracks by prompt or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-purple-200 rounded-xl leading-5 bg-white placeholder-purple-400 focus:outline-none focus:placeholder-purple-500 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-purple-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={filterStyle}
                onChange={(e) => setFilterStyle(e.target.value)}
                className="px-4 py-3 border border-purple-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
              >
                <option value="all">All Styles</option>
                <option value="pop">Pop</option>
                <option value="rock">Rock</option>
                <option value="jazz">Jazz</option>
                <option value="classical">Classical</option>
                <option value="electronic">Electronic</option>
                <option value="folk">Folk</option>
                <option value="country">Country</option>
                <option value="hip-hop">Hip-Hop</option>
                <option value="r&b">R&B</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Tracks Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/50 bg-gradient-to-r from-purple-50 to-blue-50">
              <h3 className="text-xl font-semibold text-gray-900">
                Music Tracks ({filteredTracks.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/50">
                <thead className="bg-gradient-to-r from-purple-100 to-blue-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      Track Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      Style & Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-white/50">
                  {filteredTracks.map((track) => (
                    <tr key={track.id} className="hover:bg-white/80 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Music className="w-6 h-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 max-w-xs truncate">
                              {track.prompt}
                            </div>
                            <div className="text-sm text-purple-600">
                              ID: {track.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {track.user?.email || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {getStyleBadge(track.style)}
                          <div className="text-sm text-gray-600">
                            {track.duration}s
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(track.status)}
                      </td>
                                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                         {formatDate(track.created_at)}
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-all duration-200">
                            <Play className="w-4 h-4" />
                          </button>
                          <button className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-all duration-200">
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTrack(track.id)}
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
            
            {filteredTracks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-purple-500">
                  {searchTerm || filterStatus !== 'all' || filterStyle !== 'all'
                    ? 'No tracks found matching your criteria.' 
                    : 'No tracks found.'}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageMusic;
