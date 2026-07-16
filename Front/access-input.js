(() => {
  const acceptedHashes = new Set([
    "6232353df637933e9d1f86ebb2c71afecda1888fefcfeb954c08228da29d13bd",
    "75383a80e22805525330b66fc7894e0a693b69f1c327974b6175b16a9499dce0"
  ]);

  async function digest(value) {
    const bytes = new TextEncoder().encode(value.trim());
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  const form = document.getElementById("accessForm");
  const input = document.getElementById("accessPassword");
  const message = document.getElementById("accessMessage");
  if (!form || !input || !message) return;

  // A text input cooperates more reliably with Windows Chinese IMEs than a password input.
  // The characters are still visually masked in Chromium-based browsers.
  input.type = "text";
  input.setAttribute("lang", "zh-CN");
  input.setAttribute("inputmode", "text");
  input.setAttribute("autocomplete", "off");
  input.style.webkitTextSecurity = "disc";
  input.style.textSecurity = "disc";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    message.textContent = "正在核驗…";
    try {
      if (acceptedHashes.has(await digest(input.value))) {
        sessionStorage.setItem("royblog-access", "granted");
        document.body.classList.remove("access-locked");
        document.querySelector(".access-gate")?.remove();
        input.value = "";
      } else {
        message.textContent = "口令不正確，請再試一次。";
        input.select();
      }
    } catch {
      message.textContent = "無法核驗口令，請使用現代瀏覽器。";
    }
  }, true);
})();
