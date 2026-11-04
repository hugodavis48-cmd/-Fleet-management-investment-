import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CryptoCurrency,
  ProductItem,
  RentalVehicle,
  ScratchCardTier,
  ServiceBooking,
  TeslaVehicle,
  Transaction,
  User,
  UserInvestment,
  UserRole,
  WalletBalances,
  WinRecord,
  ReferredUser,
} from '../types';
import {
  CRYPTO_NETWORKS,
  INITIAL_VEHICLES,
  INVESTMENT_POOLS,
  MOCK_WINNERS,
  RENTAL_FLEET,
  SCRATCH_CARD_TIERS,
} from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  userRole: UserRole;
  balances: WalletBalances;
  vehicles: TeslaVehicle[];
  serviceBookings: ServiceBooking[];
  userInvestments: UserInvestment[];
  transactions: Transaction[];
  availableSpins: number;
  recentWinners: WinRecord[];
  cart: { product: ProductItem; quantity: number }[];
  bookedRentals: { rentalId: string; vehicle: RentalVehicle; days: number; startDate: string; totalUsd: number }[];
  toastMessage: { text: string; type: 'success' | 'info' | 'error' } | null;
  // Methods
  login: (email: string) => boolean;
  register: (name: string, email: string, phone?: string, referralCodeInput?: string) => boolean;
  logout: () => void;
  setRole: (role: UserRole) => void;
  toggle2FA: () => void;
  updatePin: (newPin: string) => void;
  depositFunds: (currency: CryptoCurrency | 'USD', amount: number) => Promise<Transaction>;
  addVehicle: (vehicle: Omit<TeslaVehicle, 'id' | 'userId'>) => void;
  bookService: (booking: Omit<ServiceBooking, 'id' | 'userId' | 'createdAt' | 'progressPercentage' | 'status'>) => ServiceBooking;
  stakeInPool: (poolId: string, amountUsd: number) => boolean;
  claimDividends: (investmentId: string) => void;
  executeSpin: () => { prize: string; valueUsd: number; type: string };
  purchaseScratchCard: (tier: ScratchCardTier) => boolean;
  awardScratchPrize: (tier: ScratchCardTier, prizeAmountUsd: number, prizeLabel: string) => void;
  rentVehicle: (vehicle: RentalVehicle, days: number, startDate: string) => boolean;
  addToCart: (product: ProductItem) => void;
  removeFromCart: (productId: string) => void;
  checkoutCart: () => boolean;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  // Referral System
  referralLink: string;
  updateReferralCode: (code: string) => boolean;
  simulateFriendReferral: (friendName?: string, depositAmount?: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_USER: User = {
  id: 'usr-apex-001',
  name: 'Alex Vance',
  email: 'alex.vance@apex-tesla.io',
  role: 'customer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  phone: '+1 (555) 837-5290',
  walletAddress: '0x9E218C4FaB06A4dD23c945b9E52aF3eA48972',
  twoFactorEnabled: true,
  pinSet: true,
  pin: '1234',
  memberSince: 'March 2024',
  tier: 'Plaid Member',
  referralCode: 'APEX-ALEX-99',
  referralEarningsUsd: 350.0,
  referralCount: 3,
  referredUsers: [
    {
      id: 'ref-01',
      name: 'Marcus Vance',
      email: 'marcus.v@tesla-club.org',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      date: '2026-10-24',
      status: 'deposit_completed',
      depositAmountUsd: 1200,
      earnedCreditUsd: 120,
      bonusSpinsEarned: 2,
    },
    {
      id: 'ref-02',
      name: 'Sarah Connor',
      email: 'sarah.c@cyberbeast.io',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      date: '2026-10-28',
      status: 'deposit_completed',
      depositAmountUsd: 500,
      earnedCreditUsd: 100,
      bonusSpinsEarned: 2,
    },
    {
      id: 'ref-03',
      name: 'Kenji Sato',
      email: 'kenji.sato@plaid-tokyo.jp',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      date: '2026-11-01',
      status: 'signed_up',
      earnedCreditUsd: 0,
      bonusSpinsEarned: 1,
    },
  ],
};

const DEFAULT_BALANCES: WalletBalances = {
  usd: 3450.0,
  btc: 0.085,
  usdt: 1850.0,
  xrp: 940.0,
  bnb: 4.25,
};

const INITIAL_BOOKINGS: ServiceBooking[] = [
  {
    id: 'srv-001',
    userId: 'usr-apex-001',
    vehicleId: 'veh-1',
    vehicleName: 'Model S Plaid Tri-Motor',
    serviceType: 'Full Body Vinyl Wrap',
    serviceMode: 'Apex Center Bay',
    status: 'Technician Working',
    progressPercentage: 65,
    scheduledDate: '2026-11-05',
    timeSlot: '09:30 AM',
    location: 'Apex Gigafactory Hub (Bay 4)',
    technicianNotes: '3M Satin Stealth Black film undergoing heat seal application. Surface prep & ceramic base layer complete.',
    totalCostUsd: 2450,
    paidWith: 'USDT (TRC-20)',
    createdAt: '2026-11-02',
  },
  {
    id: 'srv-002',
    userId: 'usr-apex-001',
    vehicleId: 'veh-2',
    vehicleName: 'Cybertruck Cyberbeast',
    serviceType: 'Tire & Brake Service',
    serviceMode: 'Mobile Ranger Dispatch',
    status: 'Scheduled',
    progressPercentage: 15,
    scheduledDate: '2026-11-10',
    timeSlot: '02:00 PM',
    location: 'Client Residence - Mobile Van #12',
    technicianNotes: 'Mobile technician dispatched with high-torque all-terrain tire balancer & brake fluid tester.',
    totalCostUsd: 380,
    paidWith: 'Apex USD Wallet',
    createdAt: '2026-11-03',
  },
];

const INITIAL_INVESTMENTS: UserInvestment[] = [
  {
    id: 'inv-01',
    poolId: 'pool-robotaxi',
    poolTitle: 'Autonomous Tesla Robotaxi Yield Pool',
    amountInvestedUsd: 2500,
    investedAt: '2026-10-15',
    earnedDividendsUsd: 142.6,
    apy: 18.4,
    nextPayoutHours: 4,
  },
  {
    id: 'inv-02',
    poolId: 'pool-supercharger',
    poolTitle: 'Apex Megawatt Supercharger Node Staking',
    amountInvestedUsd: 1500,
    investedAt: '2026-10-20',
    earnedDividendsUsd: 68.4,
    apy: 14.8,
    nextPayoutHours: 12,
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    type: 'deposit',
    currency: 'USDT',
    amount: 2500,
    usdEquivalent: 2500,
    timestamp: '2026-11-02 14:22',
    status: 'completed',
    txHash: '0x3fe9b2...84ad1',
    description: 'TRC-20 Instant Gateway Deposit',
  },
  {
    id: 'tx-002',
    type: 'service_payment',
    currency: 'USDT',
    amount: 2450,
    usdEquivalent: 2450,
    timestamp: '2026-11-02 15:05',
    status: 'completed',
    txHash: '0x99e21b...34c7f',
    description: '3M Satin Stealth Wrap Service Booking',
  },
  {
    id: 'tx-003',
    type: 'promotion_win',
    currency: 'USD',
    amount: 500,
    usdEquivalent: 500,
    timestamp: '2026-11-03 11:30',
    status: 'completed',
    txHash: '0x712a88...c1e90',
    description: 'Spin-and-Win Wheel Reward: $500 Credit',
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persistent state from localStorage if available
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('apex_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [balances, setBalances] = useState<WalletBalances>(() => {
    const saved = localStorage.getItem('apex_balances');
    return saved ? JSON.parse(saved) : DEFAULT_BALANCES;
  });

  const [vehicles, setVehicles] = useState<TeslaVehicle[]>(() => {
    const saved = localStorage.getItem('apex_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>(() => {
    const saved = localStorage.getItem('apex_services');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>(() => {
    const saved = localStorage.getItem('apex_investments');
    return saved ? JSON.parse(saved) : INITIAL_INVESTMENTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('apex_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [availableSpins, setAvailableSpins] = useState<number>(() => {
    const saved = localStorage.getItem('apex_spins');
    return saved ? Number(saved) : 3;
  });

  const [recentWinners, setRecentWinners] = useState<WinRecord[]>(MOCK_WINNERS);
  const [cart, setCart] = useState<{ product: ProductItem; quantity: number }[]>([]);
  const [bookedRentals, setBookedRentals] = useState<{ rentalId: string; vehicle: RentalVehicle; days: number; startDate: string; totalUsd: number }[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sync to local storage
  useEffect(() => {
    if (currentUser) localStorage.setItem('apex_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('apex_balances', JSON.stringify(balances));
  }, [balances]);

  useEffect(() => {
    localStorage.setItem('apex_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('apex_services', JSON.stringify(serviceBookings));
  }, [serviceBookings]);

  useEffect(() => {
    localStorage.setItem('apex_investments', JSON.stringify(userInvestments));
  }, [userInvestments]);

  useEffect(() => {
    localStorage.setItem('apex_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('apex_spins', availableSpins.toString());
  }, [availableSpins]);

  // Periodic simulated live winner popups to give dynamic proof of fair platform activity
  useEffect(() => {
    const interval = setInterval(() => {
      const mockNames = ['Alex_Cyber', 'Sarah_M3', 'CryptoFalcon', 'Dave_Plaid', 'Elena_Volt', 'Viktor_X', 'TeslaKing99', 'NakamotoXRP'];
      const prizes = [
        { label: '500 Apex Credits', val: 500, type: 'Wheel Spin' as const },
        { label: '$2,500 Silver Plaid Card', val: 2500, type: 'Scratch & Win' as const },
        { label: '100 USDT Instant', val: 100, type: 'Wheel Spin' as const },
        { label: 'Full Body Ceramic PPF', val: 1800, type: 'Scratch & Win' as const },
        { label: 'Cybertruck 24h Pass', val: 299, type: 'Wheel Spin' as const },
        { label: '$8,000 Grand Prize Card', val: 8000, type: 'Scratch & Win' as const },
      ];
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
      const randomHash = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;

      const newWin: WinRecord = {
        id: `win-${Date.now()}`,
        username: randomName,
        prize: randomPrize.label,
        type: randomPrize.type,
        valueUsd: randomPrize.val,
        timestamp: 'Just now',
        verifiedHash: randomHash,
        avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 50000000)}?auto=format&fit=crop&w=150&q=80`,
      };

      setRecentWinners((prev) => [newWin, ...prev.slice(0, 15)]);
    }, 24000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const login = (email: string) => {
    const user: User = {
      ...DEFAULT_USER,
      email,
      name: email.split('@')[0].toUpperCase(),
    };
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}!`);
    return true;
  };

  const register = (name: string, email: string, phone?: string, referralCodeInput?: string) => {
    const isReferred = !!referralCodeInput?.trim();
    const cleanRef = referralCodeInput?.trim().toUpperCase();

    // If referred, give $25 welcome service credit and 5 spins instead of 3
    const welcomeCredit = isReferred ? 25 : 0;
    const initialSpins = isReferred ? 5 : 3;

    const userCode = `APEX-${name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

    const user: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      phone,
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      walletAddress: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      twoFactorEnabled: false,
      pinSet: false,
      memberSince: 'Today',
      tier: 'Standard',
      referralCode: userCode,
      referredBy: isReferred ? cleanRef : undefined,
      referralEarningsUsd: 0,
      referralCount: 0,
      referredUsers: [],
    };

    setCurrentUser(user);

    if (welcomeCredit > 0) {
      setBalances((prev) => ({ ...prev, usd: prev.usd + welcomeCredit }));
      const newTx: Transaction = {
        id: `tx-ref-welcome-${Date.now()}`,
        type: 'referral_credit',
        currency: 'USD',
        amount: welcomeCredit,
        usdEquivalent: welcomeCredit,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'completed',
        txHash: `0x${Math.random().toString(16).substring(2, 10)}...welc`,
        description: `Welcome Referral Bonus from code ${cleanRef} (+$25 USD & 5 Spins)`,
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast(`Account created with invite code ${cleanRef}! Received +$25 Service Credit and 5 Free Wheel Spins!`, 'success');
    } else {
      showToast(`Account successfully initialized for ${name}! Enjoy 3 complimentary promotional wheel spins.`);
    }

    setAvailableSpins(initialSpins);
    return true;
  };

  const updateReferralCode = (newCode: string): boolean => {
    if (!currentUser) return false;
    const cleanCode = newCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (cleanCode.length < 3 || cleanCode.length > 20) {
      showToast('Referral code must be 3 to 20 alphanumeric characters.', 'error');
      return false;
    }

    const updated = { ...currentUser, referralCode: cleanCode };
    setCurrentUser(updated);
    showToast(`Your unique invite code updated to: ${cleanCode}`, 'success');
    return true;
  };

  const simulateFriendReferral = (friendName?: string, depositAmount: number = 500) => {
    if (!currentUser) return;

    const names = ['Liam Thorne', 'Mia Vance', 'David Chen', 'Chloe Sterling', 'Jordan Rivera', 'Noah Zhao'];
    const selectedName = friendName || names[Math.floor(Math.random() * names.length)];
    const friendEmail = `${selectedName.toLowerCase().replace(/\s+/g, '.')}@tesla-driver.io`;
    const avatar = `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 100000)}?auto=format&fit=crop&w=150&q=80`;

    // Reward: $100 platform credits + 2 bonus spins for the user
    const bonusCredits = 100;
    const bonusSpins = 2;

    const newReferred: ReferredUser = {
      id: `ref-${Date.now()}`,
      name: selectedName,
      email: friendEmail,
      avatar,
      date: new Date().toISOString().substring(0, 10),
      status: 'deposit_completed',
      depositAmountUsd: depositAmount,
      earnedCreditUsd: bonusCredits,
      bonusSpinsEarned: bonusSpins,
    };

    // Credit USD wallet balance
    setBalances((prev) => ({
      ...prev,
      usd: prev.usd + bonusCredits,
    }));

    // Add extra promotional spins
    setAvailableSpins((prev) => prev + bonusSpins);

    // Record on-chain transaction
    const txId = `tx-ref-${Date.now()}`;
    const txHash = `0x${Math.random().toString(16).substring(2, 10)}...ref`;
    const newTx: Transaction = {
      id: txId,
      type: 'referral_credit',
      currency: 'USD',
      amount: bonusCredits,
      usdEquivalent: bonusCredits,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash,
      description: `Referral Reward: ${selectedName} completed first deposit of $${depositAmount} USD`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Update current user's referredUsers list and metrics
    const updatedUser: User = {
      ...currentUser,
      referralEarningsUsd: (currentUser.referralEarningsUsd || 0) + bonusCredits,
      referralCount: (currentUser.referralCount || 0) + 1,
      referredUsers: [newReferred, ...(currentUser.referredUsers || [])],
    };
    setCurrentUser(updatedUser);

    showToast(
      `🎉 Referral Reward Earned! ${selectedName} completed their first deposit ($${depositAmount} USD)! +$${bonusCredits} USD Platform Credits & ${bonusSpins} Free Spins added to your vault!`,
      'success'
    );
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('Logged out of Apex Tesla Hub.', 'info');
  };

  const setRole = (role: UserRole) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
      showToast(`Switched active mode to ${role === 'admin' ? 'Executive Operations Admin' : 'Customer Account'}.`, 'info');
    }
  };

  const toggle2FA = () => {
    if (currentUser) {
      const newState = !currentUser.twoFactorEnabled;
      setCurrentUser({ ...currentUser, twoFactorEnabled: newState });
      showToast(`Two-Factor Authentication (2FA) is now ${newState ? 'ENABLED (Hardware Vault Protected)' : 'DISABLED'}.`, newState ? 'success' : 'info');
    }
  };

  const updatePin = (newPin: string) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, pin: newPin, pinSet: true });
      showToast('Wallet Security PIN successfully updated.', 'success');
    }
  };

  const depositFunds = async (currency: CryptoCurrency | 'USD', amount: number): Promise<Transaction> => {
    let usdValue = amount;
    if (currency !== 'USD') {
      const rate = CRYPTO_NETWORKS[currency]?.rateUsd || 1;
      usdValue = amount * rate;
    }

    const txId = `tx-${Date.now()}`;
    const txHash = `0x${Math.random().toString(16).substring(2, 14)}...${Math.random().toString(16).substring(2, 6)}`;

    const newTx: Transaction = {
      id: txId,
      type: 'deposit',
      currency,
      amount,
      usdEquivalent: Math.round(usdValue * 100) / 100,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash,
      description: `${currency} Instant Gateway Deposit Confirmed`,
    };

    setBalances((prev) => {
      if (currency === 'USD') {
        return { ...prev, usd: prev.usd + amount };
      } else if (currency === 'BTC') {
        return { ...prev, btc: prev.btc + amount, usd: prev.usd + usdValue };
      } else if (currency === 'USDT') {
        return { ...prev, usdt: prev.usdt + amount, usd: prev.usd + usdValue };
      } else if (currency === 'XRP') {
        return { ...prev, xrp: prev.xrp + amount, usd: prev.usd + usdValue };
      } else if (currency === 'BNB') {
        return { ...prev, bnb: prev.bnb + amount, usd: prev.usd + usdValue };
      }
      return prev;
    });

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Deposit of ${amount} ${currency} (~$${Math.round(usdValue).toLocaleString()}) credited to your vault!`, 'success');
    return newTx;
  };

  const addVehicle = (vehicleData: Omit<TeslaVehicle, 'id' | 'userId'>) => {
    const newVehicle: TeslaVehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
      userId: currentUser?.id || 'usr-default',
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    showToast(`${vehicleData.model} (${vehicleData.trim}) added to your digital garage!`);
  };

  const bookService = (bookingData: Omit<ServiceBooking, 'id' | 'userId' | 'createdAt' | 'progressPercentage' | 'status'>) => {
    const newBooking: ServiceBooking = {
      ...bookingData,
      id: `srv-${Date.now()}`,
      userId: currentUser?.id || 'usr-default',
      progressPercentage: 10,
      status: 'Scheduled',
      createdAt: new Date().toISOString().substring(0, 10),
    };

    setServiceBookings((prev) => [newBooking, ...prev]);

    // Record transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'service_payment',
      currency: 'USD',
      amount: bookingData.totalCostUsd,
      usdEquivalent: bookingData.totalCostUsd,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      description: `${bookingData.serviceType} (${bookingData.serviceMode})`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Deduct from USD wallet
    setBalances((prev) => ({
      ...prev,
      usd: Math.max(0, prev.usd - bookingData.totalCostUsd),
    }));

    showToast(`Service appointment booked for ${bookingData.vehicleName} on ${bookingData.scheduledDate}!`);
    return newBooking;
  };

  const stakeInPool = (poolId: string, amountUsd: number): boolean => {
    if (balances.usd < amountUsd) {
      showToast(`Insufficient USD balance ($${balances.usd.toFixed(2)}). Please deposit funds.`, 'error');
      return false;
    }

    const pool = INVESTMENT_POOLS.find((p) => p.id === poolId);
    if (!pool) return false;

    // Deduct balance
    setBalances((prev) => ({ ...prev, usd: prev.usd - amountUsd }));

    const newInvestment: UserInvestment = {
      id: `inv-${Date.now()}`,
      poolId,
      poolTitle: pool.title,
      amountInvestedUsd: amountUsd,
      investedAt: new Date().toISOString().substring(0, 10),
      earnedDividendsUsd: 0,
      apy: pool.apy,
      nextPayoutHours: 24,
    };

    setUserInvestments((prev) => [newInvestment, ...prev]);

    // Record transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'investment_deposit',
      currency: 'USD',
      amount: amountUsd,
      usdEquivalent: amountUsd,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      description: `Staked in ${pool.title} @ ${pool.apy}% APY`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(`Staked $${amountUsd.toLocaleString()} in ${pool.title}! Daily payouts activated.`);
    return true;
  };

  const claimDividends = (investmentId: string) => {
    const inv = userInvestments.find((i) => i.id === investmentId);
    if (!inv || inv.earnedDividendsUsd <= 0) {
      showToast('No dividends available to claim yet.', 'info');
      return;
    }

    const amount = inv.earnedDividendsUsd;
    setBalances((prev) => ({ ...prev, usd: prev.usd + amount }));
    setUserInvestments((prev) =>
      prev.map((i) => (i.id === investmentId ? { ...i, earnedDividendsUsd: 0 } : i))
    );

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'dividend_claim',
      currency: 'USD',
      amount,
      usdEquivalent: amount,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...div`,
      description: `Claimed $${amount.toFixed(2)} dividends from ${inv.poolTitle}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(`Claimed $${amount.toFixed(2)} dividends into your vault!`, 'success');
  };

  const executeSpin = (): { prize: string; valueUsd: number; type: string } => {
    if (availableSpins <= 0) {
      // Allow purchase with $25
      if (balances.usd < 25) {
        throw new Error('Insufficient spins or balance. Please deposit funds.');
      }
      setBalances((prev) => ({ ...prev, usd: prev.usd - 25 }));
    } else {
      setAvailableSpins((prev) => Math.max(0, prev - 1));
    }

    const wheelOutcomes = [
      { prize: 'Tesla Cybertruck 48-Hour Rental Pass', valueUsd: 598, type: 'Rental Pass' },
      { prize: '1,000 USDT Instant Cash', valueUsd: 1000, type: 'USDT' },
      { prize: 'Full Body Vinyl Wrap ($3,500 Value)', valueUsd: 3500, type: 'Wrap Voucher' },
      { prize: '500 Apex Credits', valueUsd: 500, type: 'Credits' },
      { prize: '100 USDT Quick Bonus', valueUsd: 100, type: 'USDT' },
      { prize: '1,000 kWh Free Supercharger Pass', valueUsd: 350, type: 'Supercharging' },
      { prize: 'Gold Plaid Scratch & Win Card', valueUsd: 1000, type: 'Scratch Card' },
      { prize: '50 Apex Credits', valueUsd: 50, type: 'Credits' },
    ];

    const won = wheelOutcomes[Math.floor(Math.random() * wheelOutcomes.length)];

    // Credit balance if cash/credits
    if (won.valueUsd > 0) {
      setBalances((prev) => ({ ...prev, usd: prev.usd + won.valueUsd }));
    }

    const hash = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'promotion_win',
      currency: 'USD',
      amount: won.valueUsd,
      usdEquivalent: won.valueUsd,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: hash,
      description: `Spin-and-Win Prize: ${won.prize}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    const winRecord: WinRecord = {
      id: `win-${Date.now()}`,
      username: currentUser?.name || 'LuckyUser',
      prize: won.prize,
      type: 'Wheel Spin',
      valueUsd: won.valueUsd,
      timestamp: 'Just now',
      verifiedHash: hash,
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    };
    setRecentWinners((prev) => [winRecord, ...prev]);

    return won;
  };

  const purchaseScratchCard = (tier: ScratchCardTier): boolean => {
    if (balances.usd < tier.priceUsd) {
      showToast(`Insufficient balance ($${balances.usd.toFixed(2)}) for ${tier.name} ($${tier.priceUsd}). Please deposit.`, 'error');
      return false;
    }

    setBalances((prev) => ({ ...prev, usd: prev.usd - tier.priceUsd }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'scratch_card_purchase',
      currency: 'USD',
      amount: tier.priceUsd,
      usdEquivalent: tier.priceUsd,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...sc`,
      description: `Purchased ${tier.name} Scratch Card`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    return true;
  };

  const awardScratchPrize = (tier: ScratchCardTier, prizeAmountUsd: number, prizeLabel: string) => {
    setBalances((prev) => ({ ...prev, usd: prev.usd + prizeAmountUsd }));

    const hash = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'promotion_win',
      currency: 'USD',
      amount: prizeAmountUsd,
      usdEquivalent: prizeAmountUsd,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: hash,
      description: `Scratch & Win [${tier.name}]: ${prizeLabel}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    const winRecord: WinRecord = {
      id: `win-${Date.now()}`,
      username: currentUser?.name || 'LuckyScratcher',
      prize: `${prizeLabel} (${tier.name})`,
      type: 'Scratch & Win',
      valueUsd: prizeAmountUsd,
      timestamp: 'Just now',
      verifiedHash: hash,
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    };
    setRecentWinners((prev) => [winRecord, ...prev]);

    showToast(`CONGRATULATIONS! You revealed ${prizeLabel} (+$${prizeAmountUsd.toLocaleString()})! Credited to your wallet!`, 'success');
  };

  const rentVehicle = (vehicle: RentalVehicle, days: number, startDate: string): boolean => {
    const totalCost = vehicle.dailyRateUsd * days;
    if (balances.usd < totalCost) {
      showToast(`Insufficient balance ($${balances.usd.toFixed(2)}) for reservation ($${totalCost.toLocaleString()}). Please deposit crypto or USD.`, 'error');
      return false;
    }

    setBalances((prev) => ({ ...prev, usd: prev.usd - totalCost }));

    const booking = {
      rentalId: `rent-booking-${Date.now()}`,
      vehicle,
      days,
      startDate,
      totalUsd: totalCost,
    };
    setBookedRentals((prev) => [booking, ...prev]);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'rental_payment',
      currency: 'USD',
      amount: totalCost,
      usdEquivalent: totalCost,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...rnt`,
      description: `Rental: ${vehicle.model} ${vehicle.trim} (${days} days)`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(`Successfully reserved ${vehicle.model} ${vehicle.trim} for ${days} days starting ${startDate}!`);
    return true;
  };

  const addToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to order cart.`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const checkoutCart = (): boolean => {
    const total = cart.reduce((acc, item) => acc + item.product.priceUsd * item.quantity, 0);
    if (balances.usd < total) {
      showToast(`Cart total is $${total.toLocaleString()}, but wallet balance is $${balances.usd.toFixed(2)}. Please make a deposit.`, 'error');
      return false;
    }

    setBalances((prev) => ({ ...prev, usd: prev.usd - total }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'service_payment',
      currency: 'USD',
      amount: total,
      usdEquivalent: total,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...sh`,
      description: `Apex Store Hardware & Accessories Order (${cart.length} items)`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    setCart([]);
    showToast(`Order processed for $${total.toLocaleString()}! Hardware dispatch tracking sent to email.`, 'success');
    return true;
  };

  const referralCode = currentUser?.referralCode || 'APEX-ALEX-99';
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${referralCode}`
    : `https://apex-tesla.io/?ref=${referralCode}`;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        userRole: currentUser?.role || 'customer',
        balances,
        vehicles,
        serviceBookings,
        userInvestments,
        transactions,
        availableSpins,
        recentWinners,
        cart,
        bookedRentals,
        toastMessage,
        login,
        register,
        logout,
        setRole,
        toggle2FA,
        updatePin,
        depositFunds,
        addVehicle,
        bookService,
        stakeInPool,
        claimDividends,
        executeSpin,
        purchaseScratchCard,
        awardScratchPrize,
        rentVehicle,
        addToCart,
        removeFromCart,
        checkoutCart,
        showToast,
        referralLink,
        updateReferralCode,
        simulateFriendReferral,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
