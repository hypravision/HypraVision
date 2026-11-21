HYPRA VISION AI - STARTER SETUP

Files included:
- Hypra Vision AI.html : upgraded frontend, same existing look
- hypra-vision-ai-server.js : Node.js backend; keeps API key off the HTML
- package.json : server dependencies and start command
- .env.example : environment variable template

IMPORTANT:
This is not yet deployed. The AI feature requires hosting the HTML and Node backend together on a service that supports Node.js, and setting GEMINI_API_KEY as a secret/environment variable in that host's dashboard.

Local setup:
1. Install Node.js LTS.
2. Put all files in one folder. Rename "Hypra Vision AI.html" to "index.html".
3. Copy .env.example to .env and add your Gemini API key. Do not share or upload .env.
4. In the folder terminal, run: npm install
5. Run: npm start
6. Open http://localhost:3000

For deployment, use a Node-compatible host (not static-only hosting unless it supports a separate backend/serverless function). Set the environment variable GEMINI_API_KEY in the host settings. Never place the key in the HTML file.
