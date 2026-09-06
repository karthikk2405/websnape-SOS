/* ===== DATA LAYER ===== */
const DataStore = (() => {
  const KEYS = {
    MENU: 'sos_menu_items',
    ORDERS: 'sos_orders',
    ADMIN: 'sos_admin_creds',
    TABLE_COUNT: 'sos_table_count',
  };

  // ── Default Menu Items ──
  const DEFAULT_MENU = [
    // ── Salads & Soups ──
    { id: 'ss1', name: 'Green Salad', price: 109, category: 'Salads & Soups', description: 'Fresh garden greens tossed in a light dressing', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80', available: true },
    { id: 'ss2', name: 'Caesar Salad (Veg)', price: 229, category: 'Salads & Soups', description: 'Classic Caesar with crispy croutons and parmesan', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&q=80', available: true },
    { id: 'ss3', name: 'Caesar Salad (Non-Veg)', price: 349, category: 'Salads & Soups', description: 'Caesar salad with grilled chicken', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&q=80', available: true },
    { id: 'ss4', name: 'Hawaiian Salad (Veg)', price: 229, category: 'Salads & Soups', description: 'Tropical Hawaiian salad with pineapple and fresh veggies', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80', available: true },
    { id: 'ss5', name: 'Hawaiian Salad (Non-Veg)', price: 359, category: 'Salads & Soups', description: 'Hawaiian salad with grilled chicken and pineapple', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80', available: true },
    { id: 'ss6', name: 'Veg Manchow Soup', price: 209, category: 'Salads & Soups', description: 'Indo-Chinese spiced vegetable soup with crispy noodles', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80', available: true },
    { id: 'ss7', name: 'Hot And Sour Soup (Veg)', price: 219, category: 'Salads & Soups', description: 'Tangy and spicy veg soup', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80', available: true },
    { id: 'ss8', name: 'Hot And Sour Soup (Non-Veg)', price: 269, category: 'Salads & Soups', description: 'Tangy and spicy chicken soup', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80', available: true },
    { id: 'ss9', name: 'Red Asian Soup', price: 249, category: 'Salads & Soups', description: 'Rich and aromatic red Asian broth', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80', available: true },
    { id: 'ss10', name: 'Tangyy Basil Soup', price: 259, category: 'Salads & Soups', description: 'Fresh basil-infused tangy tomato soup', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80', available: true },
    { id: 'ss11', name: 'Paneer Picking Soup', price: 269, category: 'Salads & Soups', description: 'Hearty soup loaded with paneer cubes', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80', available: true },
    { id: 'ss12', name: 'Cream Of Mushroom', price: 269, category: 'Salads & Soups', description: 'Velvety smooth cream of mushroom soup', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80', available: true },
    { id: 'ss13', name: 'Chicken Manchow Soup', price: 279, category: 'Salads & Soups', description: 'Spiced chicken Manchow with crispy noodles', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80', available: true },
    { id: 'ss14', name: 'Tangy Coriander Soup', price: 279, category: 'Salads & Soups', description: 'Refreshing coriander-infused tangy broth', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80', available: true },
    { id: 'ss15', name: 'Continental Cornny Soup (Veg)', price: 289, category: 'Salads & Soups', description: 'Creamy sweetcorn soup, Continental style', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80', available: true },
    { id: 'ss16', name: 'Continental Cornny Soup (Non-Veg)', price: 310, category: 'Salads & Soups', description: 'Creamy sweetcorn soup with chicken', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80', available: true },

    // ── Starters & Appetizers ──
    { id: 'st1', name: 'French Fries (Salted)', price: 149, category: 'Starters & Appetizers', description: 'Classic crispy salted golden fries', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=800&q=80', available: true },
    { id: 'st2', name: 'Peri Peri Fries', price: 159, category: 'Starters & Appetizers', description: 'Crispy fries tossed in fiery peri peri seasoning', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=800&q=80', available: true },
    { id: 'st3', name: 'Cheesey Loaded Fries', price: 229, category: 'Starters & Appetizers', description: 'Golden fries smothered in melted cheese', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=800&q=80', available: true },
    { id: 'st4', name: 'Veg Loaded Nachos', price: 269, category: 'Starters & Appetizers', description: 'Tortilla chips loaded with veggies, cheese, and salsa', image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&q=80', available: true },
    { id: 'st5', name: 'Veg Garlic Bread', price: 269, category: 'Starters & Appetizers', description: 'Toasted garlic bread with herbs and butter', image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=800&q=80', available: true },
    { id: 'st6', name: 'Chicken Poppers', price: 289, category: 'Starters & Appetizers', description: 'Crispy bite-sized chicken poppers', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80', available: true },
    { id: 'st7', name: 'Chicken Satay', price: 309, category: 'Starters & Appetizers', description: 'Grilled chicken skewers with peanut sauce', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', available: true },
    { id: 'st8', name: 'Wings (BBQ)', price: 309, category: 'Starters & Appetizers', description: 'Smoky BBQ glazed chicken wings', image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80', available: true },
    { id: 'st9', name: 'Wings (Crispy)', price: 319, category: 'Starters & Appetizers', description: 'Extra crispy fried chicken wings', image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80', available: true },
    { id: 'st10', name: 'Wings (Hot & Spicy)', price: 319, category: 'Starters & Appetizers', description: 'Fiery hot and spicy chicken wings', image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80', available: true },
    { id: 'st11', name: 'Wings (Black Pepper)', price: 329, category: 'Starters & Appetizers', description: 'Bold black pepper seasoned wings', image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80', available: true },
    { id: 'st12', name: 'Dragon Egg', price: 199, category: 'Starters & Appetizers', description: 'Spiced and deep-fried stuffed eggs', image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80', available: true },
    { id: 'st13', name: 'Cigar Rolls (Cheese)', price: 299, category: 'Starters & Appetizers', description: 'Crispy cheese-filled cigar rolls', image: 'https://images.unsplash.com/photo-1628196144889-f53eb3c4d7e3?w=800&q=80', available: true },
    { id: 'st14', name: 'Cigar Rolls (Cuban)', price: 299, category: 'Starters & Appetizers', description: 'Cuban-style stuffed cigar rolls', image: 'https://images.unsplash.com/photo-1628196144889-f53eb3c4d7e3?w=800&q=80', available: true },
    { id: 'st15', name: 'Paneer Italian', price: 309, category: 'Starters & Appetizers', description: 'Paneer cubes in Italian herbs and spices', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80', available: true },
    { id: 'st16', name: 'Paneer Hongkong', price: 329, category: 'Starters & Appetizers', description: 'Crispy paneer tossed in Hongkong-style sauce', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80', available: true },
    { id: 'st17', name: 'Paneer Thai', price: 349, category: 'Starters & Appetizers', description: 'Paneer with Thai basil and chili glaze', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80', available: true },
    { id: 'st18', name: 'Paneer Mexican', price: 369, category: 'Starters & Appetizers', description: 'Spicy Mexican-style paneer with jalapeños', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80', available: true },
    { id: 'st19', name: 'Paneer Singapore', price: 399, category: 'Starters & Appetizers', description: 'Singapore-style paneer with bold flavors', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80', available: true },
    { id: 'st20', name: 'Chicken Mexican', price: 369, category: 'Starters & Appetizers', description: 'Spicy Mexican-style chicken bites', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80', available: true },
    { id: 'st21', name: 'Chicken Thai', price: 379, category: 'Starters & Appetizers', description: 'Thai basil chicken with chili', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80', available: true },
    { id: 'st22', name: 'Chicken Italian', price: 389, category: 'Starters & Appetizers', description: 'Herb-crusted Italian-style chicken', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80', available: true },
    { id: 'st23', name: 'Chicken Korean', price: 399, category: 'Starters & Appetizers', description: 'Korean fried chicken with gochujang glaze', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80', available: true },
    { id: 'st24', name: 'Burnt Garlic Basil Fish', price: 389, category: 'Starters & Appetizers', description: 'Pan-seared fish with burnt garlic and basil', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80', available: true },
    { id: 'st25', name: 'Thai Prawn', price: 419, category: 'Starters & Appetizers', description: 'Succulent prawns in Thai chili sauce', image: 'https://images.unsplash.com/photo-1559742811-822873691fc8?w=800&q=80', available: true },

    // ── Pizza & Pasta ──
    { id: 'pp1', name: 'Classic Italian Pizza', price: 429, category: 'Pizza & Pasta', description: 'Traditional Italian pizza with mozzarella and herbs', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', available: true },
    { id: 'pp2', name: 'Fungi Pizza', price: 429, category: 'Pizza & Pasta', description: 'Loaded with assorted mushrooms and cheese', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', available: true },
    { id: 'pp3', name: 'Veggie Burst Pizza', price: 429, category: 'Pizza & Pasta', description: 'Burst of fresh veggies on a cheesy base', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', available: true },
    { id: 'pp4', name: 'Paneer Tikka Pizza', price: 439, category: 'Pizza & Pasta', description: 'Tandoori paneer tikka on a pizza crust', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', available: true },
    { id: 'pp5', name: 'BBQ Pizza', price: 439, category: 'Pizza & Pasta', description: 'Smoky BBQ sauce with toppings and cheese', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', available: true },
    { id: 'pp6', name: 'Chicken Tikka Pizza', price: 469, category: 'Pizza & Pasta', description: 'Spiced chicken tikka on a cheesy pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', available: true },
    { id: 'pp7', name: 'Chicken 65 Pizza', price: 469, category: 'Pizza & Pasta', description: 'Fiery Chicken 65 topped pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', available: true },
    { id: 'pp8', name: 'Jamaican Jerk Pizza', price: 469, category: 'Pizza & Pasta', description: 'Caribbean jerk chicken on a pizza base', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', available: true },
    { id: 'pp9', name: 'Iron Pie Pizza', price: 489, category: 'Pizza & Pasta', description: 'Deep-dish iron pie style loaded pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', available: true },
    { id: 'pp10', name: 'Jalapeno Chicken Pizza', price: 489, category: 'Pizza & Pasta', description: 'Spicy jalapeño and chicken pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', available: true },
    { id: 'pp11', name: 'Make Your Own Pizza (Veg)', price: 550, category: 'Pizza & Pasta', description: 'Customize your own veg pizza with your favorite toppings', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', available: true },
    { id: 'pp12', name: 'Make Your Own Pizza (Non-Veg)', price: 600, category: 'Pizza & Pasta', description: 'Customize your own non-veg pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', available: true },
    { id: 'pp13', name: 'Alfredo Pasta', price: 369, category: 'Pizza & Pasta', description: 'Creamy Alfredo sauce with perfectly cooked pasta', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80', available: true },
    { id: 'pp14', name: 'Pesto Pasta', price: 369, category: 'Pizza & Pasta', description: 'Fresh basil pesto tossed pasta', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80', available: true },
    { id: 'pp15', name: 'Arrabbiata Pasta', price: 369, category: 'Pizza & Pasta', description: 'Spicy tomato Arrabbiata sauce pasta', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80', available: true },
    { id: 'pp16', name: "The OG Mac 'N' Cheese", price: 349, category: 'Pizza & Pasta', description: 'Classic creamy macaroni and cheese', image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80', available: true },
    { id: 'pp17', name: 'Meat Ball & Sphagetti', price: 429, category: 'Pizza & Pasta', description: 'Spaghetti with hearty meatballs in marinara', image: 'https://images.unsplash.com/photo-1515516969-d4008cc6241a?w=800&q=80', available: true },
    { id: 'pp18', name: 'Chicken Alfredo Pasta', price: 399, category: 'Pizza & Pasta', description: 'Creamy Alfredo pasta with grilled chicken', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80', available: true },
    { id: 'pp19', name: 'Chicken Pesto Pasta', price: 399, category: 'Pizza & Pasta', description: 'Basil pesto pasta with chicken strips', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80', available: true },

    // ── Burgers, Sandwiches & Wraps ──
    { id: 'bw1', name: 'Paneer Tikka Burger', price: 299, category: 'Burgers & Wraps', description: 'Spiced paneer tikka patty in a toasted bun', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', available: true },
    { id: 'bw2', name: 'Veggie Burger', price: 299, category: 'Burgers & Wraps', description: 'Loaded veggie patty burger with fresh toppings', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', available: true },
    { id: 'bw3', name: 'Chicken 65 Burger', price: 329, category: 'Burgers & Wraps', description: 'Fiery Chicken 65 burger with spicy sauce', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', available: true },
    { id: 'bw4', name: 'Double Layered Mac Burger', price: 329, category: 'Burgers & Wraps', description: 'Double-stacked burger with mac and cheese', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', available: true },
    { id: 'bw5', name: 'Club Sandwich', price: 219, category: 'Burgers & Wraps', description: 'Triple-layered club sandwich with fresh fillings', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80', available: true },
    { id: 'bw6', name: 'Spinach Corn Cheese Sandwich', price: 269, category: 'Burgers & Wraps', description: 'Grilled sandwich with spinach, corn, and cheese', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80', available: true },
    { id: 'bw7', name: 'Chicken Tikka Sandwich', price: 289, category: 'Burgers & Wraps', description: 'Chicken tikka stuffed grilled sandwich', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80', available: true },
    { id: 'bw8', name: 'Crispy Potato Wrap', price: 249, category: 'Burgers & Wraps', description: 'Crispy potato fingers wrapped in a tortilla', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80', available: true },
    { id: 'bw9', name: 'Paneer Loaded Wrap', price: 269, category: 'Burgers & Wraps', description: 'Loaded paneer wrap with veggies and sauce', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80', available: true },
    { id: 'bw10', name: 'BBQ Chicken Wrap', price: 279, category: 'Burgers & Wraps', description: 'Smoky BBQ chicken in a flour tortilla wrap', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80', available: true },

    // ── Pan Asian & Rice Bowls ──
    { id: 'pa1', name: 'Veg Hakka Noodles', price: 279, category: 'Pan Asian & Rice Bowls', description: 'Stir-fried Hakka noodles with fresh vegetables', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80', available: true },
    { id: 'pa2', name: 'Eggieee Soft Noodles', price: 299, category: 'Pan Asian & Rice Bowls', description: 'Soft egg noodles tossed with veggies', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80', available: true },
    { id: 'pa3', name: 'Chicken Singapore Noodles', price: 389, category: 'Pan Asian & Rice Bowls', description: 'Spicy Singapore-style noodles with chicken', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80', available: true },
    { id: 'pa4', name: 'Thai Green/Red Veg Rice Bowl', price: 409, category: 'Pan Asian & Rice Bowls', description: 'Fragrant Thai curry rice bowl with vegetables', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80', available: true },
    { id: 'pa5', name: 'Italian Chicken Rice Bowl', price: 429, category: 'Pan Asian & Rice Bowls', description: 'Italian herb chicken served over steamed rice', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80', available: true },
    { id: 'pa6', name: 'Italian Prawn Rice Bowl', price: 479, category: 'Pan Asian & Rice Bowls', description: 'Italian-style prawns on a bed of seasoned rice', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80', available: true },

    // ── Beverages ──
    { id: 'bv1', name: 'Espresso', price: 89, category: 'Beverages', description: 'Rich and bold double-shot espresso', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&q=80', available: true },
    { id: 'bv2', name: 'Americano', price: 129, category: 'Beverages', description: 'Espresso diluted with hot water', image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=800&q=80', available: true },
    { id: 'bv3', name: 'Cortado', price: 129, category: 'Beverages', description: 'Espresso balanced with warm milk', image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=800&q=80', available: true },
    { id: 'bv4', name: 'Long Black', price: 129, category: 'Beverages', description: 'Double espresso over hot water for a smooth finish', image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=800&q=80', available: true },
    { id: 'bv5', name: 'Cappuccino', price: 129, category: 'Beverages', description: 'Classic cappuccino with frothy milk', image: 'https://images.unsplash.com/photo-1572442388796-11668a67ef51?w=800&q=80', available: true },
    { id: 'bv6', name: 'Cappuccino (Flavoured)', price: 179, category: 'Beverages', description: 'Hazelnut, Caramel, or Vanilla cappuccino', image: 'https://images.unsplash.com/photo-1572442388796-11668a67ef51?w=800&q=80', available: true },
    { id: 'bv7', name: 'Latte', price: 139, category: 'Beverages', description: 'Smooth espresso with steamed milk', image: 'https://images.unsplash.com/photo-1572442388796-11668a67ef51?w=800&q=80', available: true },
    { id: 'bv8', name: 'Latte (Flavoured)', price: 189, category: 'Beverages', description: 'Hazelnut, Caramel, or Salted latte', image: 'https://images.unsplash.com/photo-1572442388796-11668a67ef51?w=800&q=80', available: true },

    // ── Desserts ──
    { id: 'ds1', name: 'Single Scoop Ice Cream', price: 79, category: 'Desserts', description: 'One scoop of your favorite ice cream flavor', image: 'https://images.unsplash.com/photo-1557142046-c704a3adf8fb?w=800&q=80', available: true },
    { id: 'ds2', name: 'Double Scoop Ice Cream', price: 149, category: 'Desserts', description: 'Two scoops of ice cream, mix and match flavors', image: 'https://images.unsplash.com/photo-1557142046-c704a3adf8fb?w=800&q=80', available: true },
    { id: 'ds3', name: 'Passion Delight (Small)', price: 145, category: 'Desserts', description: 'Passion fruit dessert – small portion', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80', available: true },
    { id: 'ds4', name: 'Passion Delight (Large)', price: 200, category: 'Desserts', description: 'Passion fruit dessert – large portion', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80', available: true },
    { id: 'ds5', name: 'Just Brownie', price: 150, category: 'Desserts', description: 'Rich and fudgy chocolate brownie', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80', available: true },
    { id: 'ds6', name: 'Brownie With Ice Cream', price: 279, category: 'Desserts', description: 'Warm chocolate brownie topped with ice cream', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80', available: true },
  ];

  const DEFAULT_ADMIN = { username: 'websnape@admin.com', password: 'PNM@2026' };
  const DEFAULT_TABLE_COUNT = 10;

  // ── Version for cache-busting when menu/creds change ──
  const DATA_VERSION = 'v3';

  // ── Init ──
  function init() {
    // Force refresh if data version changed (e.g., menu or creds updated in code)
    if (localStorage.getItem('sos_data_version') !== DATA_VERSION) {
      localStorage.setItem(KEYS.MENU, JSON.stringify(DEFAULT_MENU));
      localStorage.setItem(KEYS.ADMIN, JSON.stringify(DEFAULT_ADMIN));
      localStorage.setItem('sos_data_version', DATA_VERSION);
    }
    if (!localStorage.getItem(KEYS.MENU)) {
      localStorage.setItem(KEYS.MENU, JSON.stringify(DEFAULT_MENU));
    }
    if (!localStorage.getItem(KEYS.ORDERS)) {
      localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.ADMIN)) {
      localStorage.setItem(KEYS.ADMIN, JSON.stringify(DEFAULT_ADMIN));
    }
    if (!localStorage.getItem(KEYS.TABLE_COUNT)) {
      localStorage.setItem(KEYS.TABLE_COUNT, JSON.stringify(DEFAULT_TABLE_COUNT));
    }
  }

  // ── Menu ──
  function getMenu() {
    return JSON.parse(localStorage.getItem(KEYS.MENU)) || [];
  }

  function getMenuByCategory() {
    const items = getMenu().filter(i => i.available);
    const cats = {};
    items.forEach(item => {
      if (!cats[item.category]) cats[item.category] = [];
      cats[item.category].push(item);
    });
    return cats;
  }

  function getMenuItem(id) {
    return getMenu().find(i => i.id === id);
  }

  function saveMenu(items) {
    localStorage.setItem(KEYS.MENU, JSON.stringify(items));
  }

  function addMenuItem(item) {
    const items = getMenu();
    item.id = 'item_' + Date.now();
    items.push(item);
    saveMenu(items);
    return item;
  }

  function updateMenuItem(id, updates) {
    const items = getMenu();
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      saveMenu(items);
    }
  }

  function deleteMenuItem(id) {
    const items = getMenu().filter(i => i.id !== id);
    saveMenu(items);
  }

  // ── Orders ──
  function getOrders() {
    return JSON.parse(localStorage.getItem(KEYS.ORDERS)) || [];
  }

  function getOrdersByTable(tableNum) {
    return getOrders().filter(o => o.tableNumber === tableNum);
  }

  function getActiveOrders() {
    return getOrders().filter(o => o.status !== 'served' && o.status !== 'cancelled');
  }

  function placeOrder(tableNumber, items, notes = '') {
    const orders = getOrders();
    const order = {
      id: 'ORD_' + Date.now(),
      tableNumber: parseInt(tableNumber),
      items: items,
      notes: notes,
      total: items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.push(order);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    return order;
  }

  function updateOrderStatus(orderId, status) {
    const orders = getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = status;
      orders[idx].updatedAt = new Date().toISOString();
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    }
  }

  function clearServedOrders() {
    const orders = getOrders().filter(o => o.status !== 'served' && o.status !== 'cancelled');
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  }

  // ── Admin Auth ──
  function getAdminCreds() {
    return JSON.parse(localStorage.getItem(KEYS.ADMIN));
  }

  function validateAdmin(username, password) {
    const creds = getAdminCreds();
    return creds.username === username && creds.password === password;
  }

  function updateAdminCreds(username, password) {
    localStorage.setItem(KEYS.ADMIN, JSON.stringify({ username, password }));
  }

  function isAdminLoggedIn() {
    return sessionStorage.getItem('sos_admin_session') === 'true';
  }

  function loginAdmin() {
    sessionStorage.setItem('sos_admin_session', 'true');
  }

  function logoutAdmin() {
    sessionStorage.removeItem('sos_admin_session');
  }

  // ── Tables ──
  function getTableCount() {
    return JSON.parse(localStorage.getItem(KEYS.TABLE_COUNT)) || DEFAULT_TABLE_COUNT;
  }

  function setTableCount(count) {
    localStorage.setItem(KEYS.TABLE_COUNT, JSON.stringify(count));
  }

  return {
    init,
    getMenu, getMenuByCategory, getMenuItem, saveMenu, addMenuItem, updateMenuItem, deleteMenuItem,
    getOrders, getOrdersByTable, getActiveOrders, placeOrder, updateOrderStatus, clearServedOrders,
    validateAdmin, updateAdminCreds, isAdminLoggedIn, loginAdmin, logoutAdmin,
    getTableCount, setTableCount,
  };
})();

DataStore.init();
