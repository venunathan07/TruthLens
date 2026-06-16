const STORAGE_KEY = "tl_stats";
function getWeekStart() { const now = new Date(); const day = now.getDay(); return new Date(now.setDate(now.getDate() - day)).toDateString(); }
function getStats() { return new Promise((resolve) => { chrome.storage.local.get([STORAGE_KEY], (result) => { resolve(result[STORAGE_KEY] || { scanned: 0, flagged: 0, correct: 0, categories: {}, weekStart: getWeekStart() }); }); }); }
function renderStats(stats) {
  const flagRate = stats.scanned > 0 ? Math.round((stats.flagged / stats.scanned) * 100) : 0;
  document.getElementById("total-scanned").textContent = stats.scanned;
  document.getElementById("total-flagged").textContent = stats.flagged;
  document.getElementById("total-correct").textContent = stats.correct;
  document.getElementById("flag-rate").textContent = flagRate + "%";
  const catList = document.getElementById("category-list");
  const cats = stats.categories || {};
  const entries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) { catList.innerHTML = "<div class=empty>No flags yet this week</div>"; return; }
  const max = entries[0][1];
  catList.innerHTML = entries.map(function(e) { var cat=e[0],count=e[1],pct=Math.round((count/max)*100); return "<div class=category-row><span class=category-name>"+cat+"</span><div class=category-bar-wrap><div class=category-bar style=\"width:"+pct+"%\"></div></div><span class=category-count>"+count+"</span></div>"; }).join("");
}
document.getElementById("reset-btn").addEventListener("click", function() { chrome.storage.local.set({ [STORAGE_KEY]: { scanned: 0, flagged: 0, correct: 0, categories: {}, weekStart: getWeekStart() } }, function() { renderStats({ scanned: 0, flagged: 0, correct: 0, categories: {} }); }); });
getStats().then(renderStats);
