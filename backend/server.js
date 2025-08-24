const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for properties and tenants
let properties = [
  {
    _id: '1',
    name: 'Sample Apartment Complex',
    address: '123 Main St, Sample City, SC 12345',
    type: 'Apartment',
    units: 24,
    rent: 1200,
    status: 'Available',
    amenities: ['Pool', 'Gym', 'Parking'],
    createdAt: new Date()
  }
];

let tenants = [
  {
    _id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    propertyId: '1',
    unitNumber: '101',
    leaseStart: '2024-01-01',
    leaseEnd: '2024-12-31',
    monthlyRent: 1200,
    status: 'Active',
    emergencyContact: 'Jane Smith - (555) 987-6543',
    createdAt: new Date()
  }
];

let nextPropertyId = 2;
let nextTenantId = 2;

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Property Management System API',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

// GET all properties
app.get('/api/properties', (req, res) => {
  try {
    console.log('GET /api/properties - Returning', properties.length, 'properties');
    res.json(properties);
  } catch (error) {
    console.error('Error in GET /api/properties:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST new property
app.post('/api/properties', (req, res) => {
  try {
    const newProperty = {
      _id: nextPropertyId.toString(),
      ...req.body,
      createdAt: new Date()
    };
    properties.push(newProperty);
    nextPropertyId++;
    console.log('POST /api/properties - Added new property:', newProperty.name);
    res.status(201).json(newProperty);
  } catch (error) {
    console.error('Error in POST /api/properties:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT update property
app.put('/api/properties/:id', (req, res) => {
  try {
    const id = req.params.id;
    const index = properties.findIndex(p => p._id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    properties[index] = { ...properties[index], ...req.body };
    console.log('PUT /api/properties/' + id + ' - Updated property:', properties[index].name);
    res.json(properties[index]);
  } catch (error) {
    console.error('Error in PUT /api/properties:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE property
app.delete('/api/properties/:id', (req, res) => {
  try {
    const id = req.params.id;
    const index = properties.findIndex(p => p._id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    const deletedProperty = properties[index];
    properties.splice(index, 1);
    console.log('DELETE /api/properties/' + id + ' - Deleted property:', deletedProperty.name);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/properties:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET all tenants
app.get('/api/tenants', (req, res) => {
  try {
    console.log('GET /api/tenants - Returning', tenants.length, 'tenants');
    // Include property name for each tenant
    const tenantsWithProperty = tenants.map(tenant => {
      const property = properties.find(p => p._id === tenant.propertyId);
      return {
        ...tenant,
        propertyName: property ? property.name : 'Unknown Property'
      };
    });
    res.json(tenantsWithProperty);
  } catch (error) {
    console.error('Error in GET /api/tenants:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST new tenant
app.post('/api/tenants', (req, res) => {
  try {
    const newTenant = {
      _id: nextTenantId.toString(),
      ...req.body,
      createdAt: new Date()
    };
    tenants.push(newTenant);
    nextTenantId++;
    console.log('POST /api/tenants - Added new tenant:', newTenant.firstName, newTenant.lastName);
    res.status(201).json(newTenant);
  } catch (error) {
    console.error('Error in POST /api/tenants:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT update tenant
app.put('/api/tenants/:id', (req, res) => {
  try {
    const id = req.params.id;
    const index = tenants.findIndex(t => t._id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    tenants[index] = { ...tenants[index], ...req.body };
    console.log('PUT /api/tenants/' + id + ' - Updated tenant:', tenants[index].firstName, tenants[index].lastName);
    res.json(tenants[index]);
  } catch (error) {
    console.error('Error in PUT /api/tenants:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE tenant
app.delete('/api/tenants/:id', (req, res) => {
  try {
    const id = req.params.id;
    const index = tenants.findIndex(t => t._id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    const deletedTenant = tenants[index];
    tenants.splice(index, 1);
    console.log('DELETE /api/tenants/' + id + ' - Deleted tenant:', deletedTenant.firstName, deletedTenant.lastName);
    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/tenants:', error);
    res.status(500).json({ message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 API endpoints available:`);
  console.log(`   GET    http://localhost:${PORT}/api/test`);
  console.log(`   GET    http://localhost:${PORT}/api/properties`);
  console.log(`   POST   http://localhost:${PORT}/api/properties`);
  console.log(`   PUT    http://localhost:${PORT}/api/properties/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/properties/:id`);
});