export interface PlanFeature {
  name: string;
  included: boolean;
  hint?: string;
}

export interface PlanTier {
  id: "free" | "starter" | "pro" | "agency";
  name: string;
  priceMonthly: number;
  pricePerDay: number; // monthly / 30
  description: string;
  badge?: string;
  popular?: boolean;
  hidden?: boolean;
  trialDays?: number;
  trialNotice?: string;
  limits: {
    maxBots: number;
    monthlyAiChats: number;
    unlimitedFaqAnswers: boolean;
    leadCapture: boolean;
    removeBranding: boolean;
    omnichannelMeta: boolean; // WhatsApp, Instagram, Messenger
    aiActions: boolean; // Bookings, webhooks, coupons
    whiteLabel: boolean;
    subAccounts: boolean;
  };
  features: string[];
  ctaText: string;
}

export const PLANS: Record<string, PlanTier> = {
  free: {
    id: "free",
    name: "Free",
    hidden: true,
    priceMonthly: 0,
    pricePerDay: 0,
    description: "Legacy evaluation tier.",
    limits: {
      maxBots: 1,
      monthlyAiChats: 100,
      unlimitedFaqAnswers: true,
      leadCapture: false,
      removeBranding: false,
      omnichannelMeta: false,
      aiActions: false,
      whiteLabel: false,
      subAccounts: false,
    },
    features: [
      "1 AI Chatbot",
      "Unlimited FAQ / Instant answers ($0 cost)",
      "100 AI Smart Chats / month",
      "Website Embeddable Widget",
      "Standard Response Time",
    ],
    ctaText: "Legacy Free Tier",
  },
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 29,
    pricePerDay: 0.97,
    description: "For a single small business getting started.",
    popular: true,
    badge: "7-Day Free Trial",
    trialDays: 7,
    trialNotice: "7-Day Free Trial • No Credit Card Required",
    limits: {
      maxBots: 2,
      monthlyAiChats: 2000,
      unlimitedFaqAnswers: true,
      leadCapture: true,
      removeBranding: true,
      omnichannelMeta: false,
      aiActions: false,
      whiteLabel: false,
      subAccounts: false,
    },
    features: [
      "2 chatbots",
      "2,000 AI replies per month",
      "Learns from your website and documents",
      "Lead collection with email alerts",
      "Conversation history",
      "Remove our branding",
    ],
    ctaText: "Start 7-Day Free Trial",
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 79,
    pricePerDay: 2.63,
    trialDays: 7,
    trialNotice: "7-Day Free Trial • No Credit Card Required",
    description: "For busy businesses with more customer messages.",
    limits: {
      maxBots: 5,
      monthlyAiChats: 10000,
      unlimitedFaqAnswers: true,
      leadCapture: true,
      removeBranding: true,
      omnichannelMeta: true,
      aiActions: true,
      whiteLabel: false,
      subAccounts: false,
    },
    features: [
      "5 chatbots",
      "10,000 AI replies per month",
      "Everything in Starter",
      "WhatsApp connection",
      "Hot / warm / cold lead labels",
      "Priority email support",
    ],
    ctaText: "Start 7-Day Free Trial",
  },
  agency: {
    id: "agency",
    name: "Agency",
    priceMonthly: 199,
    pricePerDay: 6.63,
    trialDays: 7,
    trialNotice: "7-Day Free Trial • No Credit Card Required",
    description: "For agencies and businesses with several locations.",
    limits: {
      maxBots: 25,
      monthlyAiChats: 50000,
      unlimitedFaqAnswers: true,
      leadCapture: true,
      removeBranding: true,
      omnichannelMeta: true,
      aiActions: true,
      whiteLabel: true,
      subAccounts: true,
    },
    features: [
      "25 chatbots",
      "50,000 AI replies per month",
      "Everything in Pro",
      "Manage several businesses from one login",
      "Team members with roles",
      "Data export",
    ],
    ctaText: "Start 7-Day Free Trial",
  },
};

export const PUBLIC_PLANS = [PLANS.starter, PLANS.pro, PLANS.agency];

export const BILLING_PROMISES = [
  "No per-message fees ever",
  "No add-ons or surprise charges",
  "7-Day Free Trial with full features • No credit card required",
  "Cancel in one click anytime",
];

export const RECEPTIONIST_COMPARISON = {
  humanMonthlyCost: 2000,
  humanCoverageHours: 40,
  humanLanguages: 1,
  chatifyStarterMonthly: 29,
  chatifyCoverageHours: 168, // 24/7
  chatifyLanguages: 95,
  monthlySavings: 1971,
};
