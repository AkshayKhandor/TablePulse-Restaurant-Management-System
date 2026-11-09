#!/usr/bin/env python3
"""Delete all menu items and re-add with working loremflickr.com images + ₹ prices"""
import subprocess, json, sys

# Login
r = subprocess.check_output([
    "curl","-s","-X","POST","http://localhost:5001/api/auth/login",
    "-H","Content-Type: application/json",
    "-d",'{"email":"admin@resto.com","password":"password123"}'
])
TOKEN = json.loads(r)["token"]
print(f"✅ Logged in")

# Get all IDs and delete
ids_raw = subprocess.check_output(["curl","-s","http://localhost:5001/api/menu"])
ids = [i["_id"] for i in json.loads(ids_raw)]
print(f"🗑  Deleting {len(ids)} old items...")
for _id in ids:
    subprocess.call([
        "curl","-s","-X","DELETE",f"http://localhost:5001/api/menu/{_id}",
        "-H",f"Authorization: Bearer {TOKEN}"
    ], stdout=subprocess.DEVNULL)
print(f"✅ All old items deleted\n")

# loremflickr.com: keyword-based free images, no auth, always works
# Format: https://loremflickr.com/400/300/keyword1,keyword2
items = [
  # ── Soups ────────────────────────────────────────────────────
  {"name":"Hot & Sour Soup","description":"Classic Pan-Asian hot & sour broth with silken tofu and broccoli — bold, tangy and deeply warming.","price":320,"category":"Soups",
   "image":"https://loremflickr.com/400/300/soup,hot"},
  {"name":"Sweet Corn Soup","description":"Velvety sweet corn soup with edamame and asparagus in a light golden broth.","price":280,"category":"Soups",
   "image":"https://loremflickr.com/400/300/corn,soup"},
  {"name":"Miso Soup","description":"Delicate kombu dashi broth with silken tofu and wakame seaweed.","price":220,"category":"Soups",
   "image":"https://loremflickr.com/400/300/miso,soup,japanese"},
  {"name":"Tomato Basil Soup","description":"Rich roasted tomato soup blended with fresh basil and a drizzle of cream.","price":260,"category":"Soups",
   "image":"https://loremflickr.com/400/300/tomato,soup"},

  # ── Starters ─────────────────────────────────────────────────
  {"name":"Paneer Tikka","description":"Smoky marinated cottage cheese cubes grilled in a tandoor, served with mint chutney.","price":480,"category":"Starters",
   "image":"https://loremflickr.com/400/300/paneer,tikka,indian"},
  {"name":"Veg Spring Rolls","description":"Golden crispy spring rolls packed with fresh vegetables, served with Thai dipping sauce.","price":360,"category":"Starters",
   "image":"https://loremflickr.com/400/300/spring,rolls"},
  {"name":"Veg Gyoza","description":"Pan-seared Japanese gyoza stuffed with bok choy, beans and cauliflower.","price":440,"category":"Starters",
   "image":"https://loremflickr.com/400/300/gyoza,dumpling,japanese"},
  {"name":"Edamame","description":"Steamed edamame pods finished with flaky Maldon sea salt. Light and addictive.","price":280,"category":"Starters",
   "image":"https://loremflickr.com/400/300/edamame,soybean"},
  {"name":"Samosa (2 pcs)","description":"Crispy golden samosas filled with spiced potatoes and peas, served with tamarind chutney.","price":180,"category":"Starters",
   "image":"https://loremflickr.com/400/300/samosa,indian"},
  {"name":"Onion Bhaji","description":"Crispy golden onion fritters spiced with cumin, coriander and green chillies.","price":220,"category":"Starters",
   "image":"https://loremflickr.com/400/300/onion,fritter,indian"},

  # ── Main Course ───────────────────────────────────────────────
  {"name":"Butter Paneer Masala","description":"Cottage cheese cubes in a rich, creamy tomato-butter gravy. The ultimate crowd-pleaser.","price":620,"category":"Main Course",
   "image":"https://loremflickr.com/400/300/paneer,curry,indian"},
  {"name":"Dal Makhani","description":"Slow-cooked black lentils in a rich butter and cream sauce. A timeless North Indian classic.","price":480,"category":"Main Course",
   "image":"https://loremflickr.com/400/300/dal,lentil,curry"},
  {"name":"Palak Paneer","description":"Fresh cottage cheese in a vibrant spiced spinach gravy.","price":540,"category":"Main Course",
   "image":"https://loremflickr.com/400/300/spinach,curry,indian"},
  {"name":"Yellow Curry","description":"Aromatic Thai yellow coconut curry with water chestnuts, broccoli and mushrooms.","price":680,"category":"Main Course",
   "image":"https://loremflickr.com/400/300/curry,thai,coconut"},
  {"name":"Chole Bhature","description":"Spiced chickpea curry served with fluffy deep-fried leavened bread.","price":380,"category":"Main Course",
   "image":"https://loremflickr.com/400/300/chickpea,curry,indian"},
  {"name":"Aloo Gobi","description":"Dry-spiced potato and cauliflower stir-fry with cumin, turmeric and coriander.","price":360,"category":"Main Course",
   "image":"https://loremflickr.com/400/300/cauliflower,potato,indian"},

  # ── Rice & Noodles ────────────────────────────────────────────
  {"name":"Veg Biryani","description":"Fragrant long-grain basmati rice layered with spiced vegetables and saffron.","price":520,"category":"Rice & Noodles",
   "image":"https://loremflickr.com/400/300/biryani,rice,indian"},
  {"name":"Veg Fried Rice","description":"Wok-tossed basmati rice with mixed vegetables packed with umami flavour.","price":380,"category":"Rice & Noodles",
   "image":"https://loremflickr.com/400/300/fried,rice,asian"},
  {"name":"Hakka Noodles","description":"Thin noodles wok-tossed with julienned vegetables, bean sprouts and signature sauce.","price":420,"category":"Rice & Noodles",
   "image":"https://loremflickr.com/400/300/noodles,wok,chinese"},
  {"name":"Pad Thai Noodles","description":"Classic Thai rice noodles stir-fried with tofu, bean sprouts and tamarind sauce.","price":480,"category":"Rice & Noodles",
   "image":"https://loremflickr.com/400/300/pad,thai,noodles"},
  {"name":"Jeera Rice","description":"Fragrant basmati rice tempered with cumin seeds and ghee.","price":220,"category":"Rice & Noodles",
   "image":"https://loremflickr.com/400/300/rice,cumin,basmati"},

  # ── Breads ────────────────────────────────────────────────────
  {"name":"Butter Naan","description":"Soft leavened flatbread baked in a tandoor and finished with melted butter.","price":80,"category":"Breads",
   "image":"https://loremflickr.com/400/300/naan,bread,indian"},
  {"name":"Garlic Naan","description":"Tandoor-baked naan topped with minced garlic and fresh coriander.","price":100,"category":"Breads",
   "image":"https://loremflickr.com/400/300/garlic,naan,flatbread"},
  {"name":"Puri (4 pcs)","description":"Crispy whole wheat deep-fried puffed bread, served hot.","price":60,"category":"Breads",
   "image":"https://loremflickr.com/400/300/puri,bread,fried"},

  # ── Desserts ──────────────────────────────────────────────────
  {"name":"Gulab Jamun","description":"Soft milk-solid dumplings soaked in rose-cardamom sugar syrup. Served warm.","price":220,"category":"Desserts",
   "image":"https://loremflickr.com/400/300/gulab,jamun,indian,dessert"},
  {"name":"Mango Kulfi","description":"Dense creamy Indian ice cream infused with fresh Alphonso mango and cardamom.","price":260,"category":"Desserts",
   "image":"https://loremflickr.com/400/300/kulfi,mango,ice,cream"},
  {"name":"Chocolate Lava Cake","description":"Warm dark chocolate fondant with a gooey centre, served with vanilla ice cream.","price":420,"category":"Desserts",
   "image":"https://loremflickr.com/400/300/chocolate,lava,cake,dessert"},
  {"name":"Rasmalai","description":"Delicate cottage cheese patties soaked in chilled saffron-cardamom milk.","price":240,"category":"Desserts",
   "image":"https://loremflickr.com/400/300/rasmalai,indian,sweet"},

  # ── Beverages ─────────────────────────────────────────────────
  {"name":"Mango Lassi","description":"Thick creamy yoghurt drink blended with ripe Alphonso mangoes. Chilled to perfection.","price":200,"category":"Beverages",
   "image":"https://loremflickr.com/400/300/mango,lassi,yogurt,drink"},
  {"name":"Masala Chai","description":"Aromatic Indian spiced tea brewed with ginger, cardamom, cinnamon and fresh milk.","price":120,"category":"Beverages",
   "image":"https://loremflickr.com/400/300/masala,chai,tea,indian"},
  {"name":"Fresh Lime Soda","description":"Freshly squeezed lime juice topped with chilled soda. Sweet, salt or mixed.","price":140,"category":"Beverages",
   "image":"https://loremflickr.com/400/300/lime,soda,lemonade,drink"},
  {"name":"Cold Coffee","description":"Chilled blended coffee with milk and sugar, topped with a scoop of vanilla ice cream.","price":220,"category":"Beverages",
   "image":"https://loremflickr.com/400/300/cold,coffee,iced"},
  {"name":"Watermelon Juice","description":"Freshly pressed watermelon juice — naturally sweet, hydrating and vibrant pink.","price":160,"category":"Beverages",
   "image":"https://loremflickr.com/400/300/watermelon,juice,fresh"},
  {"name":"Filter Coffee","description":"Strong South Indian filter coffee served with frothy milk in a traditional dabara.","price":100,"category":"Beverages",
   "image":"https://loremflickr.com/400/300/coffee,filter,south,indian"},
]

added = 0
for item in items:
    r = subprocess.check_output([
        "curl","-s","-X","POST","http://localhost:5001/api/menu",
        "-H","Content-Type: application/json",
        "-H",f"Authorization: Bearer {TOKEN}",
        "-d", json.dumps(item)
    ])
    resp = json.loads(r)
    if "_id" in resp:
        print(f"  ✅ ₹{item['price']:>4}  {item['name']}")
        added += 1
    else:
        print(f"  ❌ FAILED: {item['name']} → {resp}")

print(f"\n{'='*50}")
print(f"✅ Done! Added {added}/{len(items)} items with images")
