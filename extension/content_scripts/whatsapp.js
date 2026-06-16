// whatsapp.js
// WhatsApp Web obfuscates ALL class names on every build.
// NEVER use class names here. Use data-testid and role attributes — they are stable.
// Messages load inside #main only after the user opens a chat.

(function () {
  let postCount = 0;

  function extractMessage(el) {
    const textEl =
      el.querySelector('[data-testid="msg-container"]') ||
      el.querySelector("span.selectable-text") ||
      el.querySelector('[role="row"]');

    const text = textEl ? textEl.innerText.trim() : el.innerText.trim();
    if (!text || text.length < 20) return null;

    const id = `wa-${encodeURIComponent(text.slice(0, 80)).replace(/[^a-z0-9]/gi, "").slice(0, 16)}-${postCount++}`;
    el.setAttribute("data-tl-id", id);

    return { id, text, images: [], platform: "whatsapp" };
  }

  function scanNode(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const messages = node.querySelectorAll
      ? node.querySelectorAll('[data-testid="msg-container"], [role="row"]')
      : [];

    messages.forEach((msg) => {
      if (!msg.hasAttribute("data-tl-id") && msg.innerText.length > 20) {
        const post = extractMessage(msg);
        if (post) window.TruthLensQueue.add(post);
      }
    });
  }

  // WhatsApp loads #main dynamically after user picks a chat
  // So we wait for it to appear before attaching the observer
  function waitForMain() {
    const main = document.querySelector("#main");
    if (!main) {
      setTimeout(waitForMain, 1000);
      return;
    }

    scanNode(main);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => scanNode(node));
      });
    });

    observer.observe(main, { childList: true, subtree: true });
    console.log("[TruthLens] WhatsApp scanner active");
  }

  waitForMain();
})();