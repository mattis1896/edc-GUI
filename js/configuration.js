// // WebSocket-Verbindung herstellen
// const socket = new WebSocket('ws://localhost:3000');

// // Wenn der WebSocket geöffnet wird
// socket.onopen = () => {
//   console.log('Verbindung zum Server hergestellt');
// };

// // Wenn der WebSocket eine Nachricht empfängt (Ergebnis des Pings)
// socket.onmessage = (event) => {
//     document.getElementById('result').innerHTML = event.data.replace(/\n/g, "<br>");
// };

// // Wenn der WebSocket geschlossen wird
// socket.onclose = () => {
//   console.log('Verbindung zum Server geschlossen');
// };

// // Wenn der Benutzer auf den Button klickt, sende eine Nachricht an den Server
// document.getElementById('pingButton').addEventListener('click', () => {
//   // Sende "ping" mit der IP-Adresse an den WebSocket-Server
//   socket.send('ping 192.168.2.17'); // IP-Adresse hier anpassen
// });

const ws = new WebSocket("ws://localhost:3000");
const textProvider = "provider";
const textConsumer = "consumer";
let input = null;
let responseText = null;

const sharedData = {
    consumer1: sessionStorage.getItem("consumer1") || "",
    consumer2: sessionStorage.getItem("consumer2") || "",
    consumer3: sessionStorage.getItem("consumer3") || "",
    provider: sessionStorage.getItem("provider") || "" // Falls vorhanden, aus sessionStorage laden
};


let term;

ws.onopen = () => console.log("Verbunden mit dem WebSocket-Server.");
// ws.onmessage = (event) => {
//     document.getElementById("result").innerText = event.data;
//     //writeToTerminal(event.data);
// };
ws.onclose = () => console.log("Verbindung getrennt.");

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("send-command")?.addEventListener("click", () => {
        const command = document.getElementById("command").value;
        if (command) {
            ws.send(command);
        }
    });
});



function initializeTerminal(terminalContainerId) {
    if(!term){
        const terminalContainer = document.getElementById(terminalContainerId);
        
        // Überprüfe, ob das Container-Element existiert
        if (!terminalContainer) {
            console.log('Kein Terminal-Container gefunden, Terminal wird nicht initialisiert.');
            return; // Verhindere die Initialisierung, wenn kein Terminal-Container vorhanden ist
        }

        term = new Terminal();
        term.open(terminalContainer);

        // Terminal nach der Initialisierung konfigurieren
        term.writeln('Willkommen im Web-Terminal!');
        term.writeln('Im Folgenden kommt die Kommunikation zwischen provider und consumern');
    }
}

function writeToTerminal(text) {
    if (term) { // Sicherstellen, dass das Terminal initialisiert wurde
        term.writeln(text);
        term.writeln("--------------------------------------------------------------------------------");
    } else {
        console.error('Terminal ist noch nicht initialisiert!');
        term.writeln("--------------------------------------------------------------------------------");
    }
}

// Sendet Befehl ins Terminal
function sendCommand(command) {
    return new Promise((resolve, reject) => {
        if (!command) {
            reject("Kein Befehl angegeben");
            return;
        }

        ws.send(command);

        ws.onmessage = (event) => {
            responseText = event.data;
            resolve(responseText);
            document.getElementById("result").innerText = event.data;
        };

        ws.onerror = (error) => {
            reject("Fehler beim Empfangen der Antwort: " + error);
        };
    });
}

async function waitForProviderAvailable() {
    writeToTerminal("Warte auf den Status 'UP' vom Provider...");

    while (true) {
        try {
            const response = await sendCommand(
                'docker exec -i 4fef7ff3dd49 /bin/sh -c "curl -s -X GET http://localhost:9191/management/health"'
            );

            if (response.includes('"status":"UP"')) {
                writeToTerminal("Provider ist jetzt verfügbar, weiter mit dem Skript...");
                break; // Beenden, wenn der Connector verfügbar ist
            }
        } catch (error) {
            writeToTerminal("Fehler beim Überprüfen des Providers: " + error);
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 Sekunde warten
    }
}


// Funktion, die kontinuierlich die Logs überprüft
async function checkLogsForAvailable() {
    return new Promise((resolve, reject) => {
        let intervalId = setInterval(async () => {
            try {
                const logs = await getLogs(); // Logs abrufen
                if (logs.includes("is now in state AVAILABLE")) {
                    clearInterval(intervalId); // Stoppen, wenn die Zeile gefunden wurde
                    resolve(true);
                }
            } catch (error) {
                clearInterval(intervalId); // Stoppen bei Fehler
                reject("Fehler beim Abrufen der Logs: " + error);
            }
        }, 1000); // Alle 1 Sekunde nach Logs suchen
    });
}

// Hilfsfunktion, um Logs vom Docker-Container zu holen
async function getLogs() {
    return new Promise((resolve, reject) => {
        ws.send("docker logs 4fef7ff3dd49"); // Log-Befehl für den Container

        ws.onmessage = (event) => {
            const logs = event.data;
            resolve(logs); // Logs zurückgeben
        };

        ws.onerror = (error) => {
            reject("Fehler beim Abrufen der Logs: " + error);
        };
    });
}







if (document.getElementById('terminal-container')) {
    window.addEventListener('DOMContentLoaded', () => {
        initializeTerminal('terminal-container');
    });
}


// functions


function loadConfiguration() {
    if (window.location.pathname.includes("configuration.html")) {
        restorePageStructure();  // Dynamische Elemente (z. B. Consumers) wiederherstellen
        restoreValues();         // Eingaben & Checkboxen wiederherstellen
        restoreTerminalLogs();
        // Terminal nur initialisieren, wenn es nicht existiert
        if (!term) {
            initializeTerminal("terminal-container");
            restoreTerminalLogs(); // Gespeicherte Logs wieder anzeigen
        }

        window.addEventListener("beforeunload", function () {
            savePageStructure(); // Speichert dynamische Elemente (Consumers, Providers)
            saveValues();        // Speichert Input-Werte
            saveTerminalLogs();  // Speichert Terminal-Text
        });

        reattachEvents(); // Events erneut setzen
    }
}

function saveTerminalLogs() {
    if (term) {
        let lines = [];
        let buffer = term.buffer.active;  // Aktiver Terminal-Buffer

        // Ab der dritten Zeile (Index 2) durch den Terminal-Buffer iterieren
        for (let i = 2; i < buffer.length; i++) {
            let line = buffer.getLine(i)?.translateToString() || ""; // Zeile holen

            // Nur nicht-leere Zeilen speichern
            if (line.trim() !== "") {
                lines.push(line);
            }
        }

        // Die gesammelten nicht-leeren Zeilen im Session Storage speichern
        sessionStorage.setItem("terminal_logs", JSON.stringify(lines));
    }
}


function savePageStructure() {
    sessionStorage.setItem("consumer-container", document.getElementById("consumer-container").innerHTML);
    sessionStorage.setItem("provider-container", document.getElementById("provider-container").innerHTML);
}

function restorePageStructure() {
    let savedConsumers = sessionStorage.getItem("consumer-container");
    let savedProviders = sessionStorage.getItem("provider-container");

    if (savedConsumers) {
        document.getElementById("consumer-container").innerHTML = savedConsumers;
    }
    if (savedProviders) {
        document.getElementById("provider-container").innerHTML = savedProviders;
    }
}

function restoreTerminalLogs() {
    let savedLogs = sessionStorage.getItem("terminal_logs");
    
    if (savedLogs && term) {
        let lines = JSON.parse(savedLogs);
        lines.forEach(line => term.writeln(line)); // Zeilen wieder ins Terminal schreiben
    }
}

function saveValues() {
    document.querySelectorAll("input, textarea, select").forEach(el => {
        sessionStorage.setItem(el.id + "_value", el.value);
    });

    document.querySelectorAll("input[type='checkbox'], input[type='radio']").forEach(el => {
        sessionStorage.setItem(el.id + "_checked", el.checked);
    });
}

function restoreValues() {
    document.querySelectorAll("input, textarea, select").forEach(el => {
        let savedValue = sessionStorage.getItem(el.id + "_value");
        if (savedValue !== null) el.value = savedValue;
    });

    document.querySelectorAll("input[type='checkbox'], input[type='radio']").forEach(el => {
        let savedChecked = sessionStorage.getItem(el.id + "_checked");
        if (savedChecked !== null) el.checked = savedChecked === "true";
    });
}

function reattachEvents() {
    document.querySelectorAll(".clickable").forEach(el => {
        el.addEventListener("click", function () {
            alert("Element wurde erneut aktiviert!");
        });
    });
}



export function updateSharedVariable(key, value) {
    sharedData[key] = value;
}

function processCommand(command) {
    term.writeln(`Eingabe: ${command}`); // Beispiel-Verarbeitung der Eingabe
}

function addEventListenerToButtons() {
        // Alle Buttons innerhalb der Gruppen auswählen
        const consumerButtons = document.querySelectorAll(".consumer-group button");
        const providerButtons = document.querySelectorAll(".provider-group button");
        const resetButton = document.querySelectorAll(".navbar button");
    
        // Event-Listener für beide Gruppen zurücksetzen und neu setzen
        resetAndAddEventListeners(consumerButtons);
        resetAndAddEventListeners(providerButtons);
        resetAndAddEventListeners(resetButton);
}

function resetAndAddEventListeners(buttons) {
    buttons.forEach(button => {
        // Vorher alle bestehenden Event-Listener entfernen
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Neuen Event-Listener hinzufügen
        newButton.addEventListener("click", function () {
            handleButtonClick(newButton);
        });
    });
}

function toggleConnection(address, input, button){

    if(input.disabled == false){
        sharedData[button.name] = address;
        sessionStorage.setItem(button.name, address); // writes the address into the suitable part of sharedData
        console.log(`New address of ${button.name}:`, address);
        console.log(sharedData);
        writeToTerminal('connected to ' + button.name + " with adress: " + address);
        button.style.backgroundColor = "#6EC800";
        input.disabled = true;
        connectToDevice(button);
    }else{
        disconnectFromDevice(button);
        console.log(button.name + " is disconnected");
        writeToTerminal('disconnected from ' + button.name + " with adress: " + address);
        button.style.backgroundColor = "#EFEFEF";
        input.disabled = false;
    }
}

function connectToDevice(button){
    switch(true)
    {
        case button.name.includes(textConsumer):
            connectToConsumer();
            break;
        case button.name.includes(textProvider):
            connectToProvider();
            break;
    }
}

function connectToConsumer(){
    startConsumer();
}

function connectToProvider(){
    startProvider();
    createAssets();
    createPolicies();
    createContractDefinition();
}

async function startProvider() {
    writeToTerminal("Provider is starting...");
    
    try {
        sendCommand(`docker exec -i 4fef7ff3dd49 /bin/sh -c "./gradlew transfer:transfer-00-prerequisites:connector:build" && docker exec -i 4fef7ff3dd49 /bin/sh -c "java -Dedc.keystore=transfer/transfer-00-prerequisites/resources/certs/cert.pfx -Dedc.keystore.password=123456 -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/provider-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar"`);
        
        waitForProviderAvailable();

        writeToTerminal("Provider erfolgreich gestartet!");
    } catch (error) {
        writeToTerminal("Fehler beim Starten des Providers: " + error);
    }
}


function createAssets(){
    //sendCommand("docker exec -i 4fef7ff3dd49 /bin/sh -c \"curl -d @transfer/transfer-01-negotiation/resources/create-asset.json   -H 'content-type: application/json' http://localhost:19193/management/v3/assets\"");
    sendCommand("docker exec -i 4fef7ff3dd49 /bin/sh -c \"curl -d @transfer/transfer-01-negotiation/resources/create-asset.json   -H 'content-type: application/json' http://localhost:19193/management/v3/assets\"").then(response => {
        console.log("Antwort erhalten:", response);
        }).catch(error => {
            console.error(error);
    });
}

function createPolicies(){

}

function createContractDefinition(){

}

function disconnectFromDevice(button){
    sessionStorage.setItem(button.name, "");
    writeToTerminal(button.name + " has beend stopped");
    sendCommand("docker exec -i 4fef7ff3dd49 /bin/sh -c \"pkill -f connector.jar\"");

}

function handleButtonClick(button){
    let address;
    switch(true){
        case button.name.includes(textConsumer) || button.name.includes(textProvider):
            input = document.getElementById(`${button.name}-address`);
            address = input.value;
            toggleConnection(address, input, button);
            break;
        case button.id.includes("reset"):
            resetButtonClick();
            break;
    }
}

function addConsumer() {
    let container = document.getElementById("consumer-container");
    
    // Zähle nur die "consumer-group" divs
    let consumers = container.getElementsByClassName("consumer-group");
    let count = consumers.length + 1; // Nächste Nummer bestimmen
    
    if (count <= 3) {  // Maximal 3 Consumer
        let newConsumer = document.createElement("div");
        newConsumer.classList.add("consumer-group");
        newConsumer.setAttribute("id", `consumer${count}`); // Eindeutige ID setzen
        newConsumer.innerHTML = `<input type="text" placeholder="consumer${count} address" id="consumer${count}-address"> 
                                 <button id="btn-consumer${count}" name="consumer${count}">Connect</button>`;
        
        container.appendChild(newConsumer);

        addEventListenerToButtons();
    }
}

function removeConsumer() {
    let container = document.getElementById("consumer-container");
    let consumers = container.querySelectorAll(".consumer-group"); // Holt nur die Consumer-Elemente
    let lastConsumer = consumers[consumers.length - 1];
    let inputField  = lastConsumer.querySelector("input");
    if (consumers.length > 1 && !inputField.disabled) { // Der erste Consumer bleibt immer erhalten
        container.removeChild(lastConsumer); // Nur das letzte Consumer-Element entfernen
    }
}

function clearDynamicContent() {
    var consumerGroupElements = document.getElementsByClassName('consumer-group');

    for (var i = consumerGroupElements.length - 1; i >= 0; i--) {
        var element = consumerGroupElements[i];

        // Stelle sicher, dass 'consumer1' und 'consumer1-address' nicht gelöscht werden
        if (element.id.startsWith('consumer') && element.id !== 'consumer1' && element.id !== 'consumer1-address') {
            element.parentNode.removeChild(element);
        }
    }
}




function resetButtonClick() {
    
    clearDynamicContent();

    // Löscht den gesamten sessionStorage
    sessionStorage.clear();
    console.log("SessionStorage wurde gelöscht.");
    
    
    // Setze alle Formulareingaben zurück und aktiviere deaktivierte Inputs
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.value = '';          // Leert den Inhalt
        input.disabled = false;    // Reaktiviert das Eingabefeld, falls es deaktiviert wurde
    });


    // Lösche den Inhalt des Terminal-Containers
    term.clear();

    // Setze alle Inline-Stile zurück
    document.querySelectorAll('*').forEach(el => el.style = ''); 

    // Verzögert den Seitenwechsel, um sicherzustellen, dass der Speicher gelöscht wird
    setTimeout(function() {
        window.location.href = "configuration.html"; // Weiterleitung zur Seite
    }, 100);  // Verzögerung von 100ms, um den Speicher sicher zu löschen
}








loadConfiguration();
console.log(sharedData);
window.addConsumer = addConsumer;
window.removeConsumer = removeConsumer;
addEventListenerToButtons();