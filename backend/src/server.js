const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes  = require('./routes/authRoutes');
const menuRoutes  = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/auth',   authRoutes);
app.use('/api/menu',   menuRoutes);
app.use('/api/orders', orderRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Admin-only: force menu re-seed with fresh images
app.post('/api/reseed-menu', async (req, res) => {
  try {
    const MenuItem = require('./models/MenuItem');
    await MenuItem.deleteMany({});
    const { seedMenuItems } = require('./config/db');
    await seedMenuItems();
    const count = await MenuItem.countDocuments();
    res.json({ message: `Menu re-seeded with ${count} items with images` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
