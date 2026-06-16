// instagram.js
(function () {
  let postCount = 0;

  function extractPost(article) {
    const spans = article.querySelectorAll("span");
    let text = "";
    spans.forEach((span) => {
      if (span.innerText && span.innerText.length > 40) {
        text = span.innerText.trim();
      }
    });
    if (!text) return null;

    let encoded = "post";
    try {
      encoded = encodeURIComponent(text.slice(0, 80)).replace(/[^a-z0-9]/gi, "").slice(0, 16) || "post";
    } catch (e) {
      encoded = "post" + postCount;
    }

    const id = ig--;
    article.setAttribute("data-tl-id", id);

    const imgEls = article.querySelectorAll("img[srcset]");
    const images = Array.from(imgEls).map((img) => img.src).slice(0, 2);

    return { id, text, images, platform: "instagram" };
  }

  function scanNode(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    if (node.matches("article")) {
      if (!node.hasAttribute("data-tl-id")) {
        const post = extractPost(node);
        if (post) window.TruthLensQueue.add(post);
      }
    }

    const articles = node.querySelectorAll("article");
    articles.forEach((article) => {
      if (!article.hasAttribute("data-tl-id")) {
        const post = extractPost(article);
        if (post) window.TruthLensQueue.add(post);
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
  console.log("[TruthLens] Instagram scanner active");
})();
