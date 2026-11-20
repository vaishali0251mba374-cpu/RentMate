export type AccommodationType = 'Hostel' | 'PG' | 'Rented Room';

export type MainCategory = 'Furniture' | 'Home Appliances';

export type SubCategory =
  | 'Study Tables'
  | 'Study Chairs'
  | 'Beds'
  | 'Mattresses'
  | 'Wardrobes'
  | 'Storage Units'
  | 'Coolers'
  | 'Fans'
  | 'Refrigerators'
  | 'Washing Machines'
  | 'Induction Cooktops';

export type TenureMonths = 1 | 3 | 6 | 12;

export type PaymentMethod = 'UPI / QR' | 'Cash on Delivery' | 'Campus Pay Later';

export type BookingStatus =
  | 'Confirmed'
  | 'Scheduled'
  | 'Active Rental'
  | 'Return Requested'
  | 'Cancelled';

export type AppPage =
  | 'home'
  | 'catalogue'
  | 'product'
  | 'rentals'
  | 'profile'
  | 'auth';

export interface Product {
  id: string;
  name: string;
  category: MainCategory;
  subCategory: SubCategory;
  monthlyRent: number;
  securityDeposit: number;
  retailPrice: number;
  imageUrl: string;
  imageFocus?: 'left' | 'center' | 'right';
  shortDescription: string;
  fullDescription: string;
  dimensions: string;
  materialOrSpec: string;
  bestFor: AccommodationType[];
  supplierName: string;
  deliveryEstimate: string;
  inStock: boolean;
  featured?: boolean;
  highlights: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  tenureMonths: TenureMonths;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  mobile: string;
  college: string;
  accommodationType: AccommodationType;
  deliveryAddress: string;
  city: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RentalBooking {
  id: string;
  userId: string;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  college: string;
  accommodationType: AccommodationType;
  deliveryAddress: string;
  city: string;
  itemsSummary: string;
  itemCount: number;
  tenureMonths: TenureMonths;
  monthlyRent: number;
  securityDeposit: number;
  deliveryFee: number;
  totalPayableNow: number;
  paymentMethod: PaymentMethod;
  deliverySlot: string;
  status: BookingStatus;
  createdAtLabel: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SupportEnquiry {
  id: string;
  userId: string;
  name: string;
  email: string;
  college: string;
  topic: string;
  message: string;
  createdAtLabel: string;
}
