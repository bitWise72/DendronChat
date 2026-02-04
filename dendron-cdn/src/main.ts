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
        // initial mascot/theme might be undefined until fetched

        if (!projectId || !projectRef) {
            console.error("Dendron: projectId and projectRef are required.");
            return;
        }

        const endpointUrl = opts?.endpointUrl || `https://${projectRef}.supabase.co/functions/v1/chat`;

        // FETCH REMOTE CONFIG
        let remoteConfig: any = {};
        try {
            const res = await fetch(`${endpointUrl}?project_id=${projectId}`);
            if (res.ok) {
                remoteConfig = await res.json();
            }
        } catch (e) {
            console.warn("Dendron: Failed to load remote config", e);
        }

        // Merge: Opts > Script > Remote
        const mascotUrl = opts?.mascotUrl || scriptConfig?.mascotUrl || remoteConfig.mascot_url;
        const themeColor = remoteConfig.theme_color || "#111827";
        const name = remoteConfig.assistant_name || "Assistant";

        const root = document.createElement("div");
        document.body.appendChild(root);
        const w = document.createElement("dendron-widget");
        (w as any).config = {
            projectId: projectId,
            chatEndpoint: endpointUrl,
            mascotUrl: mascotUrl,
            themeColor: themeColor,
            name: name
        };
        root.appendChild(w);
    }
};

const autoConfig = getScriptConfig();
if (autoConfig?.projectId && autoConfig?.projectRef) {
    window.Dendron.init();
}
