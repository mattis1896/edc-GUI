const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");
const { exec } = require("child_process");
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");

const app = express();
const PORT = 3000;

// Live-Reload-Server starten
const liveReloadServer = livereload.createServer({
    exts: ["html", "css", "js"]
});
liveReloadServer.watch(__dirname);
app.use(connectLivereload());

// HTTP-Server erstellen
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Statische Ordner bereitstellen
app.use(express.static(path.join(__dirname, "html")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/pictures", express.static(path.join(__dirname, "pictures"))); // Bilder-Ordner
app.use("/daten", express.static(path.join(__dirname, "daten"))); // JSON-Ordner

// WebSocket-Handling
wss.on("connection", (ws) => {
    console.log("✅ Ein Client hat sich verbunden.");

    ws.on("message", (message) => {
        const command = message.toString().trim(); // Buffer in String umwandeln
        console.log(`📩 Befehl erhalten: ${command}`);

        if (!command) {
            ws.send("⚠️ Fehler: Kein Befehl gesendet.");
            return;
        }

        // Befehl ausführen
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Fehler: ${error.message}`);
                ws.send(`⚠️ Fehler: ${error.message}`);
                return;
            }
            if (stderr) {
                console.warn(`⚠️ stderr: ${stderr}`);
                ws.send(`⚠️ stderr: ${stderr}`);
                return;
            }
            ws.send(`📡 Ergebnis:\n${stdout}`);
        });
    });

    ws.on("close", () => console.log("❌ Client hat die Verbindung geschlossen."));
});

// Standardseite
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "html", "configuration.html"));
});

// Server starten
server.listen(PORT, () => {
    console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
