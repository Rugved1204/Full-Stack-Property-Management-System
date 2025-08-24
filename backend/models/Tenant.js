const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property assignment is required']
  },
  unitNumber: {
    type: String,
    required: [true, 'Unit number is required'],
    trim: true
  },
  leaseDetails: {
    startDate: {
      type: Date,
      required: [true, 'Lease start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'Lease end date is required']
    },
    monthlyRent: {
      type: Number,
      required: [true, 'Monthly rent is required'],
      min: [0, 'Rent cannot be negative']
    },
    securityDeposit: {
      type: Number,
      required: [true, 'Security deposit is required'],
      min: [0, 'Security deposit cannot be negative']
    },
    paymentDay: {
      type: Number,
      min: 1,
      max: 31,
      default: 1
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending', 'Evicted'],
    default: 'Active'
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['ID Proof', 'Lease Agreement', 'Income Proof', 'Other']
    },
    fileName: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  paymentHistory: [{
    amount: Number,
    paymentDate: Date,
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Check', 'Bank Transfer', 'Online', 'Credit Card']
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Late', 'Partial'],
      default: 'Pending'
    },
    month: String,
    year: Number,
    transactionId: String
  }],
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
    },
    completedAt: Date
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
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

// Virtual for full name
tenantSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for lease status
tenantSchema.virtual('leaseStatus').get(function() {
  const now = new Date();
  if (this.leaseDetails.endDate < now) {
    return 'Expired';
  } else if (this.leaseDetails.startDate > now) {
    return 'Future';
  } else {
    return 'Active';
  }
});

// Virtual for days until lease end
tenantSchema.virtual('daysUntilLeaseEnd').get(function() {
  const now = new Date();
  const endDate = new Date(this.leaseDetails.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Include virtuals in JSON output
tenantSchema.set('toJSON', { virtuals: true });

// Indexes for better query performance
tenantSchema.index({ email: 1 });
tenantSchema.index({ property: 1 });
tenantSchema.index({ status: 1 });
tenantSchema.index({ 'leaseDetails.endDate': 1 });

// Middleware to update the updatedAt field
tenantSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validate lease dates
tenantSchema.pre('save', function(next) {
  if (this.leaseDetails.endDate <= this.leaseDetails.startDate) {
    next(new Error('Lease end date must be after start date'));
  }
  next();
});

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;