declare namespace Express {
  interface Request {
    authUser?: {
      userId: string;
      walletId: string;
      publicKey: string;
    };
  }
}
