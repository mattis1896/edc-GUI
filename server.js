const http = require("http");
const express = require("express");
const WebSocket = require("ws");
const path = require("path");
const { spawn } = require("child_process");

const app = express();

// HTTP-Server erstellen
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Statische Ordner bereitstellen
app.use(express.static(path.join(__dirname, "html")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/pictures", express.static(path.join(__dirname, "pictures")));
app.use("/daten", express.static(path.join(__dirname, "daten")));

// WebSocket-Handling
wss.on("connection", (ws) => {
    console.log("Ein Client hat sich verbunden.");

    ws.on("message", (message) => {
        const command = message.toString().trim(); // Buffer in String umwandeln
        console.log(`Befehl erhalten: ${command}`);

        if (!command) {
            ws.send("Fehler: Kein Befehl gesendet.");
            return;
        }

        // Befehl mit `spawn` ausführen
        const child = spawn(command, { shell: true });

        // Ausgabe des Befehls in Echtzeit senden
        child.stdout.on("data", (data) => {
            console.log("stdout:", data.toString());
            ws.send(data.toString());
        });

        // Fehlerausgabe senden
        child.stderr.on("data", (data) => {
            console.error("stderr:", data.toString());
            ws.send("Fehler: " + data.toString());
        });

        // Prozessende loggen
        child.on("close", (code) => {
            console.log(`Prozess beendet mit Code ${code}`);
            ws.send(`Prozess beendet mit Code ${code}`);
        });

        child.on("error", (error) => {
            console.error("Fehler beim Starten des Prozesses:", error);
            ws.send("Fehler beim Starten des Prozesses: " + error.message);
        });
    });

    ws.on("close", () => console.log("Client hat die Verbindung geschlossen."));
});

// Standardseite
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "html", "configuration.html"));
});

// Server starten
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));


app.get("/api/host-ip", (req, res) => {
    res.json({ hostIp: process.env.HOST_IP });
});

app.get("/api/contractNegotiation", async (req, res) => {
    try {
        const value = await testReadJson("192.168.2.18", "wago");
        console.log(JSON.stringify(value, null, 2));
        const editedValue = insertPolicyId(value, "Test");
        writeJsonToFile("192.168.2.18", "wago", editedValue)
        res.json(JSON.parse(value)); //Versuche den String als JSON zu parsen.
        
    } catch (error) {
        res.status(500).json({ error: "Fehler beim Abrufen der Daten" });
    }
});

// Server starten
server.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});


async function testReadJson(ipAdresse, passwort) {
    return new Promise((resolve, reject) => {
        const remotePath = 'transfer/transfer-01-negotiation/resources/negotiate-contract.json';
        exec(`expect -c 'spawn ssh root@${ipAdresse} "docker exec -i ccd6c7aff556 /bin/sh -c \\"cat ${remotePath}\\""; expect "password:"; send "${passwort}\\r"; interact'`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Fehler beim Auslesen der Datei: ${error}`);
                console.error(`stderr: ${stderr}`);
                reject(error); // Fehler an Promise weitergeben
                return;
            }
            console.log(stdout);
            const match = stdout.match(/\{[\s\S]*\}/);
            if (match) {
                stdout = match[0]; // Gibt den JSON-Teil aus
                console.log(stdout);
                stdout = JSON.parse(stdout);
                resolve(stdout); // Ergebnis an Promise weitergeben
            }
            
        });
    });
}

function insertPolicyId(negotiateContractFile, policyId){
    negotiateContractFile.policy["@id"] = policyId;
    console.log("new negotioation: " + JSON.stringify(negotiateContractFile, null, 2));
    return negotiateContractFile;
}


async function writeJsonToFile(ipAdresse, passwort, jsonData) {
    return new Promise((resolve, reject) => {
        const remotePath = 'transfer/transfer-01-negotiation/resources/negotiate-contract.json';
        const jsonString = JSON.stringify(jsonData, null, 2); // Objekt in JSON-String umwandeln
        const escapedJsonString = jsonString.replace(/"/g, '\\"');
        exec(`expect -c 'spawn ssh root@${ipAdresse} "docker exec -i ccd6c7aff556 /bin/sh -c \\"echo \\"${escapedJsonString}\\" > ${remotePath}\\""; expect "password:"; send "${passwort}\\r"; interact'`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Fehler beim Schreiben der Datei: ${error}`);
                console.error(`stderr: ${stderr}`);
                reject(error);
                return;
            }
            resolve();
        });
    });
}


