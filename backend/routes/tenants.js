// routes/tenants.js - Tenant API routes
const express = require('express');
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');
const router = express.Router();

// GET all tenants with optional filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { status, property, page = 1, limit = 10, search } = req.query;
    const query = {};
    
    // Add filters
    if (status) query.status = status;
    if (property) query.property = property;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { unitNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    const tenants = await Tenant.find(query)
      .populate('property', 'name address type')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Tenant.countDocuments(query);
    
    res.json({
      tenants,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTenants: total
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ message: 'Error fetching tenants', error: error.message });
  }
});

// GET single tenant by ID
router.get('/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate('property');
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error) {
    console.error('Error fetching tenant:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid tenant ID' });
    }
    res.status(500).json({ message: 'Error fetching tenant', error: error.message });
  }
});

// POST new tenant
router.post('/', async (req, res) => {
  try {
    // Check if property exists
    const property = await Property.findById(req.body.property);
    if (!property) {
      return res.status(400).json({ message: 'Property not found' });
    }
    
    // Check if unit is already occupied by an active tenant
    const existingTenant = await Tenant.findOne({
      property: req.body.property,
      unitNumber: req.body.unitNumber,
      status: 'Active'
    });
    
    if (existingTenant) {
      return res.status(400).json({ 
        message: `Unit ${req.body.unitNumber} is already occupied by an active tenant` 
      });
    }
    
    const tenant = new Tenant(req.body);
    const savedTenant = await tenant.save();
    
    // Update property occupied units count
    await Property.findByIdAndUpdate(
      req.body.property,
      { $inc: { occupiedUnits: 1 } }
    );
    
    const populatedTenant = await Tenant.findById(savedTenant._id).populate('property');
    
    res.status(201).json({
      message: 'Tenant created successfully',
      tenant: populatedTenant
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Error creating tenant', error: error.message });
  }
});

// PUT update tenant
router.put('/:id', async (req, res) => {
  try {
    const currentTenant = await Tenant.findById(req.params.id);
    if (!currentTenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    // If property or unit is being changed, validate
    if (req.body.property && req.body.property !== currentTenant.property.toString()) {
      const property = await Property.findById(req.body.property);
      if (!property) {
        return res.status(400).json({ message: 'Property not found' });
      }
    }
    
    // If unit number is being changed, check if new unit is available
    if (req.body.unitNumber && 
        (req.body.unitNumber !== currentTenant.unitNumber || 
         req.body.property !== currentTenant.property.toString())) {
      
      const existingTenant = await Tenant.findOne({
        property: req.body.property || currentTenant.property,
        unitNumber: req.body.unitNumber,
        status: 'Active',
        _id: { $ne: req.params.id }
      });
      
      if (existingTenant) {
        return res.status(400).json({ 
          message: `Unit ${req.body.unitNumber} is already occupied by another active tenant` 
        });
      }
    }
    
    const updates = { ...req.body, updatedAt: Date.now() };
    
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('property');
    
    res.json({
      message: 'Tenant updated successfully',
      tenant
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid tenant ID' });
    }
    res.status(500).json({ message: 'Error updating tenant', error: error.message });
  }
});

// DELETE tenant
router.delete('/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    // Update property occupied units count if tenant was active
    if (tenant.status === 'Active') {
      await Property.findByIdAndUpdate(
        tenant.property,
        { $inc: { occupiedUnits: -1 } }
      );
    }
    
    await Tenant.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Tenant deleted successfully',
      deletedTenant: tenant 
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid tenant ID' });
    }
    res.status(500).json({ message: 'Error deleting tenant', error: error.message });
  }
});

// GET tenants by property
router.get('/property/:propertyId', async (req, res) => {
  try {
    const tenants = await Tenant.find({ property: req.params.propertyId })
      .populate('property', 'name address')
      .sort({ unitNumber: 1 });
    
    res.json(tenants);
  } catch (error) {
    console.error('Error fetching tenants by property:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid property ID' });
    }
    res.status(500).json({ message: 'Error fetching tenants', error: error.message });
  }
});

// GET tenant statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalTenants = await Tenant.countDocuments();
    const activeTenants = await Tenant.countDocuments({ status: 'Active' });
    const inactiveTenants = await Tenant.countDocuments({ status: 'Inactive' });
    const pendingTenants = await Tenant.countDocuments({ status: 'Pending' });
    
    // Calculate average rent
    const avgRentAgg = await Tenant.aggregate([
      { $match: { status: 'Active' } },
      {
        $group: {
          _id: null,
          averageRent: { $avg: '$monthlyRent' },
          totalRent: { $sum: '$monthlyRent' }
        }
      }
    ]);
    
    const { averageRent = 0, totalRent = 0 } = avgRentAgg[0] || {};
    
    res.json({
      totalTenants,
      activeTenants,
      inactiveTenants,
      pendingTenants,
      averageRent: Math.round(averageRent),
      totalMonthlyRevenue: totalRent
    });
  } catch (error) {
    console.error('Error fetching tenant statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

module.exports = router;