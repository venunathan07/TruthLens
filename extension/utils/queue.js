// queue.js
window.TruthLensQueue = (function () {
  let queue = [];
  let timer = null;
  const DEBOUNCE_MS = 3000;
  const MAX_BATCH = 2;
  const STORAGE_KEY = "tl_stats";

  function getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    return new Date(now.setDate(now.getDate() - day)).toDateString();
  }

  function updateStats(results, batchSize) {
    chrome.storage.local.get([STORAGE_KEY], (data) => {
      let stats = data[STORAGE_KEY] || {
        scanned: 0, flagged: 0, correct: 0, categories: {}, weekStart: getWeekStart()
      };

      if (stats.weekStart !== getWeekStart()) {
        stats = { scanned: 0, flagged: 0, correct: 0, categories: {}, weekStart: getWeekStart() };
      }

      stats.scanned += batchSize;
      results.forEach((r) => {
        if (r.flagged) {
          stats.flagged += 1;
          const cat = r.category || "unknown";
          stats.categories[cat] = (stats.categories[cat] || 0) + 1;
        }
      });

      chrome.storage.local.set({ [STORAGE_KEY]: stats });
    });
  }

  function add(post) {
    if (queue.find((p) => p.id === post.id)) return;
    queue.push(post);
    if (queue.length >= MAX_BATCH) { flush(); return; }
    clearTimeout(timer);
    timer = setTimeout(flush, DEBOUNCE_MS);
  }

  function flush() {
    if (queue.length === 0) return;
    clearTimeout(timer);
    const batch = queue.splice(0, queue.length);
    try {
      chrome.runtime.sendMessage(
        { type: "ANALYZE_BATCH", posts: batch },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn("[TruthLens] Service worker unreachable:", chrome.runtime.lastError.message);
            return;
          }
          if (response?.success) {
            updateStats(response.results, batch.length);
            window.TruthLensBlur.applyResults(response.results);
          } else {
            console.warn("[TruthLens] Backend error:", response?.error);
          }
        }
      );
    } catch (e) {
      console.warn("[TruthLens] Runtime error:", e.message);
    }
  }

  return { add, flush };
})();
