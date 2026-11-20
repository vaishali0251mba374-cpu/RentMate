import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateFirebaseAuthProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
} from '../lib/firebase';
import {
  AccommodationType,
  BookingStatus,
  PaymentMethod,
  RentalBooking,
  SupportEnquiry,
  TenureMonths,
  UserProfile,
} from '../types';

export type AuthSessionMode = 'none' | 'firebase' | 'demo';

export interface SignupPayload {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  college: string;
  accommodationType: AccommodationType;
  deliveryAddress: string;
  city: string;
}

export interface CreateBookingPayload {
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
}

interface AuthContextValue {
  mode: AuthSessionMode;
  firebaseUser: User | null;
  profile: UserProfile | null;
  bookings: RentalBooking[];
  enquiries: SupportEnquiry[];
  authReady: boolean;
  needsProfileCompletion: boolean;
  isEmailUnverified: boolean;
  authNotice: string | null;
  clearAuthNotice: () => void;
  signInWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  signUpWithEmail: (payload: SignupPayload) => Promise<{ ok: boolean; error?: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  resendVerificationEmail: () => Promise<{ ok: boolean; error?: string }>;
  refreshVerification: () => Promise<boolean>;
  enterDemoMode: (customProfile?: Partial<Omit<UserProfile, 'uid'>>) => void;
  saveProfile: (
    data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>,
  ) => Promise<{ ok: boolean; error?: string }>;
  createBooking: (
    payload: CreateBookingPayload,
  ) => Promise<{ ok: boolean; booking?: RentalBooking; error?: string }>;
  updateBookingStatus: (
    bookingId: string,
    status: Extract<BookingStatus, 'Return Requested' | 'Cancelled'>,
  ) => Promise<{ ok: boolean; error?: string }>;
  updateBookingDelivery: (
    bookingId: string,
    deliveryAddress: string,
    deliverySlot: string,
    customerMobile: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  submitEnquiry: (input: {
    name: string;
    email: string;
    college: string;
    topic: string;
    message: string;
  }) => Promise<{ ok: boolean; savedToCloud: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const DEMO_PROFILE_KEY = 'rentmate_demo_profile_v1';
const DEMO_BOOKINGS_KEY = 'rentmate_demo_bookings_v1';
const DEMO_ENQUIRIES_KEY = 'rentmate_demo_enquiries_v1';
const PENDING_PROFILE_KEY = 'rentmate_pending_signup_profile_v1';

const DEFAULT_DEMO_PROFILE: UserProfile = {
  uid: 'demo-student-dgu',
  fullName: 'Ananya Sharma',
  email: 'ananya.demo@dgu.ac.in',
  mobile: '9876543210',
  college: 'DBS Global University (DGU)',
  accommodationType: 'PG',
  deliveryAddress: 'Room 204, Shivalik Girls PG, Prem Nagar',
  city: 'Dehradun',
};

const SEED_DEMO_BOOKINGS: RentalBooking[] = [
  {
    id: 'demo-booking-1018',
    userId: 'demo-student-dgu',
    orderNumber: 'RM-2026-1018',
    customerName: 'Ananya Sharma',
    customerMobile: '9876543210',
    college: 'DBS Global University (DGU)',
    accommodationType: 'PG',
    deliveryAddress: 'Room 204, Shivalik Girls PG, Prem Nagar',
    city: 'Dehradun',
    itemsSummary: 'Doon Compact Walnut Study Desk × 1, ErgoMesh Student Task Chair × 1',
    itemCount: 2,
    tenureMonths: 6,
    monthlyRent: 628,
    securityDeposit: 1050,
    deliveryFee: 0,
    totalPayableNow: 1678,
    paymentMethod: 'UPI / QR',
    deliverySlot: 'Tomorrow · 10:00 AM – 1:00 PM',
    status: 'Active Rental',
    createdAtLabel: '12 Oct 2026',
  },
];

const AuthContext = createContext<AuthContextValue | null>(null);

function formatFirebaseAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before finishing.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups or use Demo Student Mode.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not yet enabled in Firebase Console (Authentication → Sign-in method → Email/Password). Use "Continue with Google" or "Demo Student Mode" right below.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please log in instead.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters (8+ recommended).';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment or try Demo Student Mode.';
    default:
      return err instanceof Error ? err.message : 'Authentication failed. Please try again.';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [mode, setMode] = useState<AuthSessionMode>('none');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [enquiries, setEnquiries] = useState<SupportEnquiry[]>([]);
  const [authReady, setAuthReady] = useState(false);
  const [profileLoadedFromFirestore, setProfileLoadedFromFirestore] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const clearAuthNotice = useCallback(() => setAuthNotice(null), []);

  // Load persisted Demo Mode session on initial boot if no Firebase user is active
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        setMode('firebase');
        localStorage.removeItem(DEMO_PROFILE_KEY);
      } else {
        const storedDemo = localStorage.getItem(DEMO_PROFILE_KEY);
        if (storedDemo) {
          try {
            const parsed = JSON.parse(storedDemo) as UserProfile;
            setProfile(parsed);
            setMode('demo');
            const storedBookings = localStorage.getItem(DEMO_BOOKINGS_KEY);
            setBookings(storedBookings ? (JSON.parse(storedBookings) as RentalBooking[]) : SEED_DEMO_BOOKINGS);
            const storedEnq = localStorage.getItem(DEMO_ENQUIRIES_KEY);
            setEnquiries(storedEnq ? (JSON.parse(storedEnq) as SupportEnquiry[]) : []);
          } catch {
            setMode('none');
            setProfile(null);
            setBookings([]);
          }
        } else {
          setMode('none');
          setProfile(null);
          setBookings([]);
          setEnquiries([]);
        }
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Firestore real-time listeners for verified Firebase users
  useEffect(() => {
    if (mode !== 'firebase' || !firebaseUser) {
      setProfileLoadedFromFirestore(false);
      return;
    }

    if (!firebaseUser.emailVerified) {
      setProfileLoadedFromFirestore(true);
      const pendingRaw = sessionStorage.getItem(PENDING_PROFILE_KEY);
      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw) as Omit<UserProfile, 'uid'>;
          setProfile({ uid: firebaseUser.uid, ...pending });
        } catch {
          // ignore
        }
      }
      return;
    }

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const unsubProfile = onSnapshot(
      userDocRef,
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
          sessionStorage.removeItem(PENDING_PROFILE_KEY);
        } else {
          // If there was a pending profile from email signup, save it now that email is verified
          const pendingRaw = sessionStorage.getItem(PENDING_PROFILE_KEY);
          if (pendingRaw) {
            try {
              const pending = JSON.parse(pendingRaw) as Omit<UserProfile, 'uid'>;
              void setDoc(userDocRef, {
                uid: firebaseUser.uid,
                ...pending,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
              sessionStorage.removeItem(PENDING_PROFILE_KEY);
            } catch {
              setProfile(null);
            }
          } else {
            setProfile(null);
          }
        }
        setProfileLoadedFromFirestore(true);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
      },
    );

    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('userId', '==', firebaseUser.uid),
    );
    const unsubBookings = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const list = snapshot.docs
          .map((d) => {
            const data = d.data();
            const created = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
            return {
              sortTs: created.getTime(),
              item: {
                id: d.id,
                userId: data.userId,
                orderNumber: data.orderNumber,
                customerName: data.customerName,
                customerMobile: data.customerMobile,
                college: data.college,
                accommodationType: data.accommodationType,
                deliveryAddress: data.deliveryAddress,
                city: data.city,
                itemsSummary: data.itemsSummary,
                itemCount: data.itemCount,
                tenureMonths: data.tenureMonths,
                monthlyRent: data.monthlyRent,
                securityDeposit: data.securityDeposit,
                deliveryFee: data.deliveryFee,
                totalPayableNow: data.totalPayableNow,
                paymentMethod: data.paymentMethod,
                deliverySlot: data.deliverySlot,
                status: data.status,
                createdAtLabel: created.toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }),
              } as RentalBooking,
            };
          })
          .sort((a, b) => b.sortTs - a.sortTs)
          .map((entry) => entry.item);
        setBookings(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'bookings');
      },
    );

    const enquiriesQuery = query(
      collection(db, 'enquiries'),
      where('userId', '==', firebaseUser.uid),
    );
    const unsubEnquiries = onSnapshot(
      enquiriesQuery,
      (snapshot) => {
        const list = snapshot.docs
          .map((d) => {
            const data = d.data();
            const created = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
            return {
              sortTs: created.getTime(),
              item: {
                id: d.id,
                userId: data.userId,
                name: data.name,
                email: data.email,
                college: data.college,
                topic: data.topic,
                message: data.message,
                createdAtLabel: created.toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }),
              } as SupportEnquiry,
            };
          })
          .sort((a, b) => b.sortTs - a.sortTs)
          .map((entry) => entry.item);
        setEnquiries(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'enquiries');
      },
    );

    return () => {
      unsubProfile();
      unsubBookings();
      unsubEnquiries();
    };
  }, [mode, firebaseUser]);

  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthNotice(null);
      await signInWithPopup(auth, googleProvider);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: formatFirebaseAuthError(err) };
    }
  }, []);

  const signUpWithEmail = useCallback(async (payload: SignupPayload) => {
    try {
      setAuthNotice(null);
      const cred = await createUserWithEmailAndPassword(auth, payload.email.trim(), payload.password);
      await updateFirebaseAuthProfile(cred.user, { displayName: payload.fullName.trim() });

      const profileBody = {
        fullName: payload.fullName.trim(),
        email: payload.email.trim(),
        mobile: payload.mobile.trim(),
        college: payload.college.trim(),
        accommodationType: payload.accommodationType,
        deliveryAddress: payload.deliveryAddress.trim(),
        city: payload.city.trim(),
      };

      if (cred.user.emailVerified) {
        const path = `users/${cred.user.uid}`;
        try {
          await setDoc(doc(db, 'users', cred.user.uid), {
            uid: cred.user.uid,
            ...profileBody,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      } else {
        sessionStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(profileBody));
        try {
          await sendEmailVerification(cred.user);
        } catch {
          // non-fatal if rate limited
        }
        setAuthNotice(
          'Account created! A verification email was sent to your inbox. Verify your email (or use Google Sign-In / Demo Mode) to sync bookings to cloud.',
        );
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: formatFirebaseAuthError(err) };
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setAuthNotice(null);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: formatFirebaseAuthError(err) };
    }
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    if (!firebaseUser) return { ok: false, error: 'Not signed in.' };
    try {
      await sendEmailVerification(firebaseUser);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: formatFirebaseAuthError(err) };
    }
  }, [firebaseUser]);

  const refreshVerification = useCallback(async () => {
    if (!firebaseUser) return false;
    await reload(firebaseUser);
    if (auth.currentUser?.emailVerified) {
      setFirebaseUser({ ...auth.currentUser } as User);
      return true;
    }
    return false;
  }, [firebaseUser]);

  const enterDemoMode = useCallback((customProfile?: Partial<Omit<UserProfile, 'uid'>>) => {
    setAuthNotice(null);
    const merged: UserProfile = {
      ...DEFAULT_DEMO_PROFILE,
      ...customProfile,
      uid: 'demo-student-dgu',
    };
    localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(merged));
    const existingBookings = localStorage.getItem(DEMO_BOOKINGS_KEY);
    const nextBookings = existingBookings
      ? (JSON.parse(existingBookings) as RentalBooking[])
      : SEED_DEMO_BOOKINGS;
    localStorage.setItem(DEMO_BOOKINGS_KEY, JSON.stringify(nextBookings));
    setProfile(merged);
    setBookings(nextBookings);
    setMode('demo');
  }, []);

  const saveProfile = useCallback(
    async (data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>) => {
      if (mode === 'demo') {
        const updated: UserProfile = {
          uid: 'demo-student-dgu',
          fullName: data.fullName.trim(),
          email: data.email.trim(),
          mobile: data.mobile.trim(),
          college: data.college.trim(),
          accommodationType: data.accommodationType,
          deliveryAddress: data.deliveryAddress.trim(),
          city: data.city.trim(),
        };
        localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(updated));
        setProfile(updated);
        return { ok: true };
      }

      if (mode === 'firebase' && firebaseUser) {
        if (!firebaseUser.emailVerified) {
          return {
            ok: false,
            error: 'Please verify your email address first before saving to cloud Firestore.',
          };
        }
        const path = `users/${firebaseUser.uid}`;
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          if (profile && profileLoadedFromFirestore && profile.createdAt) {
            await updateDoc(userRef, {
              fullName: data.fullName.trim(),
              mobile: data.mobile.trim(),
              college: data.college.trim(),
              accommodationType: data.accommodationType,
              deliveryAddress: data.deliveryAddress.trim(),
              city: data.city.trim(),
              updatedAt: serverTimestamp(),
            });
          } else {
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              fullName: data.fullName.trim(),
              email: (firebaseUser.email || data.email).trim(),
              mobile: data.mobile.trim(),
              college: data.college.trim(),
              accommodationType: data.accommodationType,
              deliveryAddress: data.deliveryAddress.trim(),
              city: data.city.trim(),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          return { ok: true };
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }

      return { ok: false, error: 'Please sign in first.' };
    },
    [mode, firebaseUser, profile, profileLoadedFromFirestore],
  );

  const createBooking = useCallback(
    async (payload: CreateBookingPayload) => {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `RM-2026-${randNum}`;
      const bookingId = `bk_${Date.now()}_${randNum}`;

      if (mode === 'demo') {
        const newBooking: RentalBooking = {
          id: bookingId,
          userId: 'demo-student-dgu',
          orderNumber,
          customerName: payload.customerName.trim().slice(0, 100),
          customerMobile: payload.customerMobile.trim().slice(0, 15),
          college: payload.college.trim().slice(0, 120),
          accommodationType: payload.accommodationType,
          deliveryAddress: payload.deliveryAddress.trim().slice(0, 300),
          city: payload.city.trim().slice(0, 80),
          itemsSummary: payload.itemsSummary.slice(0, 500),
          itemCount: payload.itemCount,
          tenureMonths: payload.tenureMonths,
          monthlyRent: payload.monthlyRent,
          securityDeposit: payload.securityDeposit,
          deliveryFee: payload.deliveryFee,
          totalPayableNow: payload.totalPayableNow,
          paymentMethod: payload.paymentMethod,
          deliverySlot: payload.deliverySlot.slice(0, 80),
          status: 'Confirmed',
          createdAtLabel: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
        };
        const updated = [newBooking, ...bookings];
        localStorage.setItem(DEMO_BOOKINGS_KEY, JSON.stringify(updated));
        setBookings(updated);
        return { ok: true, booking: newBooking };
      }

      if (mode === 'firebase' && firebaseUser) {
        if (!firebaseUser.emailVerified) {
          return {
            ok: false,
            error: 'Please verify your email address or switch to Demo Student Mode to confirm bookings.',
          };
        }
        const path = `bookings/${bookingId}`;
        try {
          await setDoc(doc(db, 'bookings', bookingId), {
            userId: firebaseUser.uid,
            orderNumber,
            customerName: payload.customerName.trim().slice(0, 100),
            customerMobile: payload.customerMobile.trim().slice(0, 15),
            college: payload.college.trim().slice(0, 120),
            accommodationType: payload.accommodationType,
            deliveryAddress: payload.deliveryAddress.trim().slice(0, 300),
            city: payload.city.trim().slice(0, 80),
            itemsSummary: payload.itemsSummary.slice(0, 500),
            itemCount: payload.itemCount,
            tenureMonths: payload.tenureMonths,
            monthlyRent: payload.monthlyRent,
            securityDeposit: payload.securityDeposit,
            deliveryFee: payload.deliveryFee,
            totalPayableNow: payload.totalPayableNow,
            paymentMethod: payload.paymentMethod,
            deliverySlot: payload.deliverySlot.slice(0, 80),
            status: 'Confirmed',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          const createdBooking: RentalBooking = {
            id: bookingId,
            userId: firebaseUser.uid,
            orderNumber,
            ...payload,
            status: 'Confirmed',
            createdAtLabel: new Date().toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
          };
          return { ok: true, booking: createdBooking };
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }

      return { ok: false, error: 'Please sign in or enter Demo Mode to complete booking.' };
    },
    [mode, firebaseUser, bookings],
  );

  const updateBookingStatus = useCallback(
    async (bookingId: string, status: Extract<BookingStatus, 'Return Requested' | 'Cancelled'>) => {
      if (mode === 'demo') {
        const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status } : b));
        localStorage.setItem(DEMO_BOOKINGS_KEY, JSON.stringify(updated));
        setBookings(updated);
        return { ok: true };
      }

      if (mode === 'firebase' && firebaseUser) {
        const path = `bookings/${bookingId}`;
        try {
          await updateDoc(doc(db, 'bookings', bookingId), {
            status,
            updatedAt: serverTimestamp(),
          });
          return { ok: true };
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, path);
        }
      }

      return { ok: false, error: 'Not authenticated.' };
    },
    [mode, firebaseUser, bookings],
  );

  const updateBookingDelivery = useCallback(
    async (
      bookingId: string,
      deliveryAddress: string,
      deliverySlot: string,
      customerMobile: string,
    ) => {
      if (mode === 'demo') {
        const updated = bookings.map((b) =>
          b.id === bookingId
            ? { ...b, deliveryAddress, deliverySlot, customerMobile }
            : b,
        );
        localStorage.setItem(DEMO_BOOKINGS_KEY, JSON.stringify(updated));
        setBookings(updated);
        return { ok: true };
      }

      if (mode === 'firebase' && firebaseUser) {
        const path = `bookings/${bookingId}`;
        try {
          await updateDoc(doc(db, 'bookings', bookingId), {
            deliveryAddress: deliveryAddress.trim().slice(0, 300),
            deliverySlot: deliverySlot.trim().slice(0, 80),
            customerMobile: customerMobile.trim().slice(0, 15),
            updatedAt: serverTimestamp(),
          });
          return { ok: true };
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, path);
        }
      }

      return { ok: false, error: 'Not authenticated.' };
    },
    [mode, firebaseUser, bookings],
  );

  const submitEnquiry = useCallback(
    async (input: {
      name: string;
      email: string;
      college: string;
      topic: string;
      message: string;
    }) => {
      const enquiryId = `enq_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

      if (mode === 'firebase' && firebaseUser && firebaseUser.emailVerified) {
        const path = `enquiries/${enquiryId}`;
        try {
          await setDoc(doc(db, 'enquiries', enquiryId), {
            userId: firebaseUser.uid,
            name: input.name.trim().slice(0, 100),
            email: input.email.trim().slice(0, 150),
            college: input.college.trim().slice(0, 120),
            topic: input.topic.trim().slice(0, 100),
            message: input.message.trim().slice(0, 1000),
            createdAt: serverTimestamp(),
          });
          return { ok: true, savedToCloud: true };
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }

      const localEnquiry: SupportEnquiry = {
        id: enquiryId,
        userId: profile?.uid || 'guest-dehradun-visitor',
        name: input.name.trim().slice(0, 100),
        email: input.email.trim().slice(0, 150),
        college: input.college.trim().slice(0, 120),
        topic: input.topic.trim().slice(0, 100),
        message: input.message.trim().slice(0, 1000),
        createdAtLabel: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      };
      const updated = [localEnquiry, ...enquiries];
      localStorage.setItem(DEMO_ENQUIRIES_KEY, JSON.stringify(updated));
      setEnquiries(updated);
      return { ok: true, savedToCloud: false };
    },
    [mode, firebaseUser, profile, enquiries],
  );

  const logout = useCallback(async () => {
    localStorage.removeItem(DEMO_PROFILE_KEY);
    sessionStorage.removeItem(PENDING_PROFILE_KEY);
    setAuthNotice(null);
    if (firebaseUser) {
      await signOut(auth);
    }
    setMode('none');
    setProfile(null);
    setBookings([]);
    setEnquiries([]);
  }, [firebaseUser]);

  const isEmailUnverified = Boolean(
    mode === 'firebase' && firebaseUser && !firebaseUser.emailVerified,
  );
  const needsProfileCompletion = Boolean(
    mode === 'firebase' &&
      firebaseUser &&
      firebaseUser.emailVerified &&
      profileLoadedFromFirestore &&
      !profile,
  );

  return (
    <AuthContext.Provider
      value={{
        mode,
        firebaseUser,
        profile,
        bookings,
        enquiries,
        authReady,
        needsProfileCompletion,
        isEmailUnverified,
        authNotice,
        clearAuthNotice,
        signInWithGoogle,
        signUpWithEmail,
        loginWithEmail,
        resendVerificationEmail,
        refreshVerification,
        enterDemoMode,
        saveProfile,
        createBooking,
        updateBookingStatus,
        updateBookingDelivery,
        submitEnquiry,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
