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

    const overlay = document.createElement("div");
    overlay.className = "tl-overlay";
    overlay.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      border-radius: 8px;
      gap: 14px;
      padding: 20px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    const label = document.createElement("div");
    label.style.cssText = `
      color: #fff;
      font-size: 14px;
      font-weight: 800;
      background: #dc2626;
      padding: 9px 18px;
      border-radius: 22px;
      text-align: center;
      letter-spacing: 0.3px;
      box-shadow: 0 4px 14px rgba(220, 38, 38, 0.5);
      border: 2px solid rgba(255,255,255,0.25);
      max-width: 100%;
    `;
    label.textContent = `⚠ ${(result.category || "Possible Misinformation").toUpperCase()} · ${Math.round(result.confidence * 100)}% CONFIDENCE`;

    const btnRow = document.createElement("div");
    btnRow.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
      max-width: 100%;
    `;

    const showBtn = document.createElement("button");
    showBtn.textContent = "Show Anyway";
    showBtn.style.cssText = buttonStyle("#ffffff", "#111827", "#ffffff");
    showBtn.onmouseenter = () => (showBtn.style.transform = "scale(1.05)");
    showBtn.onmouseleave = () => (showBtn.style.transform = "scale(1)");
    showBtn.onclick = (e) => {
      e.stopPropagation();
      el.style.filter = "none";
      overlay.remove();
    };

    const whyBtn = document.createElement("button");
    whyBtn.textContent = "Why flagged?";
    whyBtn.style.cssText = buttonStyle("#2563eb", "#ffffff", "#2563eb");
    whyBtn.onmouseenter = () => (whyBtn.style.transform = "scale(1.05)");
    whyBtn.onmouseleave = () => (whyBtn.style.transform = "scale(1)");
    whyBtn.onclick = (e) => {
      e.stopPropagation();
      showExplanation(el, result);
    };

    btnRow.appendChild(showBtn);
    btnRow.appendChild(whyBtn);
    overlay.appendChild(label);
    overlay.appendChild(btnRow);

    el.style.position = "relative";
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
      color: #f1f1f6;
      border-radius: 12px;
      padding: 18px;
      z-index: 9999999;
      box-shadow: 0 10px 40px rgba(0,0,0,0.6);
      border: 1px solid rgba(255,255,255,0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      line-height: 1.5;
      box-sizing: border-box;
    `;

    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <strong style="color:#f38ba8;font-size:14px;">🔍 Why TruthLens flagged this</strong>
        <span style="cursor:pointer;font-size:18px;color:#fff;line-height:1;" id="tl-close">✕</span>
      </div>
      <div style="margin-bottom:10px;">
        <span style="background:#dc2626;color:#fff;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;">
          ${(result.category || "Misinformation").toUpperCase()}
        </span>
        <span style="margin-left:8px;color:#a6e3a1;font-weight:700;">
          ${Math.round(result.confidence * 100)}% confidence
        </span>
      </div>
      <p style="margin:0 0 14px 0;">${result.explanation || "This content was flagged as potentially misleading."}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button id="tl-correct" style="${buttonStyle("#16a34a", "#ffffff", "#16a34a")}">✓ Correctly flagged</button>
        <button id="tl-wrong" style="${buttonStyle("#dc2626", "#ffffff", "#dc2626")}">✗ Wrong flag</button>
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

  function buttonStyle(bg, color, borderColor) {
    return `
      background: ${bg};
      color: ${color};
      border: 2px solid ${borderColor};
      padding: 9px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 3px 10px rgba(0,0,0,0.4);
      transition: transform 0.15s ease;
    `;
  }

  return { applyResults };
})();
