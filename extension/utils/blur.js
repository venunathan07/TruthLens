window.TruthLensBlur = (function () {

  function applyResults(results) {
    if (!Array.isArray(results)) return;
    results.forEach((result) => {
      if (result.flagged && result.confidence >= 0.90) {
        const el = document.querySelector(`[data-tl-id="${result.id}"]`);
        if (el && !el.querySelector(".tl-overlay")) {
          applyBlur(el, result);
        }
      }
    });
  }

  function applyBlur(el, result) {
    el.style.filter = "blur(6px)";
    el.style.position = "relative";
    el.style.transition = "filter 0.3s ease";
    el.style.overflow = "visible";

    const overlay = document.createElement("div");
    overlay.className = "tl-overlay";
    overlay.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      border-radius: 8px;
      gap: 12px;
      padding: 16px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      pointer-events: auto;
    `;

    const label = document.createElement("div");
    label.style.cssText = `
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      background: rgba(220, 38, 38, 0.95);
      padding: 6px 14px;
      border-radius: 20px;
      text-align: center;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      max-width: 100%;
    `;
    label.textContent = `WARNING: ${result.category || "Possible Misinformation"} - ${Math.round(result.confidence * 100)}% confidence`;

    const btnRow = document.createElement("div");
    btnRow.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      max-width: 100%;
    `;

    const showBtn = document.createElement("button");
    showBtn.textContent = "Show Anyway";
    showBtn.style.cssText = buttonStyle("#6b7280");
    showBtn.onclick = (e) => {
      e.stopPropagation();
      el.style.filter = "none";
      overlay.remove();
    };

    const whyBtn = document.createElement("button");
    whyBtn.textContent = "Why flagged?";
    whyBtn.style.cssText = buttonStyle("#2563eb");
    whyBtn.onclick = (e) => {
      e.stopPropagation();
      showExplanation(el, result);
    };

    btnRow.appendChild(showBtn);
    btnRow.appendChild(whyBtn);
    overlay.appendChild(label);
    overlay.appendChild(btnRow);

    el.appendChild(overlay);
  }

  function showExplanation(el, result) {
    const existing = document.querySelector(".tl-explanation");
    if (existing) existing.remove();

    const box = document.createElement("div");
    box.className = "tl-explanation";
    box.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 320px;
      max-width: calc(100vw - 48px);
      background: #1e1e2e;
      color: #cdd6f4;
      border-radius: 12px;
      padding: 16px;
      z-index: 9999999;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      line-height: 1.5;
      box-sizing: border-box;
    `;

    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <strong style="color:#f38ba8;">Why TruthLens flagged this</strong>
        <span style="cursor:pointer;font-size:16px;" id="tl-close">X</span>
      </div>
      <div style="margin-bottom:8px;">
        <span style="background:#313244;padding:2px 8px;border-radius:12px;font-size:11px;">
          ${result.category || "Misinformation"}
        </span>
        <span style="margin-left:8px;color:#a6e3a1;">
          ${Math.round(result.confidence * 100)}% confidence
        </span>
      </div>
      <p style="margin:0 0 12px 0;">${result.explanation || "This content was flagged as potentially misleading."}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button id="tl-correct" style="${buttonStyle("#166534")}">Correctly flagged</button>
        <button id="tl-wrong" style="${buttonStyle("#7f1d1d")}">Wrong flag</button>
      </div>
    `;

    document.body.appendChild(box);

    document.getElementById("tl-close").onclick = () => box.remove();
    document.getElementById("tl-correct").onclick = () => {
      sendFeedback(result.id, true);
      box.remove();
    };
    document.getElementById("tl-wrong").onclick = () => {
      sendFeedback(result.id, false);
      box.remove();
    };
  }

  function sendFeedback(postId, correct) {
    chrome.runtime.sendMessage({
      type: "SUBMIT_FEEDBACK",
      feedback: { post_id: postId, correct, timestamp: Date.now() },
    });
  }

  function buttonStyle(bg) {
    return `
      background: ${bg};
      color: #fff;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;
  }

  return { applyResults };
})();
