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
    description: "Start with a 7-day full-feature trial — no credit card required. 24/7 lead capture and zero missed calls.",
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
      "7 Days 100% Free Trial (No Card Needed)",
      "2 AI Chatbots with Custom Knowledge",
      "Unlimited FAQ / Instant answers ($0 cost)",
      "2,000 AI Smart Chats / month",
      "Automated Lead Capture (Phone, Email, CRM)",
      "Human Takeover & Live Visitor Radar",
      "Remove Chatify Branding Badge",
      "Real-time SMS & Resend Email Alerts",
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
    description: "For thriving businesses connecting WhatsApp, Instagram, and automated bookings.",
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
      "5 AI Chatbots",
      "Unlimited FAQ / Instant answers ($0 cost)",
      "10,000 AI Smart Chats / month",
      "WhatsApp Cloud API Integration",
      "Instagram DM & Facebook Messenger",
      "AI Actions: Book Appointments (Google/Calendly)",
      "Custom REST Webhook Actions",
      "Dynamic Promotional Coupons & Catalog Cards",
      "Lead Scoring (Hot, Warm, Cold)",
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
    description: "Complete white-label solution for agencies and multi-location practices.",
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
      "25 AI Chatbots",
      "Unlimited FAQ / Instant answers ($0 cost)",
      "50,000 AI Smart Chats / month",
      "100% White-Label: Custom CNAME Domain",
      "Replace Chatify Branding with Your Agency Brand",
      "Client Sub-Accounts & Role Permissions",
      "Dedicated High-Throughput AI Router",
      "Comprehensive CSV & Data Export (GDPR)",
      "VIP Priority Support & Onboarding",
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
