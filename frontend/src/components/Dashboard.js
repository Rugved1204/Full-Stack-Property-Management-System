// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';

const Dashboard = ({ properties, tenants, onNavigate }) => {
  const [stats, setStats] = useState({
    properties: {},
    tenants: {}
  });
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const [propertyStats, tenantStats] = await Promise.all([
        fetch(`${API_BASE_URL}/properties/stats/overview`).then(res => res.json()),
        fetch(`${API_BASE_URL}/tenants/stats/overview`).then(res => res.json())
      ]);

      setStats({
        properties: propertyStats,
        tenants: tenantStats
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLocalStats = () => {
    // Fallback calculations using local data
    const totalProperties = properties.length;
    const totalUnits = properties.reduce((sum, property) => sum + (property.units || 0), 0);
    const totalOccupied = properties.reduce((sum, property) => sum + (property.occupiedUnits || 0), 0);
    const occupancyRate = totalUnits > 0 ? Math.round((totalOccupied / totalUnits) * 100) : 0;
    
    const availableProperties = properties.filter(p => p.status === 'Available').length;
    const occupiedProperties = properties.filter(p => p.status === 'Occupied').length;
    const maintenanceProperties = properties.filter(p => p.status === 'Maintenance').length;
    
    const activeTenants = tenants.filter(t => t.status === 'Active').length;
    const totalRevenue = tenants
      .filter(t => t.status === 'Active')
      .reduce((sum, tenant) => sum + (tenant.monthlyRent || 0), 0);

    return {
      totalProperties,
      totalUnits,
      totalOccupied,
      occupancyRate,
      availableProperties,
      occupiedProperties,
      maintenanceProperties,
      activeTenants,
      totalRevenue
    };
  };

  const localStats = calculateLocalStats();
  const displayStats = loading ? localStats : {
    ...localStats,
    ...stats.properties,
    ...stats.tenants
  };

  const StatCard = ({ title, value, icon, color, subtitle, onClick }) => (
    <div 
      className={`stat-card ${color} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="stat-icon">
        <span className="icon">{icon}</span>
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="action-buttons">
        <button 
          className="action-btn primary"
          onClick={() => onNavigate('add-property')}
        >
          <span>🏢</span>
          Add Property
        </button>
        <button 
          className="action-btn secondary"
          onClick={() => onNavigate('properties')}
        >
          <span>📋</span>
          Manage Properties
        </button>
        <button 
          className="action-btn tertiary"
          onClick={() => onNavigate('tenants')}
        >
          <span>👥</span>
          Manage Tenants
        </button>
      </div>
    </div>
  );

  const RecentProperties = () => {
    const recentProperties = properties
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return (
      <div className="recent-properties">
        <div className="section-header">
          <h3>Recent Properties</h3>
          <button 
            className="view-all-btn"
            onClick={() => onNavigate('properties')}
          >
            View All
          </button>
        </div>
        
        {recentProperties.length === 0 ? (
          <div className="empty-state">
            <p>No properties added yet</p>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate('add-property')}
            >
              Add First Property
            </button>
          </div>
        ) : (
          <div className="properties-list">
            {recentProperties.map(property => (
              <div key={property._id} className="property-item">
                <div className="property-info">
                  <h4>{property.name}</h4>
                  <p className="property-details">
                    {property.type} • {property.units} units • ₹{property.rent.toLocaleString()}/month
                  </p>
                  <p className="property-address">{property.address}</p>
                </div>
                <div className="property-status">
                  <span className={`status-badge ${property.status.toLowerCase()}`}>
                    {property.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading && properties.length === 0) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p className="dashboard-subtitle">
          Welcome to your Property Management System
        </p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Properties"
          value={displayStats.totalProperties || 0}
          icon="🏢"
          color="blue"
          onClick={() => onNavigate('properties')}
        />
        
        <StatCard
          title="Total Units"
          value={displayStats.totalUnits || 0}
          icon="🏘️"
          color="green"
        />
        
        <StatCard
          title="Occupancy Rate"
          value={`${displayStats.overallOccupancyRate || displayStats.occupancyRate || 0}%`}
          icon="📊"
          color="purple"
          subtitle={`${displayStats.totalOccupied || 0}/${displayStats.totalUnits || 0} units occupied`}
        />
        
        <StatCard
          title="Active Tenants"
          value={displayStats.activeTenants || 0}
          icon="👥"
          color="orange"
          onClick={() => onNavigate('tenants')}
        />
        
        <StatCard
          title="Monthly Revenue"
          value={`₹${(displayStats.totalMonthlyRevenue || displayStats.totalRevenue || 0).toLocaleString()}`}
          icon="💰"
          color="success"
        />
        
        <StatCard
          title="Available Properties"
          value={displayStats.availableProperties || 0}
          icon="✅"
          color="info"
          subtitle="Ready to lease"
        />
      </div>

      <div className="dashboard-content">
        <div className="left-column">
          <RecentProperties />
        </div>
        
        <div className="right-column">
          <QuickActions />
          
          <div className="property-status-breakdown">
            <h3>Property Status</h3>
            <div className="status-items">
              <div className="status-item">
                <span className="status-dot available"></span>
                <span>Available: {displayStats.availableProperties || 0}</span>
              </div>
              <div className="status-item">
                <span className="status-dot occupied"></span>
                <span>Occupied: {displayStats.occupiedProperties || 0}</span>
              </div>
              <div className="status-item">
                <span className="status-dot maintenance"></span>
                <span>Maintenance: {displayStats.maintenanceProperties || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {properties.length === 0 && (
        <div className="welcome-banner">
          <div className="welcome-content">
            <h2>🎉 Welcome to Property Management System!</h2>
            <p>Get started by adding your first property to the system.</p>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => onNavigate('add-property')}
            >
              Add Your First Property
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;