---
name: Chatify Design System
description: Impeccable enterprise-grade design tokens and interface language for Chatify
colors:
  background: "#09090b"
  foreground: "#fafafa"
  card: "#121215"
  card-foreground: "#fafafa"
  primary: "#fafafa"
  primary-foreground: "#18181b"
  secondary: "#1f1f23"
  secondary-foreground: "#fafafa"
  muted: "#27272a"
  muted-foreground: "#a1a1aa"
  accent: "#2563eb"
  accent-hover: "#1d4ed8"
  accent-foreground: "#ffffff"
  border: "#27272a"
  input: "#27272a"
  emerald-success: "#10b981"
  rose-hot: "#f43f5e"
  amber-warning: "#f59e0b"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2rem, 5vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  h1:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  h2:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  h3:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  body-sm:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  caption:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    height: "44px"
  card-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

## Overview
Chatify follows a sleek, high-contrast dark aesthetic engineered for readability and operational confidence. The interface avoids cliché purple gradients and noisy visual clutter in favor of crisp typography, tactile surfaces, and functional color accents that guide the user's eye to high-intent actions.

## Colors
- **Canvas / Surfaces:** Deep neutral zinc tones (`#09090b`, `#121215`, `#1f1f23`). Avoid muddy greys; preserve dark mode contrast.
- **Brand Accent:** High-precision royal blue (`#2563eb`) with vibrant states (`#1d4ed8`). Used exclusively for key CTAs, active links, and primary signals.
- **Intent Status Palette:**
  - `Emerald (#10b981)`: AI bot online, active subscribers, successful crawl, verified phone.
  - `Rose (#f43f5e)`: Hot customer inquiry, angry caller alert, security violation attempt.
  - `Amber (#f59e0b)`: Warm lead, manual human takeover active, bot paused.
  - `Indigo (#818cf8)`: Email capture, document processing, webhook integration.

## Typography
- **Font Stack:** Clean geometric sans-serif (`Inter`, system UI font fallback).
- **Scale Rules:**
  - Hero display scales fluidly: `clamp(2rem, 5vw, 4.5rem)`.
  - Body copy on desktop: `16px` (`1rem`) with `1.6` line-height for effortless scanning.
  - Minimum text size on mobile inputs: `16px` to avoid automatic browser zoom triggers.
  - Micro-metadata and pills use `11px - 12px` font-mono for clear technical data.

## Layout
- **Breakpoints Standard:**
  - Mobile: `< 768px` (single column, full-width drawers, stacked CTAs).
  - Tablet: `768px – 1023px` (adaptive 2-pane workflows).
  - Desktop: `1024px+` (3-pane conversational inboxes, full sidebars).
- **Breathing Room:** Outer section padding is at least `48px` on mobile and `80px – 112px` on desktop. Content never touches the viewport border.

## Elevation & Depth
- **Borders:** Subtle translucent borders (`border-border/60` or `hsl(var(--border) / 0.6)`) delineate cards without heavy dropshadows.
- **Backdrop Blur:** Modals and sticky headers utilize `backdrop-blur-md` with `bg-background/90` for natural spatial depth.
- **Gradients:** Restrained radial glows with high blur radius (`blur-[120px]`) and low opacity (`20% - 25%`) create subtle ambient illumination without creating visual noise.

## Shapes
- **Cards & Dialogs:** `rounded-2xl` (`16px`) for friendly yet professional containment.
- **Interactive Buttons:** `rounded-lg` (`10px`) or `rounded-xl` (`12px`).
- **Status Badges & Avatars:** Fully rounded pill tags (`rounded-full`) with uppercase typography.

## Components
- **Buttons:** Every interactive control meets the `44px x 44px` minimum touch target on mobile viewports.
- **Inputs:** Clean border inputs with `16px` font size on mobile and active focus rings (`ring-2 ring-accent/40`).
- **Data Tables:** Tables scroll horizontally inside dedicated wrapper containers with clear sticky headers.

## Do's and Don'ts
- **DO** use purposeful micro-animations (e.g. subtle pulse on live visitors or voice recording).
- **DO** provide immediate tactile feedback on buttons (active scale `0.98`, clipboard confirmation toasts).
- **DO NOT** use generic AI purple/pink gradients or decorative gimmicks.
- **DO NOT** reduce touch targets below 44px on mobile screens.
- **DO NOT** use lorem ipsum or generic copy; use real domain examples (dental clinics, auto repair shops, salons).
