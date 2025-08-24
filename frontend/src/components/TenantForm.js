import React, { useState, useEffect } from 'react';

const TenantForm = ({ tenant, properties, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    propertyId: '',
    unitNumber: '',
    leaseStart: '',
    leaseEnd: '',
    monthlyRent: '',
    status: 'Active',
    emergencyContact: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tenant) {
      setFormData({
        ...tenant,
        leaseStart: tenant.leaseStart ? tenant.leaseStart.split('T')[0] : '',
        leaseEnd: tenant.leaseEnd ? tenant.leaseEnd.split('T')[0] : ''
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        propertyId: '',
        unitNumber: '',
        leaseStart: '',
        leaseEnd: '',
        monthlyRent: '',
        status: 'Active',
        emergencyContact: ''
      });
    }
  }, [tenant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const url = tenant 
      ? `/api/tenants/${tenant._id}`
      : '/api/tenants';
    
    const method = tenant ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          monthlyRent: parseFloat(formData.monthlyRent)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save tenant');
      }

      onSave();
    } catch (error) {
      console.error('Error saving tenant:', error);
      alert('Error saving tenant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-section">
      <form onSubmit={handleSubmit} className="tenant-form">
        <h2>{tenant ? '✏️ Edit Tenant' : '👤 Add New Tenant'}</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="e.g., John"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="e.g., Smith"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="e.g., john.smith@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="e.g., (555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="propertyId">Property *</label>
            <select
              id="propertyId"
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              required
            >
              <option value="">Select a property</option>
              {properties.map(property => (
                <option key={property._id} value={property._id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="unitNumber">Unit Number *</label>
            <input
              type="text"
              id="unitNumber"
              name="unitNumber"
              placeholder="e.g., 101, A-5, etc."
              value={formData.unitNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="leaseStart">Lease Start Date *</label>
            <input
              type="date"
              id="leaseStart"
              name="leaseStart"
              value={formData.leaseStart}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="leaseEnd">Lease End Date *</label>
            <input
              type="date"
              id="leaseEnd"
              name="leaseEnd"
              value={formData.leaseEnd}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="monthlyRent">Monthly Rent ($) *</label>
            <input
              type="number"
              id="monthlyRent"
              name="monthlyRent"
              placeholder="e.g., 1200"
              min="0"
              step="0.01"
              value={formData.monthlyRent}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="emergencyContact">Emergency Contact</label>
          <input
            type="text"
            id="emergencyContact"
            name="emergencyContact"
            placeholder="e.g., Jane Smith - (555) 987-6543"
            value={formData.emergencyContact}
            onChange={handleChange}
          />
        </div>

        <div className="form-buttons">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (tenant ? 'Update Tenant' : 'Add Tenant')}
          </button>
          {tenant && (
            <button 
              type="button" 
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TenantForm;