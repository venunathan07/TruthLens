// linkedin.js
// Target: .feed-shared-update-v2 — stable LinkedIn feed selector.

(function () {
  let postCount = 0;

  function extractPost(el) {
    const textEl =
      el.querySelector(".feed-shared-update-v2__description") ||
      el.querySelector(".update-components-text") ||
      el.querySelector("span[dir='ltr']");

    const text = textEl ? textEl.innerText.trim() : "";
    if (!text || text.length < 20) return null;

    const id = `li-${encodeURIComponent(text.slice(0, 80)).replace(/[^a-z0-9]/gi, "").slice(0, 16)}-${postCount++}`;
    el.setAttribute("data-tl-id", id);

    return { id, text, images: [], platform: "linkedin" };
  }

  function scanNode(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const posts = node.querySelectorAll
      ? node.querySelectorAll(".feed-shared-update-v2")
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
  console.log("[TruthLens] LinkedIn scanner active");
})();