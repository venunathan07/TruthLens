const BACKEND_URL = "https://truthlens-2a36.onrender.com";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ANALYZE_BATCH") {
    analyzeBatch(message.posts)
      .then((data) => sendResponse({ success: true, results: data.results }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // keeps message channel open for async response
  }

  if (message.type === "SUBMIT_FEEDBACK") {
    submitFeedback(message.feedback)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

async function analyzeBatch(posts) {
  const response = await fetch(`${BACKEND_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ posts }),
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  return await response.json();
}

async function submitFeedback(feedback) {
  const response = await fetch(`${BACKEND_URL}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feedback),
  });

  if (!response.ok) {
    throw new Error(`Feedback error: ${response.status}`);
  }

  return await response.json();
}