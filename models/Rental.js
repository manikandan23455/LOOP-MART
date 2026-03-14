const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: { type: Date, required: [true, 'End date is required'] },
    rentalDays: { type: Number, required: true, min: 1 },
    pricePerDay: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },
    totalRentalCost: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    shippingAddress: {
      type: String,
      required: [true, 'Shipping address is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Returned', 'Cancelled', 'Disputed'],
      default: 'Pending',
    },
    depositRefunded: { type: Boolean, default: false },
    damageReport: { type: String, default: '' },
    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'Online Payment'],
      default: 'Cash on Delivery',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rental', rentalSchema);
