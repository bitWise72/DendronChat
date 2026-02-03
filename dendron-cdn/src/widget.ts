class DendronWidget extends HTMLElement {
  shadow: ShadowRoot;
  config: any = {};
  panelOpen = false;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "closed" });
    this.render();
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
        <button class="dendron-button" id="toggle">
            ${this.config.mascotUrl
        ? `<img src="${this.config.mascotUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
        : "💬"
      }
        </button>
      </div>
    `;

    this.shadow.getElementById("toggle")!.onclick = () => this.togglePanel();
  }

  togglePanel() {
    this.panelOpen = !this.panelOpen;
    const existing = this.shadow.querySelector(".dendron-panel");
    if (existing) {
      existing.remove();
      return;
    }

    const panel = document.createElement("div");
    panel.className = "dendron-panel";
    panel.innerHTML = `
      <div class="dendron-header">
        <span>${this.config.name || "Assistant"}</span>
      </div>
      <div class="dendron-body" id="messages"></div>
      <div class="dendron-input">
        <input type="text" placeholder="Ask me anything..." id="input-field" />
        <button id="send-btn">Send</button>
      </div>
    `;

    this.shadow.querySelector(".dendron-widget")!.appendChild(panel);

    const input = this.shadow.getElementById("input-field") as HTMLInputElement;
    const sendBtn = this.shadow.getElementById("send-btn") as HTMLButtonElement;
    const messagesEl = this.shadow.getElementById("messages") as HTMLElement;

    sendBtn.onclick = () => this.sendMessage(input.value, messagesEl, input);
    input.onkeydown = (e) => {
      if (e.key === "Enter") this.sendMessage(input.value, messagesEl, input);
    };
  }

  async sendMessage(text: string, messagesEl: HTMLElement, input: HTMLInputElement) {
    if (!text.trim()) return;

    const userMsg = document.createElement("div");
    userMsg.className = "msg-user";
    userMsg.textContent = text;
    messagesEl.appendChild(userMsg);
    input.value = "";

    const assistantMsg = document.createElement("div");
    assistantMsg.className = "msg-assistant";
    assistantMsg.textContent = "...";
    messagesEl.appendChild(assistantMsg);

    try {
      const resp = await fetch(this.config.chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: this.config.projectId, message: text })
      });
      if (resp.ok) {
        const json = await resp.json();
        assistantMsg.textContent = json.answer || "(no response)";
      } else {
        assistantMsg.textContent = "(error)";
      }
    } catch (e) {
      assistantMsg.textContent = "(network error)";
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

customElements.define("dendron-widget", DendronWidget);
export { DendronWidget };
