const PASSWORD_HASH = "6232353df637933e9d1f86ebb2c71afecda1888fefcfeb954c08228da29d13bd";

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function installAccessGate() {
  if (sessionStorage.getItem("royblog-access") === "granted") return;

  const style = document.createElement("style");
  style.textContent = `
    body.access-locked { overflow: hidden; }
    body.access-locked > :not(.access-gate) { filter: blur(12px); pointer-events: none; user-select: none; }
    .access-gate { position: fixed; inset: 0; z-index: 99; display: grid; place-items: center; padding: 20px; background: rgba(42, 32, 20, .34); backdrop-filter: blur(7px); }
    .access-card { width: min(100%, 420px); padding: 34px; color: #29251f; background: #fbf6e9; border: 1px solid #b9aa90; border-top: 5px solid #9b3027; box-shadow: 0 24px 70px rgba(47, 31, 13, .28); }
    .access-card__kicker { margin: 0 0 10px; color: #9b3027; font: 700 .78rem/1.3 system-ui, sans-serif; letter-spacing: .14em; }
    .access-card h2 { margin: 0; font: 2rem/1.2 "DFKai-SB", "KaiTi", "STKaiti", serif; letter-spacing: .08em; }
    .access-card__copy { margin: 18px 0 24px; color: #62594a; line-height: 1.8; }
    .access-card label { display: grid; gap: 8px; color: #51493e; font-size: .9rem; }
    .access-card input { width: 100%; padding: 12px; color: #29251f; background: #fffaf0; border: 1px solid #a99a7d; border-radius: 2px; outline: none; }
    .access-card input:focus { border-color: #9b3027; box-shadow: 0 0 0 3px rgba(155,48,39,.12); }
    .access-card button { width: 100%; margin-top: 16px; padding: 12px; color: #fff8e8; background: #9b3027; border: 1px solid #9b3027; border-radius: 2px; cursor: pointer; font-weight: 700; }
    .access-card button:hover { background: #7e241e; }
    .access-card__message { min-height: 1.5em; margin: 12px 0 0; color: #9b3027; font-size: .9rem; }
  `;
  document.head.append(style);

  const gate = document.createElement("section");
  gate.className = "access-gate";
  gate.innerHTML = `
    <div class="access-card" role="dialog" aria-modal="true" aria-labelledby="accessTitle">
      <p class="access-card__kicker">若愚字第 1150717 號</p>
      <h2 id="accessTitle">若愚公牘</h2>
      <p class="access-card__copy">本站僅供受邀閱覽。請輸入通行口令後閱覽全文。</p>
      <form id="accessForm">
        <label>通行口令<input id="accessPassword" type="password" autocomplete="current-password" required autofocus /></label>
        <button type="submit">入牘閱覽</button>
        <p class="access-card__message" id="accessMessage" aria-live="polite"></p>
      </form>
    </div>`;
  document.body.prepend(gate);
  document.body.classList.add("access-locked");

  const form = gate.querySelector("#accessForm");
  const input = gate.querySelector("#accessPassword");
  const message = gate.querySelector("#accessMessage");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "正在核驗…";
    try {
      if (await sha256(input.value) === PASSWORD_HASH) {
        sessionStorage.setItem("royblog-access", "granted");
        document.body.classList.remove("access-locked");
        gate.remove();
        input.value = "";
      } else {
        message.textContent = "口令不正確，請再試一次。";
        input.select();
      }
    } catch {
      message.textContent = "無法核驗口令，請使用現代瀏覽器。";
    }
  });
}

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
installAccessGate();
