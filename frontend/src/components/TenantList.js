import React from 'react';

const TenantList = ({ tenants, onEdit, onDelete }) => {
  if (tenants.length === 0) {
    return (
      <div className="no-tenants">
        <h3>No Tenants Found</h3>
        <p>Start by adding your first tenant using the form above.</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#28a745';
      case 'Inactive': return '#6c757d';
      case 'Pending': return '#ffc107';
      case 'Terminated': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="tenant-section">
      <h2>Tenant Directory ({tenants.length})</h2>
      <div className="tenant-grid">
        {tenants.map(tenant => (
          <div key={tenant._id} className="tenant-card">
            <div className="tenant-header">
              <div className="tenant-name">
                <h3>{tenant.firstName} {tenant.lastName}</h3>
                <p className="unit-info">Unit {tenant.unitNumber}</p>
              </div>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(tenant.status) }}
              >
                {tenant.status}
              </span>
            </div>
            
            <div className="tenant-details">
              <div className="detail-row">
                <span className="detail-label">📧 Email:</span>
                <span>{tenant.email}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">📞 Phone:</span>
                <span>{tenant.phone}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">🏢 Property:</span>
                <span>{tenant.propertyName || 'Unknown Property'}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">💰 Rent:</span>
                <span>{formatCurrency(tenant.monthlyRent)}/month</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">📅 Lease:</span>
                <span>{formatDate(tenant.leaseStart)} - {formatDate(tenant.leaseEnd)}</span>
              </div>
              
              {tenant.emergencyContact && (
                <div className="detail-row">
                  <span className="detail-label">🚨 Emergency:</span>
                  <span>{tenant.emergencyContact}</span>
                </div>
              )}
            </div>

            <div className="tenant-actions">
              <button 
                onClick={() => onEdit(tenant)}
                className="btn-edit"
              >
                ✏️ Edit
              </button>
              <button 
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete tenant ${tenant.firstName} ${tenant.lastName}?`)) {
                    onDelete(tenant._id);
                  }
                }}
                className="btn-delete"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TenantList;