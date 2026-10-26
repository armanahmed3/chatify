import { NextRequest, NextResponse } from "next/server";

export interface VisitorAction {
  id: string;
  type: "arrival" | "page_view" | "section_view" | "click" | "chat_open";
  description: string;
  url: string;
  pathname: string;
  section?: string;
  elementText?: string;
  timestamp: string;
}

export interface ActiveVisitor {
  id: string;
  ipMasked: string;
  device: string;
  browser: string;
  referrer: string;
  currentPage: string;
  currentTitle: string;
  currentSection?: string;
  firstSeenAt: string;
  lastActiveAt: string;
  isNewArrival: boolean;
  hasUsedChat: boolean;
  actions: VisitorAction[];
}

// In-memory active visitor registry (synchronized across requests)
const globalVisitorStore = new Map<string, ActiveVisitor>();
let latestNewVisitorId: string | null = null;
let latestNewVisitorTimestamp: number = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      visitorId,
      eventType = "page_view",
      url = "",
      pathname = "/",
      title = "Website Page",
      referrer = "Direct",
      device = "Desktop",
      browser = "Chrome",
      section,
      elementText,
      elementTag,
    } = body;

    if (!visitorId) {
      return NextResponse.json({ error: "visitorId is required" }, { status: 400 });
    }

    const now = new Date();
    const nowIso = now.toISOString();

    const clientIp = request.ip || request.headers.get("x-forwarded-for") || "127.0.0.1";
    const ipMasked = clientIp.includes(".")
      ? clientIp.split(".").slice(0, 3).join(".") + ".xxx"
      : "masked-visitor";

    let visitor = globalVisitorStore.get(visitorId);
    const isFirstTime = !visitor;

    let actionDescription = "";
    if (eventType === "arrival") {
      actionDescription = `Landed on ${pathname || "/"}${referrer && referrer !== "Direct" ? ` from ${referrer}` : ""}`;
    } else if (eventType === "page_view") {
      actionDescription = `Navigated to ${pathname} (${title})`;
    } else if (eventType === "section_view") {
      actionDescription = `Viewing section: ${section || "Content Area"}`;
    } else if (eventType === "click") {
      actionDescription = `Clicked ${elementTag || "element"} "${elementText || "CTA"}" on ${pathname}`;
    } else if (eventType === "chat_open") {
      actionDescription = `Opened AI Chatbot widget on ${pathname}`;
    } else {
      actionDescription = `Active on ${pathname}`;
    }

    const actionItem: VisitorAction = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: eventType,
      description: actionDescription,
      url,
      pathname,
      section,
      elementText,
      timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };

    if (isFirstTime) {
      visitor = {
        id: visitorId,
        ipMasked,
        device,
        browser,
        referrer: referrer || "Direct / Bookmark",
        currentPage: pathname || "/",
        currentTitle: title || "Home Page",
        currentSection: section || "Header",
        firstSeenAt: nowIso,
        lastActiveAt: nowIso,
        isNewArrival: true,
        hasUsedChat: eventType === "chat_open",
        actions: [actionItem],
      };
      globalVisitorStore.set(visitorId, visitor);
      latestNewVisitorId = visitorId;
      latestNewVisitorTimestamp = Date.now();
    } else if (visitor) {
      visitor.lastActiveAt = nowIso;
      visitor.currentPage = pathname || visitor.currentPage;
      visitor.currentTitle = title || visitor.currentTitle;
      if (section) visitor.currentSection = section;
      if (eventType === "chat_open") visitor.hasUsedChat = true;

      // Keep recent 20 actions
      visitor.actions.unshift(actionItem);
      if (visitor.actions.length > 20) {
        visitor.actions.pop();
      }
    }

    // Clean up visitors inactive for more than 20 minutes
    const twentyMinsAgo = Date.now() - 20 * 60 * 1000;
    globalVisitorStore.forEach((v, id) => {
      if (new Date(v.lastActiveAt).getTime() < twentyMinsAgo) {
        globalVisitorStore.delete(id);
      }
    });

    return NextResponse.json({
      ok: true,
      tracked: true,
      visitorId,
      action: actionDescription,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to record telemetry" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Check if caller wants to acknowledge new arrival notification
  const { searchParams } = new URL(request.url);
  const ackId = searchParams.get("ack");

  if (ackId) {
    const v = globalVisitorStore.get(ackId);
    if (v) v.isNewArrival = false;
    if (latestNewVisitorId === ackId) {
      latestNewVisitorId = null;
    }
    return NextResponse.json({ ok: true, acknowledged: ackId });
  }

  // Populate mock visitors if store is empty so dashboard demo is always rich and interactive
  if (globalVisitorStore.size === 0) {
    const mockVisitors: ActiveVisitor[] = [
      {
        id: "cty_v_8921",
        ipMasked: "198.51.100.xxx",
        device: "Desktop",
        browser: "Chrome (Windows)",
        referrer: "https://google.com/search?q=teeth+cleaning+clinic",
        currentPage: "/pricing",
        currentTitle: "Pricing & Dental Plans | Apex Dental",
        currentSection: "#routine-cleaning",
        firstSeenAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        lastActiveAt: new Date(Date.now() - 15 * 1000).toISOString(),
        isNewArrival: true,
        hasUsedChat: false,
        actions: [
          {
            id: "act-1",
            type: "click",
            description: `Clicked button "View $95 New Patient Special" on /pricing`,
            url: "https://apexdentalclinic.com/pricing",
            pathname: "/pricing",
            section: "#routine-cleaning",
            elementText: "View $95 New Patient Special",
            timestamp: "Just now",
          },
          {
            id: "act-2",
            type: "section_view",
            description: `Viewing section: #routine-cleaning`,
            url: "https://apexdentalclinic.com/pricing",
            pathname: "/pricing",
            section: "#routine-cleaning",
            timestamp: "1m ago",
          },
          {
            id: "act-3",
            type: "page_view",
            description: `Navigated to /pricing (Pricing & Dental Plans)`,
            url: "https://apexdentalclinic.com/pricing",
            pathname: "/pricing",
            timestamp: "2m ago",
          },
          {
            id: "act-4",
            type: "arrival",
            description: `Landed on / from Google Search`,
            url: "https://apexdentalclinic.com/",
            pathname: "/",
            timestamp: "3m ago",
          },
        ],
      },
      {
        id: "cty_v_4302",
        ipMasked: "203.0.113.xxx",
        device: "Mobile",
        browser: "Safari (iPhone iOS 17)",
        referrer: "https://instagram.com/p/C72x9",
        currentPage: "/booking",
        currentTitle: "Book Appointment Online | Apex Dental",
        currentSection: "#doctor-schedule",
        firstSeenAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        lastActiveAt: new Date(Date.now() - 45 * 1000).toISOString(),
        isNewArrival: false,
        hasUsedChat: true,
        actions: [
          {
            id: "act-10",
            type: "click",
            description: `Clicked button "Select Thursday 10:30 AM" on /booking`,
            url: "https://apexdentalclinic.com/booking",
            pathname: "/booking",
            section: "#doctor-schedule",
            elementText: "Select Thursday 10:30 AM",
            timestamp: "45s ago",
          },
          {
            id: "act-11",
            type: "chat_open",
            description: `Opened AI Chatbot widget on /services`,
            url: "https://apexdentalclinic.com/services",
            pathname: "/services",
            timestamp: "5m ago",
          },
        ],
      },
      {
        id: "cty_v_6118",
        ipMasked: "192.0.2.xxx",
        device: "Tablet",
        browser: "Chrome (iPad)",
        referrer: "https://facebook.com/posts",
        currentPage: "/services/implants",
        currentTitle: "Dental Implants & Cosmetic Surgery",
        currentSection: "#before-after-gallery",
        firstSeenAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        lastActiveAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        isNewArrival: false,
        hasUsedChat: false,
        actions: [
          {
            id: "act-20",
            type: "section_view",
            description: `Viewing section: #before-after-gallery`,
            url: "https://apexdentalclinic.com/services/implants",
            pathname: "/services/implants",
            section: "#before-after-gallery",
            timestamp: "2m ago",
          },
        ],
      },
    ];

    for (const v of mockVisitors) {
      globalVisitorStore.set(v.id, v);
    }
  }

  const visitorsList = Array.from(globalVisitorStore.values()).sort(
    (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
  );

  const hasNewArrival = visitorsList.some((v) => v.isNewArrival);

  return NextResponse.json({
    ok: true,
    visitors: visitorsList,
    totalActiveNow: visitorsList.length,
    hasNewArrival,
    latestArrival: visitorsList.find((v) => v.isNewArrival) || null,
    serverTime: new Date().toISOString(),
  });
}
