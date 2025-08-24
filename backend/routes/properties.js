const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

// GET all properties
router.get('/', async (req, res) => {
  try {
    const { type, status, minRent, maxRent, sortBy } = req.query;
    
    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = Number(minRent);
      if (maxRent) filter.rent.$lte = Number(maxRent);
    }
    
    // Build sort object
    let sort = {};
    if (sortBy) {
      const sortField = sortBy.startsWith('-') ? sortBy.slice(1) : sortBy;
      const sortOrder = sortBy.startsWith('-') ? -1 : 1;
      sort[sortField] = sortOrder;
    } else {
      sort = { createdAt: -1 }; // Default sort by newest first
    }
    
    const properties = await Property.find(filter).sort(sort);
    
    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET single property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST create new property
router.post('/', async (req, res) => {
  try {
    const property = new Property(req.body);
    await property.save();
    
    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT update property
router.put('/:id', async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE property
router.delete('/:id', async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET property statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();
    const availableProperties = await Property.countDocuments({ status: 'Available' });
    const occupiedProperties = await Property.countDocuments({ status: 'Occupied' });
    
    const aggregateStats = await Property.aggregate([
      {
        $group: {
          _id: null,
          totalUnits: { $sum: '$units' },
          totalOccupiedUnits: { $sum: '$occupiedUnits' },
          averageRent: { $avg: '$rent' },
          minRent: { $min: '$rent' },
          maxRent: { $max: '$rent' }
        }
      }
    ]);
    
    const stats = aggregateStats[0] || {
      totalUnits: 0,
      totalOccupiedUnits: 0,
      averageRent: 0,
      minRent: 0,
      maxRent: 0
    };
    
    const overallOccupancyRate = stats.totalUnits > 0 
      ? (stats.totalOccupiedUnits / stats.totalUnits * 100).toFixed(2)
      : 0;
    
    res.json({
      success: true,
      data: {
        totalProperties,
        availableProperties,
        occupiedProperties,
        totalUnits: stats.totalUnits,
        totalOccupiedUnits: stats.totalOccupiedUnits,
        availableUnits: stats.totalUnits - stats.totalOccupiedUnits,
        overallOccupancyRate: parseFloat(overallOccupancyRate),
        averageRent: Math.round(stats.averageRent),
        minRent: stats.minRent,
        maxRent: stats.maxRent
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST add maintenance request to property
router.post('/:id/maintenance', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    property.maintenanceRequests.push(req.body);
    await property.save();
    
    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT update maintenance request status
router.put('/:id/maintenance/:requestId', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    const request = property.maintenanceRequests.id(req.params.requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance request not found'
      });
    }
    
    request.status = req.body.status;
    await property.save();
    
    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;