const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Middleware with request logging
app.use((req, res, next) => {
  console.log(`\n📨 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.method === 'POST' && req.body && Object.keys(req.body).length > 0) {
    console.log('📝 Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/walletwise';

console.log(`🔗 Connecting to MongoDB: ${MONGODB_URI}`);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  console.log(`📊 Database: ${mongoose.connection.name}`);
  
  // Check existing users on startup
  checkExistingUsers();
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.log('\n💡 Troubleshooting Tips:');
  console.log('1. Check if MongoDB service is running');
  console.log('2. Start MongoDB: "mongod" in terminal or "net start MongoDB" in Admin PowerShell');
  console.log('3. Check .env file has: MONGODB_URI=mongodb://localhost:27017/walletwise');
  process.exit(1);
});

// ==================== MODELS ====================

// User Schema
const userSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: ''
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  year: {
    type: String,
    required: [true, 'Year is required'],
    enum: ['1st', '2nd', '3rd', '4th', '5th']
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  console.log(`🔐 Hashing password for user: ${this.email}`);
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { 
      userId: this._id, 
      email: this.email,
      studentId: this.studentId
    },
    process.env.JWT_SECRET || 'walletwise-secret-key-2024',
    { expiresIn: '7d' }
  );
  return token;
};

const User = mongoose.model('User', userSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['food', 'transport', 'shopping', 'entertainment', 'education', 'healthcare', 'housing', 'other'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'online'],
    default: 'cash'
  }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

// Budget Schema
const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  monthlyBudget: {
    type: Number,
    required: true,
    min: 0
  },
  categories: [{
    category: String,
    limit: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Budget = mongoose.model('Budget', budgetSchema);

// Savings Goal Schema
const savingsGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  targetDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['emergency', 'vacation', 'gadget', 'education', 'vehicle', 'other'],
    default: 'other'
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);

// ==================== HELPER FUNCTIONS ====================

// Function to check existing users
async function checkExistingUsers() {
  try {
    const userCount = await User.countDocuments();
    console.log(`👥 Total users in database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find({}, 'studentId email fullName createdAt').limit(5);
      console.log('📋 Recent users:');
      users.forEach(user => {
        console.log(`  - ${user.studentId}: ${user.email} (${user.fullName}) - ${user.createdAt}`);
      });
    }
  } catch (error) {
    console.error('Error checking existing users:', error);
  }
}

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'walletwise-secret-key-2024');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// ==================== ROUTES ====================

// Debug route to check all users
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    const total = await User.countDocuments();
    
    res.json({
      success: true,
      totalUsers: total,
      users: users,
      databaseInfo: {
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        readyState: mongoose.connection.readyState
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Clear all users (for testing only)
app.delete('/api/debug/clear-users', async (req, res) => {
  try {
    const result = await User.deleteMany({});
    console.log(`🗑️ Cleared ${result.deletedCount} users`);
    
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} users`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Clear users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing users',
      error: error.message
    });
  }
});

// Check if student ID or email exists (for real-time validation)
app.get('/api/auth/check-availability', async (req, res) => {
  try {
    const { studentId, email } = req.query;
    
    if (!studentId && !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId or email to check'
      });
    }
    
    const query = {};
    if (studentId) query.studentId = studentId.trim();
    if (email) query.email = email.toLowerCase().trim();
    
    const existingUser = await User.findOne(query);
    
    res.json({
      success: true,
      exists: !!existingUser,
      user: existingUser ? {
        studentId: existingUser.studentId,
        email: existingUser.email
      } : null
    });
    
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking availability',
      error: error.message
    });
  }
});

// ==================== AUTH ROUTES ====================

// Register Route
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('\n📝 REGISTRATION REQUEST');
    console.log('Request body:', req.body);
    
    const { studentId, name, fullName, email, password, phoneNumber, department, year } = req.body;
    
    const userName = name || fullName;
    
    if (!studentId || !userName || !email || !password || !department || !year) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All required fields: studentId, name/fullName, email, password, department, year'
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    const validYears = ['1st', '2nd', '3rd', '4th', '5th'];
    if (!validYears.includes(year)) {
      console.log('❌ Invalid year:', year);
      return res.status(400).json({
        success: false,
        message: 'Year must be one of: 1st, 2nd, 3rd, 4th, 5th'
      });
    }
    
    const normalizedStudentId = studentId.trim();
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedName = userName.trim();
    const normalizedDepartment = department.trim();
    const normalizedPhoneNumber = phoneNumber ? phoneNumber.trim() : '';
    
    console.log(`🔍 Checking for existing user with email: "${normalizedEmail}" or studentId: "${normalizedStudentId}"`);
    
    const existingUser = await User.findOne({ 
      $or: [
        { email: normalizedEmail },
        { studentId: normalizedStudentId }
      ] 
    });
    
    if (existingUser) {
      console.log('❌ User already exists!');
      
      let message = 'User already exists';
      if (existingUser.email === normalizedEmail && existingUser.studentId === normalizedStudentId) {
        message = `User with email "${existingUser.email}" and student ID "${existingUser.studentId}" already exists`;
      } else if (existingUser.email === normalizedEmail) {
        message = `User with email "${existingUser.email}" already exists`;
      } else if (existingUser.studentId === normalizedStudentId) {
        message = `User with student ID "${existingUser.studentId}" already exists`;
      }
      
      return res.status(400).json({
        success: false,
        message: message
      });
    }
    
    console.log('✅ No existing user found, creating new user...');
    
    const user = new User({
      studentId: normalizedStudentId,
      fullName: normalizedName,
      email: normalizedEmail,
      password: password,
      phoneNumber: normalizedPhoneNumber,
      department: normalizedDepartment,
      year: year,
      walletBalance: 0
    });
    
    await user.save();
    console.log('✅ User created successfully!');
    
    const token = user.generateAuthToken();
    
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: {
        id: user._id,
        studentId: user.studentId,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        department: user.department,
        year: user.year,
        walletBalance: user.walletBalance,
        createdAt: user.createdAt
      },
      token: token
    });
    
  } catch (error) {
    console.error('\n❌ REGISTRATION ERROR:', error.message);
    
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      const duplicateValue = error.keyValue[duplicateField];
      const fieldName = duplicateField === 'studentId' ? 'Student ID' : 'Email';
      
      return res.status(400).json({
        success: false,
        message: `${fieldName} "${duplicateValue}" is already registered`
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('\n🔐 LOGIN REQUEST');
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log('❌ User not found:', normalizedEmail);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', user.email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const token = user.generateAuthToken();
    
    console.log('✅ Login successful for:', user.email);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        studentId: user.studentId,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        department: user.department,
        year: user.year,
        walletBalance: user.walletBalance,
        createdAt: user.createdAt
      },
      token: token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get current user
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: user
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== DASHBOARD ROUTES ====================

// Dashboard Summary
app.get('/api/dashboard/summary', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    // Get all data in parallel
    const [transactions, budget, savingsGoals, user] = await Promise.all([
      Transaction.find({ userId }),
      Budget.findOne({ userId }),
      SavingsGoal.find({ userId, completed: false }),
      User.findById(userId).select('-password')
    ]);

    // Calculate monthly expenses and income
    const monthlyTransactions = transactions.filter(t => 
      t.date >= startOfMonth
    );
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate category spending
    const categorySpending = {};
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      });

    const categorySpendingArray = Object.entries(categorySpending).map(([name, amount]) => ({
      name,
      amount
    })).sort((a, b) => b.amount - a.amount);

    // Calculate weekly expenses
    const weeklyTransactions = transactions.filter(t => 
      t.type === 'expense' && t.date >= startOfWeek
    );
    
    const weeklyExpensesByDay = {};
    weeklyTransactions.forEach(t => {
      const day = t.date.toLocaleDateString('en-US', { weekday: 'short' });
      weeklyExpensesByDay[day] = (weeklyExpensesByDay[day] || 0) + t.amount;
    });

    const weeklyExpensesArray = Object.entries(weeklyExpensesByDay).map(([day, amount]) => ({
      day,
      amount
    }));

    // Calculate total savings
    const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);

    // Get recent transactions (last 10)
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map(t => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: t.date,
        paymentMethod: t.paymentMethod
      }));

    // Calculate budget data
    const monthlyBudget = budget?.monthlyBudget || 0;
    const budgetUsedPercentage = monthlyBudget > 0 ? 
      Math.min((monthlyExpenses / monthlyBudget) * 100, 100) : 0;
    const budgetLeft = Math.max(0, monthlyBudget - monthlyExpenses);

    // Calculate total balance (income - expenses + savings)
    const totalBalance = monthlyIncome - monthlyExpenses + totalSavings;

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId
      },
      stats: {
        totalBalance,
        monthlyExpenses,
        monthlyIncome,
        budgetLeft,
        totalSavings,
        monthlyBudget,
        budgetUsedPercentage
      },
      recentTransactions,
      categorySpending: categorySpendingArray,
      weeklyExpenses: weeklyExpensesArray,
      savingsGoals: savingsGoals.map(g => ({
        id: g._id,
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        targetDate: g.targetDate,
        category: g.category,
        progress: g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0
      })),
      notifications: 0
    });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard data' 
    });
  }
});

// Add Transaction
app.post('/api/transactions', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { type, amount, category, description, paymentMethod } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Type, amount, and category are required'
      });
    }

    const transaction = new Transaction({
      userId,
      type,
      amount,
      category,
      description,
      paymentMethod: paymentMethod || 'cash'
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: 'Transaction added successfully',
      transaction: {
        id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
        paymentMethod: transaction.paymentMethod
      }
    });

  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding transaction' 
    });
  }
});

// Get all transactions
app.get('/api/transactions', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 });

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: t.date,
        paymentMethod: t.paymentMethod
      }))
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching transactions' 
    });
  }
});

// Set Budget
app.post('/api/budget', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { monthlyBudget, categories } = req.body;

    if (!monthlyBudget || monthlyBudget < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid monthly budget is required'
      });
    }

    let budget = await Budget.findOne({ userId });

    if (budget) {
      budget.monthlyBudget = monthlyBudget;
      budget.categories = categories || [];
      budget.updatedAt = new Date();
    } else {
      budget = new Budget({
        userId,
        monthlyBudget,
        categories: categories || []
      });
    }

    await budget.save();

    res.json({
      success: true,
      message: 'Budget updated successfully',
      budget: {
        monthlyBudget: budget.monthlyBudget,
        categories: budget.categories,
        updatedAt: budget.updatedAt
      }
    });

  } catch (error) {
    console.error('Set budget error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error setting budget' 
    });
  }
});

// Get Budget
app.get('/api/budget', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const budget = await Budget.findOne({ userId });

    res.json({
      success: true,
      budget: budget || {
        monthlyBudget: 0,
        categories: [],
        updatedAt: null
      }
    });

  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching budget' 
    });
  }
});

// Add Savings Goal
app.post('/api/savings', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { name, targetAmount, targetDate, category } = req.body;

    if (!name || !targetAmount || !targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, target amount, and target date are required'
      });
    }

    if (targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be greater than 0'
      });
    }

    const savingsGoal = new SavingsGoal({
      userId,
      name,
      targetAmount,
      targetDate,
      category: category || 'other',
      currentAmount: 0,
      completed: false
    });

    await savingsGoal.save();

    res.status(201).json({
      success: true,
      message: 'Savings goal created successfully',
      savingsGoal: {
        id: savingsGoal._id,
        name: savingsGoal.name,
        targetAmount: savingsGoal.targetAmount,
        currentAmount: savingsGoal.currentAmount,
        targetDate: savingsGoal.targetDate,
        category: savingsGoal.category
      }
    });

  } catch (error) {
    console.error('Add savings goal error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating savings goal' 
    });
  }
});

// Get Savings Goals
app.get('/api/savings', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const savingsGoals = await SavingsGoal.find({ userId, completed: false });

    res.json({
      success: true,
      savingsGoals: savingsGoals.map(g => ({
        id: g._id,
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        targetDate: g.targetDate,
        category: g.category,
        progress: g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0
      }))
    });

  } catch (error) {
    console.error('Get savings goals error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching savings goals' 
    });
  }
});

// ==================== UTILITY ROUTES ====================

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    uptime: process.uptime()
  });
});

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'WalletWise Backend API is running',
    version: '3.0.0',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me (requires token)'
      },
      dashboard: {
        summary: 'GET /api/dashboard/summary (requires token)',
        transactions: 'GET /api/transactions (requires token)',
        addTransaction: 'POST /api/transactions (requires token)',
        budget: 'GET /api/budget (requires token)',
        setBudget: 'POST /api/budget (requires token)',
        savings: 'GET /api/savings (requires token)',
        addSavings: 'POST /api/savings (requires token)'
      },
      utility: {
        health: 'GET /api/health',
        checkAvailability: 'GET /api/auth/check-availability',
        debugUsers: 'GET /api/debug/users',
        clearUsers: 'DELETE /api/debug/clear-users (testing)'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    requestedUrl: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}`);
  console.log(`🔒 JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Using default (not for production!)'}`);
  console.log(`🌐 CORS enabled for: http://localhost:3000`);
  console.log(`\n📋 NEW DASHBOARD ENDPOINTS ADDED:`);
  console.log(`  GET  /api/dashboard/summary  - Dashboard summary data (requires token)`);
  console.log(`  POST /api/transactions       - Add transaction (requires token)`);
  console.log(`  GET  /api/transactions       - Get all transactions (requires token)`);
  console.log(`  POST /api/budget             - Set monthly budget (requires token)`);
  console.log(`  GET  /api/budget             - Get budget (requires token)`);
  console.log(`  POST /api/savings            - Add savings goal (requires token)`);
  console.log(`  GET  /api/savings            - Get savings goals (requires token)`);
  console.log('\n📊 Waiting for requests...');
});