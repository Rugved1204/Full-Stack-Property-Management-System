// src/components/PropertyList.js
import React, { useState } from 'react';

const PropertyList = ({ properties, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || property.status === filterStatus;
    const matchesType = !filterType || property.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'status-available';
      case 'Occupied': return 'status-occupied';
      case 'Maintenance': return 'status-maintenance';
      default: return 'status-default';
    }
  };

  return (
    <div className="property-list-container">
      <div className="list-header">
        <h2>Properties ({filteredProperties.length})</h2>
        <button className="btn btn-primary" onClick={onAddNew}>
          + Add New Property
        </button>
      </div>

      <div className="filters-section">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search properties by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Condo">Condo</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Studio">Studio</option>
          </select>
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="empty-state">
          <p>No properties found matching your criteria.</p>
          {properties.length === 0 && (
            <button className="btn btn-primary" onClick={onAddNew}>
              Add Your First Property
            </button>
          )}
        </div>
      ) : (
        <div className="property-grid">
          {filteredProperties.map(property => (
            <div key={property._id} className="property-card">
              <div className="property-header">
                <h3 className="property-name">{property.name}</h3>
                <span className={`property-status ${getStatusColor(property.status)}`}>
                  {property.status}
                </span>
              </div>
              
              <div className="property-details">
                <p className="property-address">📍 {property.address}</p>
                <p className="property-type">🏠 {property.type}</p>
                <p className="property-units">🏘️ {property.units} units</p>
                <p className="property-rent">💰 ₹{property.rent.toLocaleString()}/month</p>
                
                {property.occupancyRate !== undefined && (
                  <p className="property-occupancy">
                    📊 Occupancy: {property.occupancyRate}% 
                    ({property.occupiedUnits}/{property.units})
                  </p>
                )}
                
                {property.amenities && property.amenities.length > 0 && (
                  <div className="property-amenities">
                    <p>✨ Amenities:</p>
                    <div className="amenities-list">
                      {property.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="amenity-tag">{amenity}</span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="amenity-more">+{property.amenities.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="property-actions">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => onEdit(property)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete(property._id)}
                >
                  Delete
                </button>
              </div>
              
              <div className="property-footer">
                <small className="created-date">
                  Added: {new Date(property.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyList;