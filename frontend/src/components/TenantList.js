import React, { useState, useEffect } from 'react';

const TenantList = ({ tenants: initialTenants, properties, onRefresh }) => {
  const [tenants, setTenants] = useState(initialTenants || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProperty, setFilterProperty] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (initialTenants) {
      setTenants(initialTenants);
    } else {
      fetchTenants();
    }
  }, [initialTenants]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/tenants`);
      if (!response.ok) throw new Error('Failed to fetch tenants');
      const data = await response.json();
      setTenants(data.tenants || data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || tenant.status === filterStatus;
    const matchesProperty = !filterProperty || tenant.property._id === filterProperty;
    
    return matchesSearch && matchesStatus && matchesProperty;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Inactive': return 'status-inactive';
      case 'Pending': return 'status-pending';
      case 'Terminated': return 'status-terminated';
      default: return 'status-default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isLeaseActive = (tenant) => {
    const now = new Date();
    const leaseStart = new Date(tenant.leaseStart);
    const leaseEnd = new Date(tenant.leaseEnd);
    return now >= leaseStart && now <= leaseEnd && tenant.status === 'Active';
  };

  const getDaysUntilLeaseEnd = (leaseEnd) => {
    const now = new Date();
    const end = new Date(leaseEnd);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tenants...</p>
      </div>
    );
  }

  return (
    <div className="tenant-list-container">
      <div className="list-header">
        <h2>Tenants ({filteredTenants.length})</h2>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => {
              fetchTenants();
              if (onRefresh) onRefresh();
            }}
          >
            🔄 Refresh
          </button>
        </div>
            </div>
            <div className="filters">
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Terminated">Terminated</option>
              </select>
              <select
                value={filterProperty}
                onChange={e => setFilterProperty(e.target.value)}
              >
                <option value="">All Properties</option>
                {properties && properties.map(property => (
                  <option key={property._id} value={property._id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
            <table className="tenant-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Unit</th>
                  <th>Property</th>
                  <th>Status</th>
                  <th>Lease Start</th>
                  <th>Lease End</th>
                  <th>Days Left</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center' }}>No tenants found.</td>
                  </tr>
                ) : (
                  filteredTenants.map(tenant => (
                    <tr key={tenant._id}>
                      <td>{tenant.firstName} {tenant.lastName}</td>
                      <td>{tenant.email}</td>
                      <td>{tenant.unitNumber}</td>
                      <td>{tenant.property?.name || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(tenant.status)}`}>
                          {tenant.status}
                        </span>
                      </td>
                      <td>{tenant.leaseStart ? formatDate(tenant.leaseStart) : 'N/A'}</td>
                      <td>{tenant.leaseEnd ? formatDate(tenant.leaseEnd) : 'N/A'}</td>
                      <td>
                        {tenant.leaseEnd ? getDaysUntilLeaseEnd(tenant.leaseEnd) : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );
      };
      
      export default TenantList;