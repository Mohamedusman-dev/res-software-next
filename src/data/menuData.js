export const MENU_CATEGORIES = [
  { id: 'all', label: 'All', icon: 'grid', name: 'All' },
  { id: 'starters', label: 'Starters', icon: 'starter', name: 'Starters' },
  { id: 'main', label: 'Main Course', icon: 'main', name: 'Main Course' },
  { id: 'beverages', label: 'Beverages', icon: 'beverage', name: 'Beverages' },
  { id: 'desserts', label: 'Desserts', icon: 'dessert', name: 'Desserts' },
];

export const CATEGORIES = [
  { id: 'all', name: 'All Items', icon: '🍽️' },
  { id: 'starters', name: 'Starters', icon: '🍟' },
  { id: 'main', name: 'Main Course', icon: '🍛' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' },
  { id: 'desserts', name: 'Desserts', icon: '🍨' },
];

// ImageKit URLs for food images
const FOOD_IMAGES = {
  biryani: 'https://ik.imagekit.io/aq2gvjkip/food/biryani.jpg?updatedAt=1791301143995',
  chickenRice: 'https://ik.imagekit.io/aq2gvjkip/food/chicken-rice.jpg?updatedAt=1791301143938',
  chickenPizza: 'https://ik.imagekit.io/aq2gvjkip/food/chicken-pizza.jpg?updatedAt=1791301144065',
  paneerPizza: 'https://ik.imagekit.io/aq2gvjkip/food/paneer-pizza.jpg?updatedAt=1791301144057',
  noodles: 'https://ik.imagekit.io/aq2gvjkip/food/noodles.jpg?updatedAt=1791301143901',
  burger: 'https://ik.imagekit.io/aq2gvjkip/food/burger.jpg?updatedAt=1791301143618',
  fries: 'https://ik.imagekit.io/aq2gvjkip/food/fries.jpg?updatedAt=1791301143687',
  dosa: 'https://ik.imagekit.io/aq2gvjkip/food/dosa.jpg?updatedAt=1791301143871',
  idli: 'https://ik.imagekit.io/aq2gvjkip/food/idli.jpg?updatedAt=1791301143591',
  coffee: 'https://ik.imagekit.io/aq2gvjkip/food/coffee.jpg?updatedAt=1791301143942',
  lime: 'https://ik.imagekit.io/aq2gvjkip/food/lime.jpg?updatedAt=1791301143916',
  coke: 'https://ik.imagekit.io/aq2gvjkip/food/coke.jpg?updatedAt=1791301143922',
  promoDish: 'https://ik.imagekit.io/aq2gvjkip/food/promo-dish.jpg?updatedAt=1791301143726',
  loginFeast: 'https://ik.imagekit.io/aq2gvjkip/food/login-feast.jpg?updatedAt=1791301144596',
};

export const INITIAL_MENU_ITEMS = [
  {
    id: 1,
    name: 'Chicken Biryani',
    price: 250,
    category: 'main',
    image: FOOD_IMAGES.biryani,
    code: 'CB01',
    hasStar: true,
    isAvailable: true,
  },
  {
    id: 2,
    name: 'Veg Fried Rice',
    price: 180,
    category: 'main',
    image: FOOD_IMAGES.chickenRice,
    code: 'VFR02',
    hasStar: false,
    isAvailable: true,
  },
  {
    id: 3,
    name: 'Hakka Noodles',
    price: 160,
    category: 'main',
    image: FOOD_IMAGES.noodles,
    code: 'HN03',
    hasStar: true,
    isAvailable: true,
  },
  {
    id: 4,
    name: 'Chicken Rice',
    price: 220,
    category: 'main',
    image: FOOD_IMAGES.chickenRice,
    code: 'CR04',
    hasStar: false,
    isAvailable: true,
  },
  {
    id: 5,
    name: 'Veg Burger',
    price: 120,
    category: 'starters',
    image: FOOD_IMAGES.burger,
    code: 'VB05',
    hasStar: false,
    isAvailable: true,
  },
  {
    id: 6,
    name: 'French Fries',
    price: 100,
    category: 'starters',
    image: FOOD_IMAGES.fries,
    code: 'FF06',
    hasStar: false,
    isAvailable: true,
  },
  {
    id: 7,
    name: 'Chicken Pizza',
    price: 280,
    category: 'main',
    image: FOOD_IMAGES.chickenPizza,
    code: 'CP07',
    hasStar: false,
    isAvailable: true,
  },
  {
    id: 8,
    name: 'Paneer Pizza',
    price: 250,
    category: 'main',
    image: FOOD_IMAGES.paneerPizza,
    code: 'PP08',
    hasStar: false,
    isAvailable: true,
  },
  {
    id: 9,
    name: 'Masala Dosa',
    price: 100,
    category: 'starters',
    image: FOOD_IMAGES.dosa,
    code: 'MD09',
    hasStar: false,
    isAvailable: true,
  },
  {
    id: 10,
    name: 'Idli Sambar',
    price: 60,
    category: 'starters',
    image: FOOD_IMAGES.idli,
    code: 'IS10',
    hasStar: false,
    isAvailable: true,
  },
  {
    id: 11,
    name: 'Cold Coffee',
    price: 100,
    category: 'beverages',
    image: FOOD_IMAGES.coffee,
    code: 'CC11',
    hasStar: false,
    isAvailable: true,
  },
  {
    id: 12,
    name: 'Fresh Lime',
    price: 50,
    category: 'beverages',
    image: FOOD_IMAGES.lime,
    code: 'FL12',
    hasStar: false,
    isAvailable: true,
  },
  {
    id: 13,
    name: 'Coke',
    price: 40,
    category: 'beverages',
    image: FOOD_IMAGES.coke,
    code: 'CK13',
    hasStar: false,
    isAvailable: true,
  }
];

export const INITIAL_ORDER = [
  {
    id: 1,
    name: 'Chicken Biryani',
    price: 250,
    quantity: 1,
    image: FOOD_IMAGES.biryani,
  },
  {
    id: 2,
    name: 'Veg Fried Rice',
    price: 180,
    quantity: 1,
    image: FOOD_IMAGES.chickenRice,
  },
  {
    id: 13,
    name: 'Coke',
    price: 40,
    quantity: 1,
    image: FOOD_IMAGES.coke,
  },
  {
    id: 6,
    name: 'French Fries',
    price: 100,
    quantity: 1,
    image: FOOD_IMAGES.fries,
  },
];

export const TABLES = [
  { id: 'A1', name: 'Table A1', guests: 4, status: 'Occupied' },
  { id: 'A2', name: 'Table A2', guests: 2, status: 'Available' },
  { id: 'A3', name: 'Table A3', guests: 6, status: 'Reserved' },
  { id: 'B1', name: 'Table B1', guests: 4, status: 'Available' },
  { id: 'B2', name: 'Table B2', guests: 2, status: 'Occupied' },
  { id: 'VIP1', name: 'VIP Suite 1', guests: 8, status: 'Available' },
];

// Dummy users for login/switch functionality
export const DUMMY_USERS = [
  {
    id: 'cashier_priya',
    name: 'Priya (Cashier)',
    role: 'cashier',
    roleLabel: 'Billing Cashier',
    pin: '1234',
    avatar: '/food/avatar.jpg',
    color: '#5025d1',
    badgeBg: '#f5f3ff',
    defaultTab: 'cashier'
  },
  {
    id: 'waiter_raju',
    name: 'Raju (Waiter 1)',
    role: 'waiter',
    roleLabel: 'Table Captain / Waiter',
    pin: '1234',
    avatar: '/food/avatar.jpg',
    color: '#059669',
    badgeBg: '#ecfdf5',
    defaultTab: 'waiter'
  },
  {
    id: 'waiter_karthik',
    name: 'Karthik (Waiter 2)',
    role: 'waiter',
    roleLabel: 'Floor Waiter',
    pin: '1234',
    avatar: '/food/avatar.jpg',
    color: '#0d9488',
    badgeBg: '#f0fdfa',
    defaultTab: 'waiter'
  },
  {
    id: 'admin_ramesh',
    name: 'Ramesh (Manager)',
    role: 'admin',
    roleLabel: 'Store Admin / Manager',
    pin: '9999',
    avatar: '/food/avatar.jpg',
    color: '#d97706',
    badgeBg: '#fffbeb',
    defaultTab: 'cashier'
  }
];

// Export food images for use in other components
export { FOOD_IMAGES };
