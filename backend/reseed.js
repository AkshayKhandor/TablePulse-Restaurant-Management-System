// One-time script to wipe menu and re-seed with image URLs
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const MenuItem = require('./src/models/MenuItem');

const items = [
    { name: 'Hot & Sour Soup', description: 'Classic Pan-Asian hot & sour broth with silken tofu and broccoli.', price: 320, category: 'Soups', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80' },
    { name: 'Sweet Corn Soup', description: 'Velvety sweet corn soup with edamame and asparagus.', price: 280, category: 'Soups', image: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=400&q=80' },
    { name: 'Miso Soup', description: 'Delicate kombu dashi broth with silken tofu and wakame seaweed.', price: 220, category: 'Soups', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80' },
    { name: 'Tomato Basil Soup', description: 'Rich roasted tomato soup blended with fresh basil and cream.', price: 260, category: 'Soups', image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&q=80' },
    { name: 'Paneer Tikka', description: 'Smoky marinated cottage cheese cubes grilled in a tandoor, served with mint chutney.', price: 480, category: 'Starters', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80' },
    { name: 'Veg Spring Rolls', description: 'Golden crispy spring rolls packed with fresh vegetables.', price: 360, category: 'Starters', image: 'https://images.unsplash.com/photo-1712143921571-c81b99640ce2?w=400&q=80' },
    { name: 'Veg Gyoza', description: 'Pan-seared Japanese gyoza stuffed with bok choy and beans.', price: 440, category: 'Starters', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&q=80' },
    { name: 'Edamame', description: 'Steamed edamame pods finished with flaky Maldon sea salt.', price: 280, category: 'Starters', image: 'https://images.unsplash.com/photo-1609861572736-93e91b6a9b45?w=400&q=80' },
    { name: 'Samosa (2 pcs)', description: 'Crispy golden samosas filled with spiced potatoes and peas.', price: 180, category: 'Starters', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
    { name: 'Butter Paneer Masala', description: 'Cottage cheese in a rich, creamy tomato-butter gravy.', price: 620, category: 'Main Course', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&q=80' },
    { name: 'Dal Makhani', description: 'Slow-cooked black lentils in a rich butter and cream sauce.', price: 480, category: 'Main Course', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80' },
    { name: 'Palak Paneer', description: 'Fresh cottage cheese in a vibrant spiced spinach gravy.', price: 540, category: 'Main Course', image: 'https://images.unsplash.com/photo-1645177628172-a5b99aba1aba?w=400&q=80' },
    { name: 'Yellow Curry', description: 'Aromatic Thai yellow coconut curry with water chestnuts and mushrooms.', price: 680, category: 'Main Course', image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&q=80' },
    { name: 'Chole Bhature', description: 'Spiced chickpea curry served with fluffy deep-fried bread.', price: 380, category: 'Main Course', image: 'https://images.unsplash.com/photo-1626200930688-6f8c6d8eee00?w=400&q=80' },
    { name: 'Aloo Gobi', description: 'Dry-spiced potato and cauliflower stir-fry with cumin and turmeric.', price: 360, category: 'Main Course', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80' },
    { name: 'Veg Biryani', description: 'Fragrant long-grain basmati rice layered with spiced vegetables and saffron.', price: 520, category: 'Rice & Noodles', image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400&q=80' },
    { name: 'Veg Fried Rice', description: 'Wok-tossed basmati rice with mixed vegetables.', price: 380, category: 'Rice & Noodles', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80' },
    { name: 'Hakka Noodles', description: 'Thin noodles wok-tossed with julienned vegetables and bean sprouts.', price: 420, category: 'Rice & Noodles', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80' },
    { name: 'Pad Thai Noodles', description: 'Classic Thai rice noodles stir-fried with tofu and bean sprouts.', price: 480, category: 'Rice & Noodles', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80' },
    { name: 'Jeera Rice', description: 'Fragrant basmati rice tempered with cumin seeds and ghee.', price: 220, category: 'Rice & Noodles', image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&q=80' },
    { name: 'Butter Naan', description: 'Soft leavened flatbread baked in a tandoor with melted butter.', price: 80, category: 'Breads', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80' },
    { name: 'Garlic Naan', description: 'Tandoor-baked naan topped with minced garlic and fresh coriander.', price: 100, category: 'Breads', image: 'https://images.unsplash.com/photo-1593759608142-e976b9eff33e?w=400&q=80' },
    { name: 'Puri (4 pcs)', description: 'Crispy whole wheat deep-fried puffed bread, served hot.', price: 60, category: 'Breads', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80' },
    { name: 'Gulab Jamun', description: 'Soft milk-solid dumplings soaked in rose-cardamom sugar syrup.', price: 220, category: 'Desserts', image: 'https://images.unsplash.com/photo-1666109344074-85fbe8b0d470?w=400&q=80' },
    { name: 'Mango Kulfi', description: 'Dense creamy Indian ice cream infused with fresh Alphonso mango.', price: 260, category: 'Desserts', image: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=400&q=80' },
    { name: 'Chocolate Lava Cake', description: 'Warm dark chocolate fondant with a gooey centre and vanilla ice cream.', price: 420, category: 'Desserts', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80' },
    { name: 'Rasmalai', description: 'Delicate cottage cheese patties soaked in chilled saffron-cardamom milk.', price: 240, category: 'Desserts', image: 'https://images.unsplash.com/photo-1601303516534-bf4dc7117b8f?w=400&q=80' },
    { name: 'Mango Lassi', description: 'Thick creamy yoghurt drink blended with ripe Alphonso mangoes.', price: 200, category: 'Beverages', image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&q=80' },
    { name: 'Masala Chai', description: 'Aromatic Indian spiced tea brewed with ginger, cardamom and cinnamon.', price: 120, category: 'Beverages', image: 'https://images.unsplash.com/photo-1561336526-2914f13ceb36?w=400&q=80' },
    { name: 'Fresh Lime Soda', description: 'Freshly squeezed lime juice topped with chilled soda. Sweet or salt.', price: 140, category: 'Beverages', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80' },
    { name: 'Cold Coffee', description: 'Chilled blended coffee with milk topped with a scoop of vanilla ice cream.', price: 220, category: 'Beverages', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80' },
    { name: 'Watermelon Juice', description: 'Freshly pressed watermelon juice — naturally sweet and vibrant pink.', price: 160, category: 'Beverages', image: 'https://images.unsplash.com/photo-1560508179-b2c9a3f8e92b?w=400&q=80' },
    { name: 'Filter Coffee', description: 'Strong South Indian filter coffee served with frothy milk in a traditional dabara.', price: 100, category: 'Beverages', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80' },
];

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/restaurant_pos_seed_helper').catch(() => {});
  // Connect directly to the running in-memory server via the API instead
  console.log('Use the API route approach instead');
  process.exit(0);
}
