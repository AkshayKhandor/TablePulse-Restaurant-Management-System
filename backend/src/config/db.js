const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs   = require('fs');

// Where we snapshot orders between restarts
const SNAPSHOT_PATH = path.join(__dirname, '../../../.mongodb-data/orders-snapshot.json');

let mongod = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
      if (!mongod) {
        mongod = await MongoMemoryServer.create();
        console.log('Using In-Memory MongoDB Server');
      }
      mongoUri = mongod.getUri();
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected');

    await seedAdmin();
    await seedMenu();
    await restoreOrders();
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

// ── Graceful shutdown: snapshot orders to disk ───────────────────────────────
process.on('SIGINT',  () => shutdownAndSave());
process.on('SIGTERM', () => shutdownAndSave());

const shutdownAndSave = async () => {
  try {
    await snapshotOrders();
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
    console.log('\n💾 Orders saved to .mongodb-data/orders-snapshot.json');
  } catch (_) {}
  process.exit(0);
};

const seedAdmin = async () => {
  const User = require('../models/User');
  const existing = await User.findOne({ email: 'admin@resto.com' });
  if (!existing) {
    await User.create({
      name: 'Admin User',
      email: 'admin@resto.com',
      password: 'password123',
      role: 'admin',
    });
    console.log('✅ Admin seeded: admin@resto.com / password123');
  } else {
    console.log('ℹ️  Admin user already exists');
  }
};

const seedMenu = async () => {
  const MenuItem = require('../models/MenuItem');
  // Always clear and re-seed so image URLs stay up to date
  await MenuItem.deleteMany({});

  const items = [
    // ── Soups ─────────────────────────────────────────────────────────
    {
      name: 'Hot & Sour Soup',
      description: 'Classic Pan-Asian hot & sour broth with silken tofu and broccoli — bold, tangy and deeply warming.',
      price: 320,
      category: 'Soups',
      image: '/images/foo-hot-sour-soup.png',
    },
    {
      name: 'Sweet Corn Soup',
      description: 'Velvety sweet corn soup with edamame and asparagus in a light, golden broth.',
      price: 280,
      category: 'Soups',
      image: '/images/foo-sweet-corn-soup.png',
    },
    {
      name: 'Miso Soup',
      description: 'Delicate kombu dashi broth with silken tofu and wakame seaweed. A Japanese staple.',
      price: 220,
      category: 'Soups',
      image: '/images/foo-miso-soup.png',
    },
    {
      name: 'Tomato Basil Soup',
      description: 'Rich roasted tomato soup blended with fresh basil and a drizzle of cream.',
      price: 260,
      category: 'Soups',
      image: '/images/food.png',
    },

    // ── Starters ──────────────────────────────────────────────────────
    {
      name: 'Paneer Tikka',
      description: 'Smoky marinated cottage cheese cubes grilled in a tandoor, served with mint chutney.',
      price: 480,
      category: 'Starters',
      image: '/images/food.png',
    },
    {
      name: 'Veg Spring Rolls',
      description: 'Golden crispy spring rolls packed with fresh vegetables, served with Thai dipping sauce.',
      price: 360,
      category: 'Starters',
      image: '/images/foo-spring-roll.png',
    },
    {
      name: 'Crispy Lotus Root',
      description: 'Thinly sliced lotus root deep-fried to a perfect crisp with Thai spice seasoning.',
      price: 380,
      category: 'Starters',
      image: '/images/food.png',
    },
    {
      name: 'Veg Gyoza',
      description: 'Pan-seared Japanese gyoza stuffed with bok choy, beans and cauliflower. Crispy juicy base.',
      price: 440,
      category: 'Starters',
      image: '/images/foo-gyoza.png',
    },
    {
      name: 'Edamame',
      description: 'Simply steamed edamame pods finished with flaky Maldon sea salt. Light and addictive.',
      price: 280,
      category: 'Starters',
      image: '/images/foo-edamame.png',
    },
    {
      name: 'Samosa (2 pcs)',
      description: 'Crispy golden samosas filled with spiced potatoes and peas, served with tamarind chutney.',
      price: 180,
      category: 'Starters',
      image: '/images/food.png',
    },

    // ── Main Course ───────────────────────────────────────────────────
    {
      name: 'Butter Paneer Masala',
      description: 'Cottage cheese cubes in a rich, creamy tomato-butter gravy. The ultimate crowd-pleaser.',
      price: 620,
      category: 'Main Course',
      image: '/images/paneer-butter-masala.png',
    },
    {
      name: 'Dal Makhani',
      description: 'Slow-cooked black lentils in a rich butter and cream sauce. A timeless North Indian classic.',
      price: 480,
      category: 'Main Course',
      image: '/images/dal-makhani.png',
    },
    {
      name: 'Palak Paneer',
      description: 'Fresh cottage cheese in a vibrant, spiced spinach gravy. Nutritious and deeply flavourful.',
      price: 540,
      category: 'Main Course',
      image: '/images/food.png',
    },
    {
      name: 'Yellow Curry',
      description: 'Aromatic Thai yellow coconut curry with crunchy water chestnuts, broccoli and mushrooms.',
      price: 680,
      category: 'Main Course',
      image: '/images/foo-yellow-curry.png',
    },
    {
      name: 'Chhole Bhature',
      description: 'Spiced chickpea curry served with fluffy deep-fried leavened bread. A Punjabi classic.',
      price: 380,
      category: 'Main Course',
      image: '/images/food.png',
    },
    {
      name: 'Aloo Gobi',
      description: 'Dry-spiced potato and cauliflower stir-fry with cumin, turmeric and fresh coriander.',
      price: 360,
      category: 'Main Course',
      image: '/images/food.png',
    },

    // ── Rice & Noodles ────────────────────────────────────────────────
    {
      name: 'Veg Fried Rice',
      description: 'Wok-tossed basmati rice with mixed vegetables, egg-free and packed with umami flavour.',
      price: 380,
      category: 'Rice & Noodles',
      image: '/images/veg-fried-rice.png',
    },
    {
      name: 'Hakka Noodles',
      description: 'Thin noodles wok-tossed with julienned vegetables, bean sprouts and signature sauce.',
      price: 420,
      category: 'Rice & Noodles',
      image: '/images/foo-hakka-noodles.png',
    },
    {
      name: 'Jeera Rice',
      description: 'Fragrant basmati rice tempered with cumin seeds and ghee. Simple and comforting.',
      price: 220,
      category: 'Rice & Noodles',
      image: '/images/food.png',
    },
    {
      name: 'Pad Thai Noodles',
      description: 'Classic Thai rice noodles stir-fried with tofu, bean sprouts and tamarind-based sauce.',
      price: 480,
      category: 'Rice & Noodles',
      image: '/images/food.png',
    },

    // ── Breads ────────────────────────────────────────────────────────
    {
      name: 'Butter Naan',
      description: 'Soft, pillowy leavened flatbread baked in a tandoor and finished with melted butter.',
      price: 80,
      category: 'Breads',
      image: '/images/naan.png',
    },
    {
      name: 'Garlic Naan',
      description: 'Tandoor-baked naan topped with minced garlic and fresh coriander. Irresistibly fragrant.',
      price: 100,
      category: 'Breads',
      image: '/images/naan.png',
    },
    {
      name: 'Missi Roti',
      description: 'Whole wheat and gram flour flatbread spiced with carom seeds and green chillies.',
      price: 90,
      category: 'Breads',
      image: '/images/food.png',
    },

    // ── Desserts ──────────────────────────────────────────────────────
    {
      name: 'Gulab Jamun',
      description: 'Soft milk-solid dumplings soaked in rose-cardamom sugar syrup. Served warm.',
      price: 220,
      category: 'Desserts',
      image: '/images/gulab-jamun.png',
    },
    {
      name: 'Mango Kulfi',
      description: 'Dense, creamy Indian ice cream infused with fresh Alphonso mango and cardamom.',
      price: 260,
      category: 'Desserts',
      image: '/images/food.png',
    },
    {
      name: 'Chocolate Lava Cake',
      description: 'Warm dark chocolate fondant with a gooey centre, served with vanilla ice cream.',
      price: 420,
      category: 'Desserts',
      image: '/images/foo-choc-textures.png',
    },
    {
      name: 'Mango Pudding',
      description: 'Silky smooth Cantonese-style mango pudding with fresh mango coulis. Light and tropical.',
      price: 300,
      category: 'Desserts',
      image: '/images/food.png',
    },
    {
      name: 'Rasmalai',
      description: 'Delicate cottage cheese patties soaked in chilled saffron-cardamom milk. Heavenly.',
      price: 240,
      category: 'Desserts',
      image: '/images/food.png',
    },

    // ── Beverages ─────────────────────────────────────────────────────
    {
      name: 'Mango Lassi',
      description: 'Thick and creamy yoghurt-based drink blended with ripe Alphonso mangoes. Chilled to perfection.',
      price: 200,
      category: 'Beverages',
      image: '/images/food.png',
    },
    {
      name: 'Masala Chai',
      description: 'Aromatic Indian spiced tea brewed with ginger, cardamom, cinnamon and fresh milk.',
      price: 120,
      category: 'Beverages',
      image: '/images/food.png',
    },
    {
      name: 'Fresh Lime Soda',
      description: 'Freshly squeezed lime juice topped with chilled soda. Choose sweet, salt or both.',
      price: 140,
      category: 'Beverages',
      image: '/images/food.png',
    },
    {
      name: 'Cold Coffee',
      description: 'Chilled blended coffee with milk and sugar, topped with a scoop of vanilla ice cream.',
      price: 220,
      category: 'Beverages',
      image: '/images/food.png',
    },
    {
      name: 'Watermelon Juice',
      description: 'Freshly pressed watermelon juice — naturally sweet, hydrating and vibrant pink.',
      price: 160,
      category: 'Beverages',
      image: '/images/food.png',
    },
  ];

  await MenuItem.insertMany(items);
  console.log(`✅ Menu seeded: ${items.length} items with real food images`);
};

module.exports = connectDB;
module.exports.seedMenuItems = seedMenu;


// ── Snapshot: save all orders to JSON on shutdown ───────────────────────────
const snapshotOrders = async () => {
  try {
    const Order = require('../models/Order');
    const orders = await Order.find({}).lean();
    if (orders.length === 0) return;
    fs.mkdirSync(path.dirname(SNAPSHOT_PATH), { recursive: true });
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(orders, null, 2));
    console.log(`  📦 Snapshotted ${orders.length} orders to disk`);
  } catch (e) {
    console.warn('  ⚠️  Could not snapshot orders:', e.message);
  }
};

// ── Restore: reload orders from JSON snapshot on boot ───────────────────────
const restoreOrders = async () => {
  try {
    if (!fs.existsSync(SNAPSHOT_PATH)) return;
    const Order = require('../models/Order');
    const existing = await Order.countDocuments();
    if (existing > 0) return;

    const raw    = fs.readFileSync(SNAPSHOT_PATH, 'utf8');
    const orders = JSON.parse(raw);
    if (!orders.length) return;

    await Order.insertMany(orders, { ordered: false });
    console.log(`✅ Restored ${orders.length} orders from snapshot`);
  } catch (e) {
    console.warn('  ⚠️  Could not restore orders:', e.message);
  }
};
