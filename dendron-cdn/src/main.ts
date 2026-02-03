import "./widget";

declare global {
    interface Window {
        Dendron?: any;
    }
}

function getScriptConfig() {
    const script = document.currentScript as HTMLScriptElement | null;
    if (!script) return null;
    return {
        projectRef: script.dataset.projectRef,
        projectId: script.dataset.projectId,
        mascotUrl: script.dataset.mascotUrl
    };
}

window.Dendron = {
    init: async function (opts?: { projectId?: string; projectRef?: string; endpointUrl?: string; mascotUrl?: string }) {
        const scriptConfig = getScriptConfig();
        const projectId = opts?.projectId || scriptConfig?.projectId;
        const projectRef = opts?.projectRef || scriptConfig?.projectRef;
        const mascotUrl = opts?.mascotUrl || scriptConfig?.mascotUrl;

        if (!projectId || !projectRef) {
            console.error("Dendron: projectId and projectRef are required.");
            return;
        }

        const endpointUrl = opts?.endpointUrl || `https://${projectRef}.functions.supabase.co/chat`;

        const root = document.createElement("div");
        document.body.appendChild(root);
        const w = document.createElement("dendron-widget");
        (w as any).config = {
            projectId: projectId,
            chatEndpoint: endpointUrl,
            mascotUrl: mascotUrl
        };
        root.appendChild(w);
    }
};

const autoConfig = getScriptConfig();
if (autoConfig?.projectId && autoConfig?.projectRef) {
    window.Dendron.init();
}
