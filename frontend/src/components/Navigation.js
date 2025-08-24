// src/components/Navigation.js
import React from 'react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      id: 'properties',
      label: 'Properties',
      icon: '🏢'
    },
    {
      id: 'add-property',
      label: 'Add Property',
      icon: '➕'
    },
    {
      id: 'tenants',
      label: 'Tenants',
      icon: '👥'
    }
  ];

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <ul className="nav-list">
          {navItems.map(item => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-button ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;