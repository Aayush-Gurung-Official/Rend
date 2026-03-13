const Payment = require("../models/paymentModel");
const Property = require("../models/propertyModel");
const User = require("../models/userModel");

// GET /api/payments/owner/:ownerId
const getOwnerPayments = async (req, res, next) => {
  try {
    const { ownerId } = req.params;
    const { status, month, propertyId, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { owner: ownerId };
    if (status && status !== 'All') {
      filter.paymentStatus = status;
    }
    if (month && month !== 'All') {
      filter.month = month;
    }
    if (propertyId && propertyId !== 'All') {
      filter.property = propertyId;
    }

    const skip = (page - 1) * limit;
    
    const payments = await Payment.find(filter)
      .populate('tenant', 'username fullName phone email profileImage')
      .populate('property', 'name address city monthlyRent')
      .sort({ dueDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    // Get stats
    const stats = {
      totalIncome: await Payment.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(ownerId), paymentStatus: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      pendingPayments: await Payment.countDocuments({ owner: ownerId, paymentStatus: 'Pending' }),
      overduePayments: await Payment.countDocuments({ owner: ownerId, paymentStatus: 'Overdue' }),
      thisMonthIncome: await Payment.aggregate([
        { 
          $match: { 
            owner: new mongoose.Types.ObjectId(ownerId), 
            paymentStatus: 'Paid',
            paidDate: { 
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
    };

    res.json({
      payments,
      stats: {
        totalIncome: stats.totalIncome[0]?.total || 0,
        pendingPayments: stats.pendingPayments,
        overduePayments: stats.overduePayments,
        thisMonthIncome: stats.thisMonthIncome[0]?.total || 0,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPayments: total
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/payments/tenant/:tenantId
const getTenantPayments = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { tenant: tenantId };
    if (status && status !== 'All') {
      filter.paymentStatus = status;
    }

    const skip = (page - 1) * limit;
    
    const payments = await Payment.find(filter)
      .populate('property', 'name address city monthlyRent')
      .populate('owner', 'username fullName phone email')
      .sort({ dueDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    // Get tenant stats
    const stats = {
      totalPaid: await Payment.aggregate([
        { $match: { tenant: new mongoose.Types.ObjectId(tenantId), paymentStatus: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      pendingAmount: await Payment.aggregate([
        { $match: { tenant: new mongoose.Types.ObjectId(tenantId), paymentStatus: { $in: ['Pending', 'Overdue'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      overdueCount: await Payment.countDocuments({ tenant: tenantId, paymentStatus: 'Overdue' }),
    };

    res.json({
      payments,
      stats: {
        totalPaid: stats.totalPaid[0]?.total || 0,
        pendingAmount: stats.pendingAmount[0]?.total || 0,
        overdueCount: stats.overdueCount,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPayments: total
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments
const createPayment = async (req, res, next) => {
  try {
    const {
      propertyId,
      tenantId,
      amount,
      dueDate,
      paymentMethod,
      paymentType,
      month,
      notes,
      lateFee
    } = req.body;

    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify ownership
    const property = await Property.findOne({ _id: propertyId, owner: ownerId });
    if (!property) {
      return res.status(404).json({ message: "Property not found or not authorized" });
    }

    // Check if payment already exists for this property and month
    const existingPayment = await Payment.findOne({
      property: propertyId,
      month,
      paymentType,
      paymentStatus: { $ne: 'Partial' }
    });

    if (existingPayment) {
      return res.status(400).json({ message: "Payment already exists for this property and month" });
    }

    const payment = await Payment.create({
      property: propertyId,
      tenant: tenantId,
      owner: ownerId,
      amount: amount + (lateFee || 0),
      dueDate,
      paymentMethod,
      paymentType,
      month,
      notes,
      lateFee: lateFee || 0,
      createdBy: ownerId
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('tenant', 'username fullName phone email')
      .populate('property', 'name address city monthlyRent');

    res.status(201).json(populatedPayment);
  } catch (err) {
    next(err);
  }
};

// PUT /api/payments/:id/pay
const markPaymentAsPaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paidDate, transactionId, receiptUrl, notes, partialAmount } = req.body;
    const userId = req.user?.id;

    const payment = await Payment.findById(id).populate('property');
    
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check authorization (owner or tenant can mark as paid)
    if (payment.owner.toString() !== userId && payment.tenant.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to update this payment" });
    }

    const updateData = {
      paidDate: paidDate || new Date(),
      paymentStatus: 'Paid',
      transactionId,
      receiptUrl,
      notes,
    };

    if (partialAmount && partialAmount < payment.amount) {
      updateData.paymentStatus = 'Partial';
      updateData.partialAmount = partialAmount;
    }

    const updatedPayment = await Payment.findByIdAndUpdate(id, updateData, { new: true })
      .populate('tenant', 'username fullName phone email')
      .populate('property', 'name address city monthlyRent');

    res.json(updatedPayment);
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/generate-rent-payments
const generateRentPayments = async (req, res, next) => {
  try {
    const { propertyId, months } = req.body; // months: array of month-year strings
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const property = await Property.findOne({ _id: propertyId, owner: ownerId }).populate('tenant');
    
    if (!property) {
      return res.status(404).json({ message: "Property not found or not authorized" });
    }

    if (!property.tenant) {
      return res.status(400).json({ message: "Property has no tenant" });
    }

    const payments = [];
    const dueDate = new Date();
    dueDate.setDate(1); // Set to 1st of next month

    for (const month of months) {
      // Check if payment already exists
      const existingPayment = await Payment.findOne({
        property: propertyId,
        month,
        paymentType: 'Rent'
      });

      if (!existingPayment) {
        const payment = await Payment.create({
          property: propertyId,
          tenant: property.tenant._id,
          owner: ownerId,
          amount: property.monthlyRent,
          dueDate: new Date(dueDate),
          paymentType: 'Rent',
          month,
          createdBy: ownerId
        });

        payments.push(payment);
      }

      // Move to next month
      dueDate.setMonth(dueDate.getMonth() + 1);
    }

    res.status(201).json({
      message: `Generated ${payments.length} rent payments`,
      payments
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/payments/stats/:ownerId
const getPaymentStats = async (req, res, next) => {
  try {
    const { ownerId } = req.params;
    const { period = '6months' } = req.query;

    let startDate;
    const endDate = new Date();

    switch (period) {
      case '1month':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
        break;
      case '3months':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);
        break;
      case '6months':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 6, 1);
        break;
      case '1year':
        startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), 1);
        break;
      default:
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 6, 1);
    }

    const stats = await Payment.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(ownerId),
          paidDate: { $gte: startDate, $lte: endDate },
          paymentStatus: 'Paid'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidDate' },
            month: { $month: '$paidDate' }
          },
          totalIncome: { $sum: '$amount' },
          paymentCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const totalStats = await Payment.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(ownerId),
          paidDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$paymentStatus',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      monthlyStats: stats,
      totalStats,
      period
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOwnerPayments,
  getTenantPayments,
  createPayment,
  markPaymentAsPaid,
  generateRentPayments,
  getPaymentStats
};
