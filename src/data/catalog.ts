import { Product, SubCategory, TenureMonths } from '../types';

export const HERO_IMAGE_URL = '/src/assets/images/hero_student_room_1795195391176.jpg';

const IMG_STUDY_DESK = '/src/assets/images/product_study_desk_1795195390385.jpg';
const IMG_BED_MATTRESS = '/src/assets/images/product_bed_mattress_1795195390834.jpg';
const IMG_COOLER_FAN = '/src/assets/images/product_air_cooler_1795195390654.jpg';
const IMG_FRIDGE_INDUCTION = '/src/assets/images/product_mini_fridge_1795195390130.jpg';
const IMG_WARDROBE_STORAGE = '/src/assets/images/product_wardrobe_storage_1795195390114.jpg';

export const TENURE_OPTIONS: {
  months: TenureMonths;
  label: string;
  shortLabel: string;
  discountPercent: number;
}[] = [
  { months: 1, label: '1 Month (Flexible)', shortLabel: '1 mo', discountPercent: 0 },
  { months: 3, label: '3 Months (Quarter)', shortLabel: '3 mo', discountPercent: 5 },
  { months: 6, label: '6 Months (Semester · Save 10%)', shortLabel: '6 mo', discountPercent: 10 },
  { months: 12, label: '12 Months (Annual · Save 15%)', shortLabel: '12 mo', discountPercent: 15 },
];

export function getDiscountedMonthlyRent(baseRent: number, tenureMonths: TenureMonths): number {
  const option = TENURE_OPTIONS.find((t) => t.months === tenureMonths);
  const discount = option ? option.discountPercent : 0;
  return Math.round(baseRent * (1 - discount / 100));
}

export const FURNITURE_SUBCATEGORIES: SubCategory[] = [
  'Study Tables',
  'Study Chairs',
  'Beds',
  'Mattresses',
  'Wardrobes',
  'Storage Units',
];

export const APPLIANCE_SUBCATEGORIES: SubCategory[] = [
  'Coolers',
  'Fans',
  'Refrigerators',
  'Washing Machines',
  'Induction Cooktops',
];

export const ALL_SUBCATEGORIES: SubCategory[] = [
  ...FURNITURE_SUBCATEGORIES,
  ...APPLIANCE_SUBCATEGORIES,
];

export const DEHRADUN_COLLEGES: string[] = [
  'DBS Global University (DGU)',
  'Graphic Era University',
  'UPES Bidholi / Kandoli',
  'DIT University',
  'Uttaranchal University',
  'IMS Unison University',
  "Tula's Institute",
  'HNBGU / Local Coaching Hub',
  'Other / Working Intern in Dehradun',
];

export const DEHRADUN_DELIVERY_ZONES: string[] = [
  'Prem Nagar & DBS Global University Belt',
  'Clement Town & Graphic Era Road',
  'Rajpur Road & Jakhan',
  'Sahastradhara Road & DIT Belt',
  'Bidholi / Pondha (UPES Corridor)',
  'Ballupur & Chakrata Road',
];

export const RENTMATE_BENEFITS = [
  {
    number: '01',
    title: 'Affordable Rentals',
    description:
      'Start from ₹229/month instead of spending ₹8,000–₹25,000 upfront on items you only need for a semester.',
  },
  {
    number: '02',
    title: 'Flexible Rental Periods',
    description:
      'Choose 1, 3, 6, or 12-month plans aligned with internships, semester breaks, and hostel contracts.',
  },
  {
    number: '03',
    title: 'Convenient Delivery',
    description:
      'Doorstep delivery and room placement within 24–48 hours across Dehradun student neighbourhoods.',
  },
  {
    number: '04',
    title: 'Easy Returns',
    description:
      'Schedule hassle-free pickup when moving out or graduating—no second-hand resale headaches.',
  },
  {
    number: '05',
    title: 'Verified Local Suppliers',
    description:
      'Every product is inspected, deep-sanitized, and backed by trusted local Dehradun vendors.',
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Browse & Compare',
    description:
      'Filter verified furniture and appliances by category, monthly budget, and hostel or PG room fit.',
  },
  {
    step: '02',
    title: 'Pick Your Tenure',
    description:
      'Select a 1, 3, 6, or 12-month plan. Longer semester and annual plans unlock up to 15% monthly savings.',
  },
  {
    step: '03',
    title: 'Doorstep Setup in 48 Hrs',
    description:
      'Our local Dehradun delivery team delivers, assembles, and tests every item right inside your room.',
  },
  {
    step: '04',
    title: 'Return, Swap, or Extend',
    description:
      'Moving cities or ending your semester? Request a pickup in one click and get your refundable deposit back.',
  },
];

export const SAMPLE_TESTIMONIALS = [
  {
    id: 't1',
    name: 'Aarav Nautiyal',
    role: 'MBA Student · DBS Global University',
    accommodation: 'PG near Prem Nagar',
    before: 'Quoted ₹11,500 locally for a new study desk, chair, and cooler for an 8-month stay.',
    outcome: 'Rented the Doon Study Desk + ErgoMesh Chair for ₹628/mo on a 6-month plan with next-day PG delivery.',
  },
  {
    id: 't2',
    name: 'Meera Bisht',
    role: 'B.Tech CSE · Graphic Era University',
    accommodation: 'Rented 1RK in Clement Town',
    before: 'Struggled to transport a bulky mini fridge and induction stove between semester relocations.',
    outcome: 'Booked Aurora 190L Fridge + HeatSmart Induction with zero transport stress and easy summer return.',
  },
  {
    id: 't3',
    name: 'Rohan Kulkarni',
    role: 'Summer Product Intern · Rajpur Road',
    accommodation: 'Shared Flat near Jakhan',
    before: 'Needed a clean single bed and orthopedic mattress for just a 3-month Dehradun internship.',
    outcome: 'Saved over ₹12,000 compared to buying new and completed pickup on his last working day.',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'rm-study-table-01',
    name: 'Doon Compact Walnut Study Desk',
    category: 'Furniture',
    subCategory: 'Study Tables',
    monthlyRent: 399,
    securityDeposit: 600,
    retailPrice: 6800,
    imageUrl: IMG_STUDY_DESK,
    imageFocus: 'right',
    shortDescription: 'Compact walnut-finish study desk with 2 drawers and integrated side bookshelves.',
    fullDescription:
      'Purpose-built for hostel corners and compact PG rooms. Features a scratch-resistant matte walnut top, dual pull-out drawers for stationery, and a 2-tier side shelf for textbooks and laptops.',
    dimensions: '110 × 55 × 75 cm',
    materialOrSpec: '18mm Engineered Wood · Matte Walnut Laminate',
    bestFor: ['Hostel', 'PG', 'Rented Room'],
    supplierName: 'Doon Timber & Furnishing Co.',
    deliveryEstimate: '24–48 hrs in Dehradun',
    inStock: true,
    featured: true,
    highlights: [
      'Fits standard single PG & hostel layouts',
      'Built-in 2-tier textbook storage shelf',
      'Free room assembly on delivery',
    ],
  },
  {
    id: 'rm-study-chair-01',
    name: 'ErgoMesh Student Task Chair',
    category: 'Furniture',
    subCategory: 'Study Chairs',
    monthlyRent: 299,
    securityDeposit: 450,
    retailPrice: 5400,
    imageUrl: IMG_STUDY_DESK,
    imageFocus: 'left',
    shortDescription: 'Breathable black mesh backrest with lumbar support and pneumatic height lift.',
    fullDescription:
      'Designed for long coding nights, exam prep, and remote internships. Breathable high-tension mesh keeps air flowing during Dehradun summers while supporting healthy lower-back posture.',
    dimensions: '60 × 58 × 92–102 cm',
    materialOrSpec: 'Nylon Mesh · Class-3 Gas Lift · 360° Swivel',
    bestFor: ['Hostel', 'PG', 'Rented Room'],
    supplierName: 'Garhwal Seating Works',
    deliveryEstimate: '24 hrs in Dehradun',
    inStock: true,
    featured: true,
    highlights: [
      'Contoured lumbar support for 8+ hr study sessions',
      'Smooth silent castor wheels safe for tiled floors',
      'Sanitized & tension-checked before dispatch',
    ],
  },
  {
    id: 'rm-bed-01',
    name: 'Pinewood Single Hostel Bed (3×6 ft)',
    category: 'Furniture',
    subCategory: 'Beds',
    monthlyRent: 499,
    securityDeposit: 800,
    retailPrice: 9500,
    imageUrl: IMG_BED_MATTRESS,
    imageFocus: 'center',
    shortDescription: 'Solid-grain oak-finish single bed frame with slatted airflow base and under-bed clearance.',
    fullDescription:
      'Sturdy noise-free single bed frame crafted for rented rooms and unfurnished flats. Offers generous 24 cm under-bed space for suitcases and storage bins.',
    dimensions: '190 × 95 × 38 cm (Headboard 82 cm)',
    materialOrSpec: 'Kiln-Dried Pinewood · Slatted Steel-Reinforced Base',
    bestFor: ['PG', 'Rented Room'],
    supplierName: 'Doon Timber & Furnishing Co.',
    deliveryEstimate: '48 hrs in Dehradun',
    inStock: true,
    featured: true,
    highlights: [
      'Tool-free silent joinery assembled by our crew',
      '24 cm under-bed storage clearance for luggage',
      'Supports up to 160 kg static load',
    ],
  },
  {
    id: 'rm-mattress-01',
    name: 'OrthoRest 6-Inch Foam Mattress',
    category: 'Furniture',
    subCategory: 'Mattresses',
    monthlyRent: 299,
    securityDeposit: 500,
    retailPrice: 6200,
    imageUrl: IMG_BED_MATTRESS,
    imageFocus: 'left',
    shortDescription: 'Medium-firm 6-inch high-density foam mattress with fresh quilted washable cover.',
    fullDescription:
      'Rest comfortably through busy semesters. Each mattress ships with a brand-new or hospital-grade steam-sanitized removable cotton-knit zip cover.',
    dimensions: '183 × 91 × 15 cm (Single 3×6 ft)',
    materialOrSpec: 'Dual-Density HR Foam · Quilted Cotton Cover',
    bestFor: ['Hostel', 'PG', 'Rented Room'],
    supplierName: 'Shivalik Sleep Studio',
    deliveryEstimate: '24 hrs in Dehradun',
    inStock: true,
    featured: false,
    highlights: [
      'Includes fresh sealed cotton mattress protector',
      'Zero-sag medium-firm orthopedic support',
      'Ultra-hygienic UV & steam sanitization protocol',
    ],
  },
  {
    id: 'rm-wardrobe-01',
    name: 'Maple Two-Door Compact Wardrobe',
    category: 'Furniture',
    subCategory: 'Wardrobes',
    monthlyRent: 549,
    securityDeposit: 900,
    retailPrice: 11200,
    imageUrl: IMG_WARDROBE_STORAGE,
    imageFocus: 'left',
    shortDescription: 'Slim 2-door laminated maple wardrobe with full hanging rod, shelves, and lockable door.',
    fullDescription:
      'Keep formal blazers, winter jackets, and everyday clothes neatly organized without crowding your PG or shared apartment.',
    dimensions: '80 × 50 × 175 cm',
    materialOrSpec: 'Moisture-Resistant Pre-Laminated Board · Metal Handles',
    bestFor: ['PG', 'Rented Room'],
    supplierName: 'Doon Timber & Furnishing Co.',
    deliveryEstimate: '48 hrs in Dehradun',
    inStock: true,
    featured: true,
    highlights: [
      'Full-width hanging rail + 2 deep bottom shelves',
      'Lockable main door with dual keys included',
      'Slim 50 cm depth fits narrow room alcoves',
    ],
  },
  {
    id: 'rm-storage-01',
    name: 'Modular 4-Tier Book & Utility Rack',
    category: 'Furniture',
    subCategory: 'Storage Units',
    monthlyRent: 249,
    securityDeposit: 400,
    retailPrice: 3900,
    imageUrl: IMG_WARDROBE_STORAGE,
    imageFocus: 'right',
    shortDescription: 'Open 4-shelf maple organizer for textbooks, kitchen essentials, and woven baskets.',
    fullDescription:
      'Lightweight, airy vertical storage unit that maximizes small floor footprints in hostels and 1RK rooms.',
    dimensions: '65 × 32 × 135 cm',
    materialOrSpec: 'Engineered Maple Wood · Anti-Tip Wall Clip',
    bestFor: ['Hostel', 'PG', 'Rented Room'],
    supplierName: 'Garhwal Seating Works',
    deliveryEstimate: '24–48 hrs in Dehradun',
    inStock: true,
    featured: false,
    highlights: [
      '4 spacious shelves holding up to 15 kg each',
      'Doubles as bookshelf or pantry organizer',
      'Easy wipe-clean laminate finish',
    ],
  },
  {
    id: 'rm-cooler-01',
    name: 'AirChill 35L Portable Room Cooler',
    category: 'Home Appliances',
    subCategory: 'Coolers',
    monthlyRent: 499,
    securityDeposit: 800,
    retailPrice: 8200,
    imageUrl: IMG_COOLER_FAN,
    imageFocus: 'left',
    shortDescription: '35-litre honeycomb evaporative cooler with digital panel, timer, and lockable wheels.',
    fullDescription:
      'Beat Dehradun May–June heat affordably. Uses high-efficiency 3-side honeycomb cooling pads and runs smoothly even on standard hostel inverter lines.',
    dimensions: '42 × 36 × 84 cm',
    materialOrSpec: '35L Tank · 140W Motor · Inverter Compatible',
    bestFor: ['Hostel', 'PG', 'Rented Room'],
    supplierName: 'Uttarakhand Appliances Hub',
    deliveryEstimate: '24 hrs in Dehradun',
    inStock: true,
    featured: true,
    highlights: [
      'Fresh honeycomb pads installed before every rental',
      'Low 140W draw works on PG backup power',
      'Ice chamber + 4-way motorized air swing',
    ],
  },
  {
    id: 'rm-fan-01',
    name: 'AeroFlow High-Speed Pedestal Fan',
    category: 'Home Appliances',
    subCategory: 'Fans',
    monthlyRent: 229,
    securityDeposit: 350,
    retailPrice: 3200,
    imageUrl: IMG_COOLER_FAN,
    imageFocus: 'right',
    shortDescription: 'Whisper-quiet 400mm oscillating standing fan with adjustable height and 3 speed modes.',
    fullDescription:
      'Compact footprint with strong directional airflow—ideal for rooms where ceiling fan placement misses your study desk or bed.',
    dimensions: '44 × 40 × 115–135 cm',
    materialOrSpec: '55W Copper Motor · 3-Speed Oscillation',
    bestFor: ['Hostel', 'PG', 'Rented Room'],
    supplierName: 'Uttarakhand Appliances Hub',
    deliveryEstimate: '24 hrs in Dehradun',
    inStock: true,
    featured: false,
    highlights: [
      'Whisper-quiet operation for late-night study',
      'Weighted anti-tip base & height-adjustable pole',
      'Zero maintenance replacement guarantee',
    ],
  },
  {
    id: 'rm-fridge-01',
    name: 'Aurora 190L Compact Refrigerator',
    category: 'Home Appliances',
    subCategory: 'Refrigerators',
    monthlyRent: 699,
    securityDeposit: 1200,
    retailPrice: 14500,
    imageUrl: IMG_FRIDGE_INDUCTION,
    imageFocus: 'left',
    shortDescription: 'Brushed-silver 190L single-door mini fridge with freezer compartment and bottle rack.',
    fullDescription:
      'Keep milk, fruit, meal prep, and cold drinks fresh right in your room or shared flat. Stabilizer-free operation handles local voltage swings cleanly.',
    dimensions: '53 × 58 × 118 cm',
    materialOrSpec: '190L Capacity · 4-Star Energy Rating · Stabilizer-Free',
    bestFor: ['PG', 'Rented Room'],
    supplierName: 'Doon CoolTech Rentals',
    deliveryEstimate: '24–48 hrs in Dehradun',
    inStock: true,
    featured: true,
    highlights: [
      'Fits comfortably beside study desks or kitchenettes',
      'Toughened glass spill-proof shelves',
      'Free maintenance & compressor warranty included',
    ],
  },
  {
    id: 'rm-washer-01',
    name: 'WashEase 6.5kg Semi-Automatic Washer',
    category: 'Home Appliances',
    subCategory: 'Washing Machines',
    monthlyRent: 649,
    securityDeposit: 1100,
    retailPrice: 11900,
    imageUrl: IMG_FRIDGE_INDUCTION,
    imageFocus: 'center',
    shortDescription: 'Compact 6.5kg twin-tub washing machine with rapid 15-minute spin dryer for shared flats.',
    fullDescription:
      'Stop spending ₹1,200/month on per-kg laundry services. Ideal for 2–3 roommates sharing a flat in Clement Town, Prem Nagar, or Rajpur Road.',
    dimensions: '74 × 43 × 86 cm',
    materialOrSpec: '6.5kg Load · Dual Wash & Spin Tubs · Rust-Free Body',
    bestFor: ['Rented Room'],
    supplierName: 'Doon CoolTech Rentals',
    deliveryEstimate: '48 hrs in Dehradun',
    inStock: true,
    featured: false,
    highlights: [
      'Cuts hostel/flat laundry bills by up to 60%',
      'Inlet hose & drain pipe installation included',
      'Low water usage for hillside neighbourhoods',
    ],
  },
  {
    id: 'rm-induction-01',
    name: 'HeatSmart 2000W Glass Induction Cooktop',
    category: 'Home Appliances',
    subCategory: 'Induction Cooktops',
    monthlyRent: 279,
    securityDeposit: 450,
    retailPrice: 3600,
    imageUrl: IMG_FRIDGE_INDUCTION,
    imageFocus: 'right',
    shortDescription: 'Sleek ceramic-glass 2000W induction cooktop with 7 Indian cooking presets & auto shut-off.',
    fullDescription:
      'Safe, flameless cooking approved by most Dehradun PGs and independent hostels. Boils water in under 2 minutes with pan-detection safety cutoff.',
    dimensions: '36 × 29 × 6 cm',
    materialOrSpec: '2000W Crystal Glass · Touch Controls · Auto-Cutoff',
    bestFor: ['Hostel', 'PG', 'Rented Room'],
    supplierName: 'Uttarakhand Appliances Hub',
    deliveryEstimate: '24 hrs in Dehradun',
    inStock: true,
    featured: false,
    highlights: [
      'Flameless & smoke-free for hostel/PG compliance',
      'Digital timer + voltage surge protection',
      'Wipes clean in seconds after late-night Maggi or tea',
    ],
  },
];
