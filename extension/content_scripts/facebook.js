// facebook.js
// Target: div[data-pagelet] — stable across Facebook deploys.
// Facebook also obfuscates class names so we avoid them.

(function () {
  let postCount = 0;

  function extractPost(el) {
    // Facebook puts post text in [data-ad-preview="message"] or divs with dir="auto"
    const textEl =
      el.querySelector('[data-ad-preview="message"]') ||
      el.querySelector('div[dir="auto"]');

    const text = textEl ? textEl.innerText.trim() : "";
    if (!text || text.length < 20) return null;

    const id = `fb-${encodeURIComponent(text.slice(0, 80)).replace(/[^a-z0-9]/gi, "").slice(0, 16)}-${postCount++}`;
    el.setAttribute("data-tl-id", id);

    const imgEls = el.querySelectorAll("img[referrerpolicy]");
    const images = Array.from(imgEls).map((img) => img.src).slice(0, 2);

    return { id, text, images, platform: "facebook" };
  }

  function scanNode(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const posts = node.querySelectorAll
      ? node.querySelectorAll("div[data-pagelet]")
      : [];

    posts.forEach((post) => {
      if (!post.hasAttribute("data-tl-id")) {
        const extracted = extractPost(post);
        if (extracted) window.TruthLensQueue.add(extracted);
      }
    });
  }

  scanNode(document.body);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => scanNode(node));
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
  console.log("[TruthLens] Facebook scanner active");
})();