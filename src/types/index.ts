export interface IUser {
  _id?: string;
  name: string | null;
  role: "admin" | "user";
  email: string | null;
  emailVerified: boolean;
  password: string | null;
  referralCode: string | null;
  referredBy: string | null;
  walletType: "temporary" | "own";
  balance: string;
  walletAddress: string | null;
  walletPrivateKey: string | null;
  isCryptoUser: boolean;
  stripeCustomerId: string | null;
  kycStatus: "pending" | "verified" | "rejected";
  signedOption: "google" | "email";
  otp: {
    code: string | null;
    expiresAt: string | null;
  };
  createdAt?: string;
  updatedAt?: string;
}
