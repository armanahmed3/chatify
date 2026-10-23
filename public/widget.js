/**
 * Chatify Lightweight Embeddable AI Chat Widget (<30KB)
 * Pure Vanilla JavaScript • Zero External Dependencies • Sandboxed Iframe
 */
(function () {
  "use strict";

  // Prevent duplicate execution
  if (window.__CHATIFY_INITIALIZED__) return;
  window.__CHATIFY_INITIALIZED__ = true;

  // Find the active script tag to extract bot public ID and host URL
  var scriptTag =
    document.currentScript ||
    document.querySelector("script[data-bot]") ||
    document.querySelector("script[src*='widget.js']");

  var botId = scriptTag ? scriptTag.getAttribute("data-bot") || "demo-apex" : "demo-apex";
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

  // Create isolated container
  var container = document.createElement("div");
  container.id = "chatify-widget-container";
  container.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:999999;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;";

  // Create launcher button
  var button = document.createElement("button");
  button.id = "chatify-launcher-btn";
  button.setAttribute("aria-label", "Open customer support chat");
  button.style.cssText =
    "width:56px;height:56px;border-radius:28px;background:#18181b;color:#ffffff;border:none;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;transition:transform 0.2s cubic-bezier(0.16,1,0.3,1);outline:none;";

  // SVG Chat Icon
  button.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  // Unread badge indicator
  var badge = document.createElement("span");
  badge.style.cssText =
    "position:absolute;top:0;right:0;width:12px;height:12px;background:#10b981;border-radius:6px;border:2px solid #ffffff;";
  button.appendChild(badge);

  // Create iframe dialog container
  var frameWrapper = document.createElement("div");
  frameWrapper.id = "chatify-frame-wrapper";
  frameWrapper.style.cssText =
    "display:none;position:fixed;bottom:90px;right:24px;width:380px;height:600px;max-width:calc(100vw - 48px);max-height:calc(100vh - 120px);border-radius:16px;box-shadow:0 12px 36px rgba(0,0,0,0.25);overflow:hidden;border:1px solid rgba(255,255,255,0.15);background:#09090b;z-index:999999;transition:opacity 0.2s,transform 0.2s;";

  var iframe = document.createElement("iframe");
  iframe.src = hostUrl + "/chat/" + encodeURIComponent(botId) + "?embedded=true";
  iframe.style.cssText = "width:100%;height:100%;border:none;background:transparent;";
  iframe.title = "Chatify Virtual Assistant";
  frameWrapper.appendChild(iframe);

  var isOpen = false;

  button.addEventListener("click", function () {
    isOpen = !isOpen;
    if (isOpen) {
      frameWrapper.style.display = "block";
      button.style.transform = "scale(0.92)";
      button.innerHTML =
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    } else {
      frameWrapper.style.display = "none";
      button.style.transform = "scale(1)";
      button.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    }
  });

  button.addEventListener("mouseenter", function () {
    if (!isOpen) button.style.transform = "scale(1.06)";
  });
  button.addEventListener("mouseleave", function () {
    if (!isOpen) button.style.transform = "scale(1)";
  });

  document.body.appendChild(frameWrapper);
  document.body.appendChild(container);
  container.appendChild(button);
})();
