# RentMate Security Specification & Dirty Dozen Test Matrix

## 1. Data Invariants
1. **Profile Ownership & PII Isolation**: A document under `/users/{userId}` can only be read, created, or updated by the authenticated user whose `request.auth.uid == userId`. No user can list `/users`.
2. **Booking Ownership**: Every document in `/bookings/{bookingId}` MUST have `userId == request.auth.uid` on creation, and `userId` is immutable. `list` queries MUST enforce `resource.data.userId == request.auth.uid`.
3. **Booking Terminal State Locking**: Once a booking reaches `'Cancelled'` or `'Return Requested'`, subsequent client updates are denied.
4. **Enquiry Ownership**: Every document in `/enquiries/{enquiryId}` MUST belong to `request.auth.uid`, and cannot be modified or deleted after creation.
5. **Temporal Integrity**: `createdAt` must equal `request.time` on create and remain immutable on update. `updatedAt` must equal `request.time` on create and update.

## 2. Dirty Dozen Adversarial Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated read of `/users/user123`.
2. Authenticated user A reading `/users/userB` (PII leak attempt).
3. User A creating `/users/userA` with `uid: "userB"` (Identity spoofing).
4. User A updating `/users/userA` with an unexpected shadow field `{ isAdmin: true }`.
5. User A creating `/users/userA` with `accommodationType: "Penthouse"` (Invalid enum).
6. User A creating `/users/userA` with a 1500-char `deliveryAddress` (Resource exhaustion).
7. User A listing `/users` collection.
8. User A creating a booking with `userId: "userB"` (Booking spoofing).
9. User A listing `/bookings` without `where('userId', '==', userA)` or querying userB's bookings.
10. User A creating a booking with `status: "Active Rental"` (State shortcutting — must start as `"Confirmed"`).
11. User A updating a `"Cancelled"` booking back to `"Confirmed"` (Terminal state bypass).
12. User A creating a booking with forged `createdAt` in the past or future instead of `request.time`.
