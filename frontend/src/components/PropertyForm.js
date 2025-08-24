// src/components/PropertyForm.js
import React, { useState, useEffect } from 'react';

const PropertyForm = ({ property, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'Apartment',
    units: '',
    rent: '',
    status: 'Available',
    amenities: '',
    description: '',
    occupiedUnits: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (property) {
      setFormData({
        ...property,
        amenities: property.amenities?.join(', ') || '',
        occupiedUnits: property.occupiedUnits || 0
      });
    } else {
      // Reset form for new property
      setFormData({
        name: '',
        address: '',
        type: 'Apartment',
        units: '',
        rent: '',
        status: 'Available',
        amenities: '',
        description: '',
        occupiedUnits: ''
      });
    }
    setErrors({});
  }, [property]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Property name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.units || formData.units <= 0) newErrors.units = 'Valid number of units is required';
    if (!formData.rent || formData.rent <= 0) newErrors.rent = 'Valid rent amount is required';
    
    if (formData.occupiedUnits && parseInt(formData.occupiedUnits) > parseInt(formData.units)) {
      newErrors.occupiedUnits = 'Occupied units cannot exceed total units';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    const url = property 
      ? `${API_BASE_URL}/properties/${property._id}`
      : `${API_BASE_URL}/properties`;
    
    const method = property ? 'PUT' : 'POST';
    
    const submitData = {
      ...formData,
      units: parseInt(formData.units),
      rent: parseFloat(formData.rent),
      occupiedUnits: parseInt(formData.occupiedUnits) || 0,
      amenities: formData.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0)
    };
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save property');
      }
      
      onSave();
      
      // Reset form if it's a new property
      if (!property) {
        setFormData({
          name: '',
          address: '',
          type: 'Apartment',
          units: '',
          rent: '',
          status: 'Available',
          amenities: '',
          description: '',
          occupiedUnits: ''
        });
      }
    } catch (error) {
      console.error('Error saving property:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="property-form-container">
      <div className="form-header">
        <h2>{property ? 'Edit Property' : 'Add New Property'}</h2>
        <p className="form-subtitle">
          {property ? 'Update property information' : 'Enter property details to add to your portfolio'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="property-form">
        {errors.submit && (
          <div className="error-alert">
            <p>{errors.submit}</p>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Property Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Sunset Apartments"
              className={errors.name ? 'error' : ''}
              required
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="type">Property Type *</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              required
            >
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Condo">Condo</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Studio">Studio</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="address">Address *</label>
          <input
            type="text"
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="e.g., 123 Main Street, Pune, Maharashtra"
            className={errors.address ? 'error' : ''}
            required
          />
          {errors.address && <span className="error-message">{errors.address}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="units">Total Units *</label>
            <input
              type="number"
              id="units"
              value={formData.units}
              onChange={(e) => handleInputChange('units', e.target.value)}
              placeholder="e.g., 50"
              min="1"
              max="1000"
              className={errors.units ? 'error' : ''}
              required
            />
            {errors.units && <span className="error-message">{errors.units}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="occupiedUnits">Occupied Units</label>
            <input
              type="number"
              id="occupiedUnits"
              value={formData.occupiedUnits}
              onChange={(e) => handleInputChange('occupiedUnits', e.target.value)}
              placeholder="e.g., 35"
              min="0"
              max={formData.units || 1000}
              className={errors.occupiedUnits ? 'error' : ''}
            />
            {errors.occupiedUnits && <span className="error-message">{errors.occupiedUnits}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="rent">Monthly Rent (₹) *</label>
            <input
              type="number"
              id="rent"
              value={formData.rent}
              onChange={(e) => handleInputChange('rent', e.target.value)}
              placeholder="e.g., 25000"
              min="0"
              className={errors.rent ? 'error' : ''}
              required
            />
            {errors.rent && <span className="error-message">{errors.rent}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="status">Property Status</label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
          >
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="amenities">Amenities</label>
          <input
            type="text"
            id="amenities"
            value={formData.amenities}
            onChange={(e) => handleInputChange('amenities', e.target.value)}
            placeholder="e.g., Parking, Gym, Pool, Garden (comma-separated)"
          />
          <small className="form-help">Separate multiple amenities with commas</small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Additional details about the property..."
            rows="4"
            maxLength="500"
          />
          <small className="form-help">
            {formData.description.length}/500 characters
          </small>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (property ? 'Update Property' : 'Add Property')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;