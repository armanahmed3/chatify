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
    priceMonthly: 0,
    pricePerDay: 0,
    description: "Ideal for testing your chatbot and answering basic FAQs 24/7.",
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
      "Website & Custom Text Training",
      "Standard Response Time",
    ],
    ctaText: "Get Started Free",
  },
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 29,
    pricePerDay: 0.97,
    description: "Perfect for local businesses wanting 24/7 lead capture and zero missed calls.",
    popular: true,
    badge: "Most Popular",
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
      "2 AI Chatbots",
      "Unlimited FAQ / Instant answers ($0 cost)",
      "2,000 AI Smart Chats / month",
      "Smart Lead Capture (Phone, Email, Notes)",
      "Remove Chatify Branding Badge",
      "Priority Email & Resend Alerts",
      "Website Sitemap & File Upload Training",
      "Unified Inbox with Human Takeover",
    ],
    ctaText: "Start 14-Day Free Trial",
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 79,
    pricePerDay: 2.63,
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
    ctaText: "Start 14-Day Free Trial",
  },
  agency: {
    id: "agency",
    name: "Agency",
    priceMonthly: 199,
    pricePerDay: 6.63,
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
    ctaText: "Start 14-Day Free Trial",
  },
};

export const BILLING_PROMISES = [
  "No per-message fees ever",
  "No add-ons or surprise charges",
  "No upfront credit card required for 14-day trial",
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
