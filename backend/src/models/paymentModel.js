const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Online Payment', 'Check', 'Mobile Banking'],
      default: 'Online Payment',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Overdue', 'Partial'],
      default: 'Pending',
    },
    paymentType: {
      type: String,
      enum: ['Rent', 'Security Deposit', 'Maintenance', 'Utilities', 'Other'],
      default: 'Rent',
    },
    month: {
      type: String,
      required: true, // e.g., "January 2024"
    },
    transactionId: {
      type: String,
      default: null, // For online payments
    },
    receiptUrl: {
      type: String,
      default: null, // URL to receipt/image
    },
    notes: {
      type: String,
      default: '',
    },
    lateFee: {
      type: Number,
      default: 0,
    },
    partialAmount: {
      type: Number,
      default: 0, // For partial payments
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderDates: [{
      date: Date,
      method: String, // email, sms, notification
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
