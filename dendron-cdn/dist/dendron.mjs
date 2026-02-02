class p extends HTMLElement {
  constructor() {
    super(), this.config = {}, this.panelOpen = !1, this.shadow = this.attachShadow({ mode: "closed" }), this.render();
  }
  render() {
    this.shadow.innerHTML = `
      <style>
        .dendron-widget {
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 2147483647;
        }
        .dendron-button {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          box-shadow: 0 6px 18px rgba(0,0,0,0.16);
          display: grid;
          place-items: center;
          background: #111827;
          color: white;
          border: none;
          cursor: pointer;
          font-size: 20px;
        }
        .dendron-panel {
          position: absolute;
          bottom: 70px;
          right: 0;
          width: 360px;
          max-height: 500px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 12px 48px rgba(0,0,0,0.2);
          background: white;
          display: flex;
          flex-direction: column;
        }
        .dendron-header {
          padding: 12px;
          display: flex;
          gap: 8px;
          align-items: center;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          font-weight: 600;
        }
        .dendron-body {
          padding: 12px;
          flex: 1;
          overflow: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-height: 200px;
        }
        .dendron-input {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid rgba(0,0,0,0.06);
        }
        .dendron-input input {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.12);
          font-size: 14px;
        }
        .dendron-input button {
          padding: 10px 16px;
          border-radius: 8px;
          background: #111827;
          color: white;
          border: none;
          cursor: pointer;
        }
        .msg-user { text-align: right; color: #333; }
        .msg-assistant { text-align: left; color: #1e40af; }
      </style>
      <div class="dendron-widget">
        <button class="dendron-button" id="toggle">💬</button>
      </div>
    `, this.shadow.getElementById("toggle").onclick = () => this.togglePanel();
  }
  togglePanel() {
    this.panelOpen = !this.panelOpen;
    const n = this.shadow.querySelector(".dendron-panel");
    if (n) {
      n.remove();
      return;
    }
    const d = document.createElement("div");
    d.className = "dendron-panel", d.innerHTML = `
      <div class="dendron-header">
        <span>${this.config.name || "Assistant"}</span>
      </div>
      <div class="dendron-body" id="messages"></div>
      <div class="dendron-input">
        <input type="text" placeholder="Ask me anything..." id="input-field" />
        <button id="send-btn">Send</button>
      </div>
    `, this.shadow.querySelector(".dendron-widget").appendChild(d);
    const o = this.shadow.getElementById("input-field"), r = this.shadow.getElementById("send-btn"), t = this.shadow.getElementById("messages");
    r.onclick = () => this.sendMessage(o.value, t, o), o.onkeydown = (i) => {
      i.key === "Enter" && this.sendMessage(o.value, t, o);
    };
  }
  async sendMessage(n, d, o) {
    if (!n.trim()) return;
    const r = document.createElement("div");
    r.className = "msg-user", r.textContent = n, d.appendChild(r), o.value = "";
    const t = document.createElement("div");
    t.className = "msg-assistant", t.textContent = "...", d.appendChild(t);
    try {
      const i = await fetch(this.config.chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: this.config.projectId, message: n })
      });
      if (i.ok) {
        const c = await i.json();
        t.textContent = c.answer || "(no response)";
      } else
        t.textContent = "(error)";
    } catch {
      t.textContent = "(network error)";
    }
    d.scrollTop = d.scrollHeight;
  }
}
customElements.define("dendron-widget", p);
function a() {
  const e = document.currentScript;
  return e ? {
    projectRef: e.dataset.projectRef,
    projectId: e.dataset.projectId
  } : null;
}
window.Dendron = {
  init: async function(e) {
    const n = a(), d = (e == null ? void 0 : e.projectId) || (n == null ? void 0 : n.projectId), o = (e == null ? void 0 : e.projectRef) || (n == null ? void 0 : n.projectRef);
    if (!d || !o) {
      console.error("Dendron: projectId and projectRef are required.");
      return;
    }
    const r = (e == null ? void 0 : e.endpointUrl) || `https://${o}.functions.supabase.co/chat`, t = document.createElement("div");
    document.body.appendChild(t);
    const i = document.createElement("dendron-widget");
    i.config = {
      projectId: d,
      chatEndpoint: r
    }, t.appendChild(i);
  }
};
const s = a();
s != null && s.projectId && (s != null && s.projectRef) && window.Dendron.init();
