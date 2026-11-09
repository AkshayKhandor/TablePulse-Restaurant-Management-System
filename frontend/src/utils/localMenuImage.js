
const imageMap = {
  // SOUPS
  'hot & sour soup': 'foo-hot-sour-soup.png',
  'sweet corn soup': 'foo-sweet-corn-soup.png',
  'miso soup': 'foo-miso-soup.png',
  'tomato basil soup': 'tomato-basil-soup.jpg',

  // STARTERS
  'veg spring rolls': 'veg-spring-rolls.png',
  'veg gyoza': 'foo-gyoza.png',
  'edamame': 'foo-edamame.png',
  'paneer tikka': 'paneer-tikka.jpg',
  'samosa': 'samosa.jpg',
  'samosa (2 pcs)': 'samosa.jpg',
  'onion bhaji': 'onion-bhaji.jpg',

  // MAIN COURSE
  'butter paneer masala': 'paneer-butter-masala.png',
  'dal makhani': 'dal-makhani.png',
  'yellow curry': 'foo-yellow-curry.png',
  'chole bhature': 'chole-bhature.png',
  'palak paneer': 'palak-paneer.jpg',
  'aloo gobi': 'aloo-gobi.jpg',

  // RICE & NOODLES
  'veg biryani': 'veg-biryani.png',
  'veg fried rice': 'veg-fried-rice.png',
  'hakka noodles': 'foo-hakka-noodles.png',
  'pad thai noodles': 'pad-thai-noodles.jpg',
  'jeera rice': 'jeera-rice.jpg',

  // BREADS
  'butter naan': 'naan.png',
  'garlic naan': 'naan.png',
  'puri': 'puri.jpg',
  'puri (4 pcs)': 'puri.jpg',

  // DESSERTS
  'gulab jamun': 'gulab-jamun.png',
  'mango kulfi': 'mango-kulfi.jpg',
  'chocolate lava cake': 'chocolate-lava-cake.jpg',
  'rasmalai': 'rasmalai.jpg',

  // BEVERAGES
  
  'masala chai': 'masala-chai.png',
  'mango lassi': 'mango-lassi.png',
  'fresh lime soda': 'fresh-lime-soda.jpg',
  'cold coffee': 'cold-coffee.jpg',
  'watermelon juice': 'watermelon-juice.png',
  'filter coffee': 'filter-coffee.png',
};

// Returns the local image path for each menu item.
export function getMenuImage(item) {
  const name = String(item?.name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

  const filename = imageMap[name];

  if (filename) {
    return `/images/${filename}`;
  }

  // Default image for unmatched menu items.
  return '/images/food.png';
}
