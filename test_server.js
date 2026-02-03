const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Serve test_index.html properly
    if (req.url === '/' || req.url === '/test_index.html') {
        fs.readFile(path.join(__dirname, 'test_index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading file');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
        return;
    }

    // Mock Chat Endpoint (simulating Supabase Edge Function)
    if (req.url === '/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const { message } = JSON.parse(body);
            console.log("Received chat message:", message);

            const response = {
                answer: `[MOCK BACKEND] I received your message: "${message}". The logic works! This response mimics a real Supabase Edge Function.`
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
        });
        return;
    }

    // Config Endpoint (if CDN fetches it)
    if (req.url === '/chat/config' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            mascot_url: "https://api.iconify.design/lucide:bot.svg",
            theme_color: "#10b981",
            assistant_name: "Local Bot"
        }));
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
