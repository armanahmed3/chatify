/**
 * Chatify Lightweight Embeddable AI Chat Widget & Real-Time Visitor Telemetry Engine
 * Pure Vanilla JavaScript • Zero Dependencies • 100% Mobile Responsive • Live Visitor Tracking
 */
(function () {
  "use strict";

  // Prevent duplicate execution
  if (window.__CHATIFY_INITIALIZED__) return;
  window.__CHATIFY_INITIALIZED__ = true;

  // 1. Configuration & Host Resolution
  var scriptTag =
    document.currentScript ||
    document.querySelector("script[data-bot]") ||
    document.querySelector("script[data-bot-id]") ||
    document.querySelector("script[src*='widget.js']");

  var botId = scriptTag ? scriptTag.getAttribute("data-bot") || scriptTag.getAttribute("data-bot-id") || "demo-apex" : "demo-apex";
  var brandAccentColor = scriptTag ? scriptTag.getAttribute("data-color") || "#2563eb" : "#2563eb";
  var brandTextColor = scriptTag ? scriptTag.getAttribute("data-text-color") || "#ffffff" : "#ffffff";
  var brandName = scriptTag ? scriptTag.getAttribute("data-brand") || "" : "";
  var scriptSrc = scriptTag ? scriptTag.getAttribute("src") || "" : "";

  var hostUrl = "";
  if (scriptSrc.indexOf("http") === 0) {
    try {
      var parsed = new URL(scriptSrc);
      hostUrl = parsed.origin;
    } catch (e) {
      hostUrl = window.location.origin;
    }
  } else {
    hostUrl = window.location.origin;
  }

  // 2. Real-Time Visitor Identity & Telemetry Engine
  var STORAGE_KEY = "chatify_visitor_uid";
  var visitorId = "";
  try {
    visitorId = localStorage.getItem(STORAGE_KEY) || "";
    if (!visitorId) {
      visitorId = "cty_v_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
      localStorage.setItem(STORAGE_KEY, visitorId);
    }
  } catch (e) {
    visitorId = "cty_v_" + Math.random().toString(36).substring(2, 9);
  }

  var isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 640;
  var deviceType = isMobileDevice ? (window.innerWidth >= 600 ? "Tablet" : "Mobile") : "Desktop";

  function sendTelemetry(eventType, extraData) {
    try {
      var payload = {
        visitorId: visitorId,
        eventType: eventType,
        url: window.location.href,
        pathname: window.location.pathname,
        title: document.title,
        referrer: document.referrer || "Direct",
        device: deviceType,
        browser: navigator.userAgent.indexOf("Chrome") > -1 ? "Chrome" : navigator.userAgent.indexOf("Safari") > -1 ? "Safari" : "Browser",
      };

      if (extraData) {
        for (var key in extraData) {
          if (extraData.hasOwnProperty(key)) {
            payload[key] = extraData[key];
          }
        }
      }

      var endpoint = hostUrl + "/api/tracking/events";
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, JSON.stringify(payload));
      } else {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", endpoint, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(payload));
      }
    } catch (err) {}
  }

  // A. Fire Arrival Event Immediately when visitor lands on page
  sendTelemetry("arrival", {
    section: "Header",
  });

  // B. Track Page Changes (Single Page Apps & Multi Page Sites)
  var lastKnownPath = window.location.pathname;
  function checkRouteChange() {
    if (window.location.pathname !== lastKnownPath) {
      lastKnownPath = window.location.pathname;
      sendTelemetry("page_view", {
        section: "Page Transition",
      });
    }
  }

  window.addEventListener("popstate", checkRouteChange);
  window.addEventListener("hashchange", checkRouteChange);

  // Hook pushState / replaceState for Next.js / React / Vue SPAs
  var originalPushState = history.pushState;
  if (originalPushState) {
    history.pushState = function () {
      originalPushState.apply(this, arguments);
      setTimeout(checkRouteChange, 100);
    };
  }

  // C. Track Active Section Views & Scroll Depth
  var observedSections = new Set();
  if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            var el = entry.target;
            var sectionId = el.id ? "#" + el.id : el.getAttribute("aria-label") || el.tagName.toLowerCase();
            if (!observedSections.has(sectionId)) {
              observedSections.add(sectionId);
              sendTelemetry("section_view", {
                section: sectionId,
              });
            }
          }
        });
      },
      { threshold: [0.3] }
    );

    function attachSectionObservers() {
      var elements = document.querySelectorAll("section, [id*='pricing'], [id*='about'], [id*='service'], [id*='faq'], [id*='contact'], [id*='booking'], footer");
      for (var i = 0; i < elements.length; i++) {
        sectionObserver.observe(elements[i]);
      }
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", attachSectionObservers);
    } else {
      attachSectionObservers();
    }
  }

  // D. Track Button & CTA Clicks across website (even without using chat!)
  document.addEventListener("click", function (evt) {
    try {
      var target = evt.target;
      var clickable = target.closest("button, a, input[type='submit'], [role='button']");
      if (!clickable) return;
      if (clickable.id === "chatify-launcher-btn" || clickable.closest("#chatify-widget-container") || clickable.closest("#chatify-frame-wrapper")) {
        return; // Handled separately
      }

      var text = (clickable.innerText || clickable.textContent || clickable.getAttribute("aria-label") || clickable.getAttribute("value") || "").trim();
      text = text.substring(0, 60);

      var elementId = clickable.id ? "#" + clickable.id : "";
      var href = clickable.getAttribute("href") || "";

      sendTelemetry("click", {
        elementText: text || elementId || href || "Interactive Element",
        elementTag: clickable.tagName.toLowerCase(),
        section: elementId || href || window.location.pathname,
      });
    } catch (e) {}
  }, true);

  // 3. Ultra-Responsive UI Launcher & Sandboxed Chat Frame
  var container = document.createElement("div");
  container.id = "chatify-widget-container";
  container.style.cssText =
    "position:fixed;bottom:24px;right:24px;z-index:2147483646;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;";

  // Launcher button
  var button = document.createElement("button");
  button.id = "chatify-launcher-btn";
  button.setAttribute("aria-label", "Open 24/7 AI Receptionist");
  button.style.cssText =
    "width:58px;height:58px;border-radius:29px;background:" +
    brandAccentColor +
    ";color:" +
    brandTextColor +
    ";border:none;cursor:pointer;box-shadow:0 10px 28px rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:center;transition:transform 0.2s cubic-bezier(0.16,1,0.3,1),box-shadow 0.2s;outline:none;";

  button.innerHTML =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  // Online pulse badge
  var badge = document.createElement("span");
  badge.style.cssText =
    "position:absolute;top:2px;right:2px;width:12px;height:12px;background:#10b981;border-radius:6px;border:2px solid #ffffff;box-shadow:0 0 8px rgba(16,185,129,0.8);";
  button.appendChild(badge);

  // Frame Wrapper
  var frameWrapper = document.createElement("div");
  frameWrapper.id = "chatify-frame-wrapper";

  function applyResponsiveStyles(isOpen) {
    if (!isOpen) {
      frameWrapper.style.display = "none";
      return;
    }

    var isMobile = window.innerWidth <= 540;
    if (isMobile) {
      frameWrapper.style.cssText =
        "display:block;position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;max-width:100vw;max-height:100vh;border-radius:0;box-shadow:none;overflow:hidden;border:none;background:#09090b;z-index:2147483647;margin:0;padding:0;";
    } else {
      frameWrapper.style.cssText =
        "display:block;position:fixed;bottom:94px;right:24px;width:400px;height:630px;max-width:calc(100vw - 32px);max-height:calc(100vh - 120px);border-radius:20px;box-shadow:0 20px 48px rgba(0,0,0,0.35);overflow:hidden;border:1px solid rgba(255,255,255,0.15);background:#09090b;z-index:2147483647;";
    }
  }

  // Construct iframe with dynamic brand parameters
  var queryParams = [];
  queryParams.push("embedded=true");
  if (brandName) queryParams.push("brand=" + encodeURIComponent(brandName));
  if (brandAccentColor) queryParams.push("color=" + encodeURIComponent(brandAccentColor));
  if (brandTextColor) queryParams.push("textColor=" + encodeURIComponent(brandTextColor));

  var iframeUrl = hostUrl + "/chat/" + encodeURIComponent(botId) + "?" + queryParams.join("&");

  var iframe = document.createElement("iframe");
  iframe.src = iframeUrl;
  iframe.style.cssText = "width:100%;height:100%;border:none;background:transparent;";
  iframe.title = brandName ? brandName + " AI Assistant" : "Chatify Virtual Assistant";
  frameWrapper.appendChild(iframe);

  var isOpen = false;

  function toggleChat() {
    isOpen = !isOpen;
    applyResponsiveStyles(isOpen);

    if (isOpen) {
      sendTelemetry("chat_open");
      button.style.transform = "scale(0.92)";
      button.innerHTML =
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    } else {
      button.style.transform = "scale(1)";
      button.innerHTML =
        '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
      button.appendChild(badge);
    }
  }

  button.addEventListener("click", toggleChat);

  // Resize handler for orientation change
  window.addEventListener("resize", function () {
    if (isOpen) {
      applyResponsiveStyles(true);
    }
  });

  // Listen for close commands from inside iframe
  window.addEventListener("message", function (event) {
    if (event.data === "chatify:close" && isOpen) {
      toggleChat();
    }
  });

  document.body.appendChild(frameWrapper);
  document.body.appendChild(container);
  container.appendChild(button);
})();
