// twitter.js
(function () {
  let postCount = 0;

  function extractPost(article) {
    const textEl = article.querySelector('[data-testid="tweetText"]');
    const text = textEl ? textEl.innerText.trim() : "";
    if (!text) return null;

    // Fix: use encodeURIComponent to handle emojis and non-Latin characters
    const encoded = encodeURIComponent(text.slice(0, 80))
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, 16);
    const id = `tw-${encoded}-${postCount++}`;
    article.setAttribute("data-tl-id", id);

    const imgEls = article.querySelectorAll('img[src*="pbs.twimg.com/media"]');
    const images = Array.from(imgEls).map((img) => img.src).slice(0, 2);

    return { id, text, images, platform: "twitter" };
  }

  function scanNode(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    if (node.matches('article[data-testid="tweet"]')) {
      if (!node.hasAttribute("data-tl-id")) {
        const post = extractPost(node);
        if (post) window.TruthLensQueue.add(post);
      }
    }

    const tweets = node.querySelectorAll('article[data-testid="tweet"]');
    tweets.forEach((tweet) => {
      if (!tweet.hasAttribute("data-tl-id")) {
        const post = extractPost(tweet);
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
  console.log("[TruthLens] Twitter scanner active");
})();