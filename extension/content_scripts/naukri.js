// naukri.js
// Target: .jobTuple — stable Naukri job card selector.
// Focus: fake job postings, fraudulent placement stats, scammy course agencies.

(function () {
  let postCount = 0;

  function extractJob(el) {
    const titleEl =
      el.querySelector(".title") ||
      el.querySelector("a.title");

    const companyEl =
      el.querySelector(".subTitle") ||
      el.querySelector(".comp-name");

    const descEl =
      el.querySelector(".job-description") ||
      el.querySelector(".ellipsis");

    const title = titleEl ? titleEl.innerText.trim() : "";
    const company = companyEl ? companyEl.innerText.trim() : "";
    const desc = descEl ? descEl.innerText.trim() : "";

    const text = `${title} at ${company}. ${desc}`.trim();
    if (!text || text.length < 15) return null;

    const id = `nk-${encodeURIComponent(text.slice(0, 80)).replace(/[^a-z0-9]/gi, "").slice(0, 16)}-${postCount++}`;
    el.setAttribute("data-tl-id", id);

    return { id, text, images: [], platform: "naukri" };
  }

  function scanNode(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const jobs = node.querySelectorAll
      ? node.querySelectorAll(".jobTuple, .job-post")
      : [];

    jobs.forEach((job) => {
      if (!job.hasAttribute("data-tl-id")) {
        const extracted = extractJob(job);
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
  console.log("[TruthLens] Naukri scanner active");
})();