import React, { useState, useEffect } from 'react';
import PropertyList from './components/PropertyList';
import PropertyForm from './components/PropertyForm';
import TenantList from './components/TenantList';
import TenantForm from './components/TenantForm';
import './App.css';

function App() {
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [editingTenant, setEditingTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('properties');

  useEffect(() => {
    fetchProperties();
    fetchTenants();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/properties');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProperties(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(`Failed to load properties: ${error.message}. Make sure the backend server is running on port 5000.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/tenants');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTenants(data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setError(`Failed to load tenants: ${error.message}`);
    }
  };

  const handlePropertySave = () => {
    fetchProperties();
    setEditingProperty(null);
  };

  const handleTenantSave = () => {
    fetchTenants();
    setEditingTenant(null);
  };

  const handlePropertyDelete = async (id) => {
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete property');
      }
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      setError('Failed to delete property');
    }
  };

  const handleTenantDelete = async (id) => {
    try {
      const response = await fetch(`/api/tenants/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete tenant');
      }
      fetchTenants();
    } catch (error) {
      console.error('Error deleting tenant:', error);
      setError('Failed to delete tenant');
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🏢 Property Management System</h1>
        <p>Manage your properties and tenants efficiently</p>
      </header>
      
      <nav className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          🏠 Properties
        </button>
        <button 
          className={`tab-button ${activeTab === 'tenants' ? 'active' : ''}`}
          onClick={() => setActiveTab('tenants')}
        >
          👥 Tenants
        </button>
      </nav>

      <main className="main-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {activeTab === 'properties' && (
          <>
            <PropertyForm 
              property={editingProperty} 
              onSave={handlePropertySave}
              onCancel={() => setEditingProperty(null)}
            />
            
            {loading ? (
              <div className="loading">Loading properties...</div>
            ) : (
              <PropertyList 
                properties={properties} 
                onEdit={setEditingProperty}
                onDelete={handlePropertyDelete}
              />
            )}
          </>
        )}

        {activeTab === 'tenants' && (
          <>
            <TenantForm 
              tenant={editingTenant}
              properties={properties}
              onSave={handleTenantSave}
              onCancel={() => setEditingTenant(null)}
            />
            
            {loading ? (
              <div className="loading">Loading tenants...</div>
            ) : (
              <TenantList 
                tenants={tenants} 
                onEdit={setEditingTenant}
                onDelete={handleTenantDelete}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;