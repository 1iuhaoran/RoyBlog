const quotes = [
  { tag: "成长", title: "把变化留给时间，把判断留给自己", body: "成长不是突然变强，而是慢慢学会把情绪放下，把边界立住，把真正重要的事放在前面。", time: "2026-06-11" },
  { tag: "时间", title: "时间会筛掉热闹，留下结构", body: "很多事在当下看起来很大，过一段时间回头看，只剩下做事的方法、说话的分寸和处理问题的习惯。", time: "2026-06-10" },
  { tag: "选择", title: "选择不是把所有门都打开", body: "选择的价值在于承认成本。你决定往哪边走，也是在决定哪些东西不再继续占用你。", time: "2026-06-08" },
  { tag: "自省", title: "真正难的，是承认自己的盲点", body: "一个人开始稳定变好，通常不是因为更会表达，而是因为更愿意修正自己。", time: "2026-06-06" },
  { tag: "成长", title: "把复杂的事做简单，把简单的事做扎实", body: "能长期成立的东西，往往没有花哨的开场，只有反复确认过的细节和持续投入的耐心。", time: "2026-06-04" },
  { tag: "时间", title: "能被时间留下来的，通常不喧哗", body: "越往后看，越清楚高质量的内容、关系和决定都不是喧哗的，它们更像稳定的底色。", time: "2026-06-02" }
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
  featuredQuote.textContent = `“${item.body}”`;
  quoteMeta.textContent = `若愚 · 语录第 ${String(index + 1).padStart(2, "0")} 条`;
}

function filteredQuotes() {
  const query = state.query.trim().toLocaleLowerCase();
  return quotes.filter((quote) => {
    const tagMatch = state.tag === "all" || quote.tag === state.tag;
    const searchMatch = !query || [quote.tag, quote.title, quote.body, quote.time].some((field) => field.toLocaleLowerCase().includes(query));
    return tagMatch && searchMatch;
  });
}

function renderPosts() {
  const items = filteredQuotes();
  postList.replaceChildren();
  quoteCount.textContent = String(items.length);
  activeTag.textContent = state.tag === "all" ? "全部" : state.tag;
  if (!items.length) {
    const empty = document.createElement("article");
    empty.className = "post";
    empty.innerHTML = "<h3 class=\"post-title\">没有找到匹配的语录</h3><p class=\"post-body\">换个关键词，或切回“全部”。</p>";
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
shuffleButton.addEventListener("click", () => {
  let nextIndex = Math.floor(Math.random() * quotes.length);
  if (quotes.length > 1 && nextIndex === state.index) nextIndex = (nextIndex + 1) % quotes.length;
  state.index = nextIndex;
  renderFeatured(nextIndex);
});
copyButton.addEventListener("click", async () => {
  const originalText = copyButton.textContent;
  try { await navigator.clipboard.writeText(featuredQuote.textContent); copyButton.textContent = "已复制"; }
  catch { copyButton.textContent = "复制失败"; }
  setTimeout(() => { copyButton.textContent = originalText; }, 1200);
});
function setTheme(light) {
  document.body.classList.toggle("light", light);
  themeToggle.setAttribute("aria-label", light ? "切换深色主题" : "切换浅色主题");
  localStorage.setItem("ruoyu-theme", light ? "light" : "dark");
}
themeToggle.addEventListener("click", () => setTheme(!document.body.classList.contains("light")));
setTheme(localStorage.getItem("ruoyu-theme") === "light");
renderFeatured(state.index);
renderPosts();
