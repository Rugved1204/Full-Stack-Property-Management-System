const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Property name is required'],
    trim: true,
    maxlength: [100, 'Property name cannot exceed 100 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['Apartment', 'House', 'Commercial', 'Condo', 'Townhouse', 'Villa'],
    default: 'Apartment'
  },
  units: {
    type: Number,
    required: [true, 'Number of units is required'],
    min: [1, 'Property must have at least 1 unit']
  },
  rent: {
    type: Number,
    required: [true, 'Rent amount is required'],
    min: [0, 'Rent cannot be negative']
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Maintenance', 'Reserved'],
    default: 'Available'
  },
  amenities: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    name: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  images: [{
    type: String
  }],
  occupiedUnits: {
    type: Number,
    default: 0,
    min: 0
  },
  maintenanceRequests: [{
    title: String,
    description: String,
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for occupancy rate
propertySchema.virtual('occupancyRate').get(function() {
  if (this.units === 0) return 0;
  return (this.occupiedUnits / this.units * 100).toFixed(2);
});

// Virtual for available units
propertySchema.virtual('availableUnits').get(function() {
  return this.units - this.occupiedUnits;
});

// Include virtuals in JSON output
propertySchema.set('toJSON', { virtuals: true });

// Indexes for better query performance
propertySchema.index({ name: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ rent: 1 });

// Middleware to update the updatedAt field
propertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;