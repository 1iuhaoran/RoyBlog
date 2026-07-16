const quotes = [
  { tag: "時事", title: "狗別叛國", body: "狗別叛國。", time: "2026-07-17" },
  { tag: "成長", title: "把變化留給時間，把判斷留給自己", body: "成長不是突然變強，而是慢慢學會把情緒放下，把邊界立住，把真正重要的事放在前面。", time: "2026-06-11" },
  { tag: "時間", title: "時間會篩掉熱鬧，留下結構", body: "很多事在當下看起來很大，過一段時間回頭看，只剩下做事的方法、說話的分寸和處理問題的習慣。", time: "2026-06-10" },
  { tag: "選擇", title: "選擇不是把所有門都打開", body: "選擇的價值在於承認成本。你決定往哪邊走，也是在決定哪些東西不再繼續占用你。", time: "2026-06-08" },
  { tag: "自省", title: "真正難的，是承認自己的盲點", body: "一個人開始穩定變好，通常不是因為更會表達，而是因為更願意修正自己。", time: "2026-06-06" },
  { tag: "成長", title: "把複雜的事做簡單，把簡單的事做扎實", body: "能長期成立的東西，往往沒有花俏的開場，只有反覆確認過的細節和持續投入的耐心。", time: "2026-06-04" },
  { tag: "時間", title: "能被時間留下來的，通常不喧嘩", body: "越往後看，越清楚高品質的內容、關係和決定都不是喧嘩的，它們更像穩定的底色。", time: "2026-06-02" }
];

const postList = document.getElementById("posts");
const postTemplate = document.getElementById("postTemplate");
const featuredQuote = document.getElementById("featuredQuote");
const quoteMeta = document.getElementById("quoteMeta");
const quoteCount = document.getElementById("quoteCount");
const activeTag = document.getElementById("activeTag");
const searchInput = document.getElementById("searchInput");
const tagChips = document.getElementById("tagChips");
const shuffleButton = document.getElementById("shuffleQuote");
const copyButton = document.getElementById("copyQuote");
const themeToggle = document.getElementById("themeToggle");
const state = { tag: "all", query: "", index: 0 };

function renderFeatured(index) {
  const item = quotes[index];
  featuredQuote.textContent = `「${item.body}」`;
  quoteMeta.textContent = `若愚公牘 · 第 ${String(index + 1).padStart(2, "0")} 則 · ${item.time}`;
}
function filteredQuotes() {
  const query = state.query.trim().toLocaleLowerCase();
  return quotes.filter((quote) => (state.tag === "all" || quote.tag === state.tag) && (!query || [quote.tag, quote.title, quote.body, quote.time].some((field) => field.toLocaleLowerCase().includes(query))));
}
function renderPosts() {
  const items = filteredQuotes();
  postList.replaceChildren();
  quoteCount.textContent = String(items.length);
  activeTag.textContent = state.tag === "all" ? "全部" : state.tag;
  if (!items.length) {
    const empty = document.createElement("article");
    empty.className = "post";
    empty.innerHTML = "<h3 class=\"post-title\">查無相符條目</h3><p class=\"post-body\">請更換檢索詞，或改選全部。</p>";
    postList.append(empty);
    return;
  }
  items.forEach((item) => {
    const node = postTemplate.content.cloneNode(true);
    node.querySelector(".post-tag").textContent = item.tag;
    node.querySelector(".post-time").dateTime = item.time;
    node.querySelector(".post-time").textContent = item.time;
    node.querySelector(".post-title").textContent = item.title;
    node.querySelector(".post-body").textContent = item.body;
    postList.append(node);
  });
}
tagChips.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (!chip) return;
  state.tag = chip.dataset.tag;
  document.querySelectorAll(".chip").forEach((button) => button.classList.toggle("active", button === chip));
  renderPosts();
});
searchInput.addEventListener("input", (event) => { state.query = event.target.value; renderPosts(); });
shuffleButton.addEventListener("click", () => { state.index = (state.index + 1 + Math.floor(Math.random() * (quotes.length - 1))) % quotes.length; renderFeatured(state.index); });
copyButton.addEventListener("click", async () => {
  const original = copyButton.textContent;
  try { await navigator.clipboard.writeText(featuredQuote.textContent); copyButton.textContent = "已抄錄"; } catch { copyButton.textContent = "抄錄失敗"; }
  setTimeout(() => { copyButton.textContent = original; }, 1200);
});
function setTheme(night) {
  document.body.classList.toggle("light", night);
  themeToggle.setAttribute("aria-label", night ? "切換紙本主題" : "切換夜讀主題");
  localStorage.setItem("ruoyu-theme", night ? "night" : "paper");
}
themeToggle.addEventListener("click", () => setTheme(!document.body.classList.contains("light")));
setTheme(localStorage.getItem("ruoyu-theme") === "night");
renderFeatured(state.index);
renderPosts();
