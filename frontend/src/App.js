// src/App.js - Main React application component
import React, { useState, useEffect } from 'react';
import PropertyList from './components/PropertyList';
import PropertyForm from './components/PropertyForm';
import TenantList from './components/TenantList';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProperties();
    fetchTenants();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/properties`);
      if (!response.ok) throw new Error('Failed to fetch properties');
      const data = await response.json();
      setProperties(data.properties || data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tenants`);
      if (!response.ok) throw new Error('Failed to fetch tenants');
      const data = await response.json();
      setTenants(data.tenants || data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setError('Failed to load tenants. Please try again.');
    }
  };

  const handlePropertySave = () => {
    fetchProperties();
    setEditingProperty(null);
    setShowPropertyForm(false);
    setActiveTab('properties');
  };

  const handlePropertyEdit = (property) => {
    setEditingProperty(property);
    setShowPropertyForm(true);
    setActiveTab('add-property');
  };

  const handlePropertyDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete property');
      
      fetchProperties();
      fetchTenants(); // Refresh tenants in case any were affected
    } catch (error) {
      console.error('Error deleting property:', error);
      setError('Failed to delete property. Please try again.');
    }
  };

  const handleNewProperty = () => {
    setEditingProperty(null);
    setShowPropertyForm(true);
    setActiveTab('add-property');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => {
            setError(null);
            fetchProperties();
            fetchTenants();
          }}>
            Try Again
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            properties={properties} 
            tenants={tenants}
            onNavigate={setActiveTab}
          />
        );
      case 'properties':
        return (
          <PropertyList
            properties={properties}
            onEdit={handlePropertyEdit}
            onDelete={handlePropertyDelete}
            onAddNew={handleNewProperty}
          />
        );
      case 'add-property':
        return (
          <PropertyForm
            property={editingProperty}
            onSave={handlePropertySave}
            onCancel={() => {
              setEditingProperty(null);
              setShowPropertyForm(false);
              setActiveTab('properties');
            }}
          />
        );
      case 'tenants':
        return (
          <TenantList
            tenants={tenants}
            properties={properties}
            onRefresh={fetchTenants}
          />
        );
      default:
        return <Dashboard properties={properties} tenants={tenants} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🏢 Property Management System</h1>
          <p className="header-subtitle">Streamline your property operations</p>
        </div>
      </header>
      
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="app-main">
        <div className="content-container">
          {renderContent()}
        </div>
      </main>
      
      <footer className="app-footer">
        <p>&copy; 2025 Property Management System. Built with React & Node.js</p>
      </footer>
    </div>
  );
}

export default App;