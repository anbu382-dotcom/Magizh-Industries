import { useState, useEffect, useCallback } from 'react';
import { User, ShieldCheck, Trash2 } from 'lucide-react';
import Popup, { StatusMessage } from './popup';
import '../styles/componentStyles/UserManagement.css';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [isApprovePopupOpen, setIsApprovePopupOpen] = useState(false);
  const [isRejectPopupOpen, setIsRejectPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();

      // Filter out admin users - only show regular employees
      const employeeUsers = (data.users || []).filter(user => user.role !== 'admin');
      setUsers(employeeUsers);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);

    try {
      const token = sessionStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/pending-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch requests: ${response.status}`);
      }

      const data = await response.json();

      setRequests(data.requests || []);
      setRequestsLoading(false);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setRequestsLoading(false);
    }
  }, []);

  // Check admin status and fetch users on mount
  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const userIsAdmin = parsedUser.role === 'admin';
        setIsAdmin(userIsAdmin);

        if (userIsAdmin) {
          fetchUsers();
          fetchRequests();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [fetchUsers, fetchRequests]);

  const formatLastLogin = (dateString) => {
    if (!dateString) return 'Never';

    const dateObj = new Date(dateString);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear().toString().slice(-2);

    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${day}/${month}/${year} - ${hours}:${minutes}${ampm}`;
  };

  // Delete: Show delete popup
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeletePopupOpen(true);
  };

  const closeDeletePopup = () => {
    setIsDeletePopupOpen(false);
    setSelectedUser(null);
  };

  // Delete: Actually delete user
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    closeDeletePopup();
    setDeleteLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/user/${selectedUser.userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      await fetchUsers();
      setDeleteLoading(false);
    } catch (err) {
      setDeleteLoading(false);
      alert('Error deleting user: ' + err.message);
    }
  };

  // Approve request handlers
  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    setIsApprovePopupOpen(true);
  };

  const closeApprovePopup = () => {
    setIsApprovePopupOpen(false);
    setSelectedRequest(null);
  };

  const handleConfirmApprove = async () => {
    if (!selectedRequest) return;

    closeApprovePopup();
    setApproveLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/approve/${selectedRequest.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve request');
      }

      await fetchRequests();
      await fetchUsers();
      setApproveLoading(false);
    } catch (err) {
      setApproveLoading(false);
      alert('Error approving request: ' + err.message);
    }
  };

  // Reject request handlers
  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setIsRejectPopupOpen(true);
  };

  const closeRejectPopup = () => {
    setIsRejectPopupOpen(false);
    setSelectedRequest(null);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest) return;

    setRejectLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/decline/${selectedRequest.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'Rejected by admin' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject request');
      }

      alert('Request rejected successfully!');
      setRejectLoading(false);
      closeRejectPopup();
      fetchRequests();
    } catch (err) {
      alert('Error rejecting request: ' + err.message);
      setRejectLoading(false);
      closeRejectPopup();
    }
  };

  if (!isAdmin) {
    return (
      <div className="um-container">
        <div className="um-card">
          <div className="empty-state" style={{ padding: '4rem' }}>
            <ShieldCheck size={64} style={{ opacity: 0.2, marginBottom: '1rem', color: '#ef4444' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
              Access Denied
            </h2>
            <p>You do not have permission to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="um-container">
        <div className="um-card">
          <div className="empty-state" style={{ padding: '4rem' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem' }}>Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="um-container">
        <div className="um-card">
          <div className="empty-state" style={{ padding: '4rem' }}>
            <p style={{ color: '#ef4444', fontWeight: 600 }}>Error: {error}</p>
            <button
              onClick={fetchUsers}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="um-container">
      <div className="um-card">
        <div className="um-header">
          <div className="um-header-top">
            <h1 className="um-title">User Management</h1>
          </div>
          <div className="um-tabs">
            <button
              className={`um-tab ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              <User size={18} />
              <span>User List</span>
              <span className="tab-count">{users.length}</span>
            </button>
            <button
              className={`um-tab ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <ShieldCheck size={18} />
              <span>User Requests</span>
              {requests.length > 0 && <span className="tab-count">{requests.length}</span>}
            </button>
          </div>
        </div>

        <div className="um-content">
          {activeTab === 'list' ? (
            <table className="um-table">
              <thead>
                <tr>
                  <th style={{width: '10%'}}>ID</th>
                  <th style={{width: '45%'}}>User Details</th>
                  <th style={{width: '30%'}}>Last Login</th>
                  <th style={{width: '15%'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.userId}>
                      <td>
                        <span className="user-id-badge">
                          {user.userId}
                        </span>
                      </td>
                      <td>
                        <div className="user-info">
                          <span className="user-name">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="login-date">
                          {formatLastLogin(user.lastLogin)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-container">
                          <button
                            className="action-btn-delete"
                            onClick={() => handleDeleteClick(user)}
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">
                      <div className="empty-state">
                        <User size={64} />
                        <p>No users found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            requestsLoading ? (
              <div className="empty-state">
                <div className="spinner"></div>
                <p style={{ marginTop: '1rem' }}>Loading requests...</p>
              </div>
            ) : requests.length > 0 ? (
              <table className="um-table">
                <thead>
                  <tr>
                    <th style={{width: '50%'}}>User Details</th>
                    <th style={{width: '35%'}}>Email</th>
                    <th style={{width: '15%'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="user-info">
                          <span className="user-name">
                            {request.firstName} {request.lastName}
                          </span>
                          <span className="user-email" style={{ fontSize: '0.8rem' }}>
                            Father: {request.fatherName}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="user-email">{request.email}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            className="action-btn-edit"
                            onClick={() => handleApproveClick(request)}
                            title="Approve Request"
                            style={{ backgroundColor: '#22c55e' }}
                          >
                            ✓
                          </button>
                          <button
                            className="action-btn-delete"
                            onClick={() => handleRejectClick(request)}
                            title="Reject Request"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <ShieldCheck size={64} />
                <h3>User Requests</h3>
                <p>No pending user registration requests at this time.</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      <Popup
        isOpen={isDeletePopupOpen}
        onClose={closeDeletePopup}
        onConfirm={handleConfirmDelete}
        type="danger"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isLoading={deleteLoading}
      >
        <div className="delete-user-container">
          <div className="delete-user-card">
            <div className="delete-user-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="delete-user-details">
              <div className="delete-user-name">{selectedUser?.firstName} {selectedUser?.lastName}</div>
              <div className="delete-user-id">User ID: {selectedUser?.userId}</div>
            </div>
          </div>
          <div className="delete-warning-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>This action cannot be undone. The user will be permanently removed.</span>
          </div>
        </div>
      </Popup>

      {/* Approve Request Popup */}
      <Popup
        isOpen={isApprovePopupOpen}
        onClose={closeApprovePopup}
        onConfirm={handleConfirmApprove}
        message="Are you sure you want to approve this registration request? User credentials will be sent via email."
        type="warning"
        confirmText="Yes, Approve"
        isLoading={approveLoading}
      >
        <div className="popup-user-info">
          <div className="popup-user-name">{selectedRequest?.firstName} {selectedRequest?.lastName}</div>
          <div className="popup-user-id">Email: {selectedRequest?.email}</div>
        </div>
      </Popup>

      {/* Reject Request Popup */}
      <Popup
        isOpen={isRejectPopupOpen}
        onClose={closeRejectPopup}
        onConfirm={handleConfirmReject}
        message="Are you sure you want to reject this registration request?"
        type="danger"
        confirmText="Yes, Reject"
        isLoading={rejectLoading}
      >
        <div className="popup-user-info">
          <div className="popup-user-name">{selectedRequest?.firstName} {selectedRequest?.lastName}</div>
          <div className="popup-user-id">Email: {selectedRequest?.email}</div>
        </div>
      </Popup>

      {approveLoading && <StatusMessage message="Approving User..." />}
      {deleteLoading && <StatusMessage message="Removing User..." />}
    </div>
  );
};

export default UserManagement;
