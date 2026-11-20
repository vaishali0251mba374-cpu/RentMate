import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  doc,
  getDocFromServer,
  getFirestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AccommodationType } from '../types';

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();

// Blueprint-synchronized validation boundaries (verbatim aligned with firebase-blueprint.json)
export const BLUEPRINT_LIMITS = {
  fullName: { min: 2, max: 100 },
  email: { min: 5, max: 150 },
  mobile: { min: 10, max: 15, pattern: /^[0-9+\-\s]{10,15}$/ },
  college: { min: 2, max: 120 },
  deliveryAddress: { min: 5, max: 300 },
  city: { min: 2, max: 80 },
  topic: { min: 2, max: 100 },
  message: { min: 5, max: 1000 },
  accommodationTypes: ['Hostel', 'PG', 'Rented Room'] as AccommodationType[],
} as const;

export function validateProfileFields(input: {
  fullName: string;
  email: string;
  mobile: string;
  college: string;
  accommodationType: string;
  deliveryAddress: string;
  city: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  const fullName = input.fullName.trim();
  if (fullName.length < BLUEPRINT_LIMITS.fullName.min || fullName.length > BLUEPRINT_LIMITS.fullName.max) {
    errors.fullName = 'Full name must be between 2 and 100 characters.';
  }

  const email = input.email.trim();
  if (
    email.length < BLUEPRINT_LIMITS.email.min ||
    email.length > BLUEPRINT_LIMITS.email.max ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = 'Enter a valid email address.';
  }

  const mobile = input.mobile.trim();
  if (!BLUEPRINT_LIMITS.mobile.pattern.test(mobile)) {
    errors.mobile = 'Enter a valid 10-digit mobile number (digits, +, - allowed).';
  }

  const college = input.college.trim();
  if (college.length < BLUEPRINT_LIMITS.college.min || college.length > BLUEPRINT_LIMITS.college.max) {
    errors.college = 'Please enter or select your college/university.';
  }

  if (!BLUEPRINT_LIMITS.accommodationTypes.includes(input.accommodationType as AccommodationType)) {
    errors.accommodationType = 'Select Hostel, PG, or Rented Room.';
  }

  const deliveryAddress = input.deliveryAddress.trim();
  if (
    deliveryAddress.length < BLUEPRINT_LIMITS.deliveryAddress.min ||
    deliveryAddress.length > BLUEPRINT_LIMITS.deliveryAddress.max
  ) {
    errors.deliveryAddress = 'Delivery address must be between 5 and 300 characters.';
  }

  const city = input.city.trim();
  if (city.length < BLUEPRINT_LIMITS.city.min || city.length > BLUEPRINT_LIMITS.city.max) {
    errors.city = 'City must be between 2 and 80 characters.';
  }

  return errors;
}
