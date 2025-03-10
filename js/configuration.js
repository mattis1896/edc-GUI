
const ws = new WebSocket("ws://localhost:3000");
const textProvider = "provider";
const textConsumer = "consumer";
let input = null;
let responseText = null;
let hostIP = null;
let contractNegotiationId = null;
let contractAgreementId = null;
let transferProcessId = null;
let authorizationKey = null;

const actorIpAdress = {
    consumer1: sessionStorage.getItem("consumer1") || "",
    consumer2: sessionStorage.getItem("consumer2") || "",
    consumer3: sessionStorage.getItem("consumer3") || "",
    provider: sessionStorage.getItem("provider") || "" // Falls vorhanden, aus sessionStorage laden
};

const actorContainerId = {
    consumer1: sessionStorage.getItem("consumer1") || "",
    consumer2: sessionStorage.getItem("consumer2") || "",
    consumer3: sessionStorage.getItem("consumer3") || "",
    provider: sessionStorage.getItem("provider") || "" // Falls vorhanden, aus sessionStorage laden
}

const actorSshPassword = {
    consumer1: sessionStorage.getItem("consumer1") || "",
    consumer2: sessionStorage.getItem("consumer2") || "",
    consumer3: sessionStorage.getItem("consumer3") || "",
    provider: sessionStorage.getItem("provider") || "" // Falls vorhanden, aus sessionStorage laden
}


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

async function getHostIp() {
    try {
      const response = await fetch('/api/host-ip');
      if (!response.ok) {
        throw new Error('Netzwerkfehler: ' + response.status);
      }
      const data = await response.json();
      const hostIp = data.hostIp; // Speichern in einer Variable
      console.log(hostIp);
      hostIP =  hostIp; // Rückgabe der Variable
    } catch (error) {
      console.error('Fehler beim Abrufen der Host-IP:', error);
      return null;
    }
}








if (document.getElementById('terminal-container')) {
    window.addEventListener('DOMContentLoaded', () => {
        initializeTerminal('terminal-container');
    });
}


// functions


async function loadConfiguration() {
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
        await getHostIp();
        console.log(hostIP);
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
    actorIpAdress[key] = value;
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
        actorIpAdress[button.name] = address;
        sessionStorage.setItem(button.name, address); // writes the address into the suitable part of actorIpAdress
        console.log(`New address of ${button.name}:`, address);
        console.log(actorIpAdress);
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
            connectToConsumer(button);
            break;
        case button.name.includes(textProvider):
            connectToProvider(button);
            break;
    }
}

function askForSshPassword(button) {
    const password = prompt(`Bitte geben Sie das SSH-Passwort für ${button.name} ein:`);

    if (password !== null) {
        actorSshPassword[button.name] = password;
        sessionStorage.setItem(button.name, password); // Speichert das Passwort in der Session
        console.log(`Passwort für ${button.name} gespeichert.`);
        writeToTerminal(actorSshPassword[button.name])
    }

}


async function connectToConsumer(button){
    await startConsumer(button);
    await fetchCatalog(button);
    await negotiateContract(button);
    await gettingContractAgreementID(button);
    // await startTransfer(button);
    // await checkTransferStatus(button);
    // await getAuthorizationKey(button);
    // await getData(button);
}

function isLocalHost(button){
    if(actorIpAdress[button.name] == hostIP)
    {
        return true;
    }
}

async function startConsumer(button){
    writeToTerminal("Consumer wird gestartet...");
    
    try {
        let command = null;
        // Starte den Consumer 
        if(isLocalHost(button)){
            command = `docker exec -i 4fef7ff3dd49 /bin/sh -c "java -Dedc.keystore=transfer/transfer-00-prerequisites/resources/certs/cert.pfx -Dedc.keystore.password=123456 -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/consumer-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar"`;
        }else{
            askForSshPassword(button);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            command = `expect -c 'spawn ssh root@${actorIpAdress[button.name]} "docker exec -i 674b02b6b54c /bin/sh -c \\\"java -Dedc.keystore=transfer/transfer-00-prerequisites/resources/certs/cert.pfx -Dedc.keystore.password=123456 -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/consumer-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar\\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;
            writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
        }
        
        sendCommand(command);
        
        writeToTerminal("Consumer erfolgreich gestartet!");
    } catch (error) {
        writeToTerminal("Fehler beim Starten des Consumers: " + error);
        throw error; // Wir werfen den Fehler, damit connectToConsumer damit umgehen kann
    }
}

async function fetchCatalog(button){
    writeToTerminal("Fetch catalog...");
    
    while (true) {
        try {
            let command = null;
            if(isLocalHost(button)){
                command = `docker exec -i 4fef7ff3dd49 /bin/bash -c "curl -X POST "http://localhost:29193/management/v3/catalog/request" -H 'Content-Type: application/json' -d @transfer/transfer-01-negotiation/resources/fetch-catalog.json -s"`;
            }else{
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i 674b02b6b54c /bin/sh -c 'curl -X POST \\\\\\"http://localhost:29193/management/v3/catalog/request\\\\\\" -H \\\\\\"Content-Type: application/json\\\\\\" -d @transfer/transfer-01-negotiation/resources/fetch-catalog.json -s'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
 
            }

            const response = await sendCommand(command);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            writeToTerminal(response);
            // Überprüfen, ob die Antwort gültig ist
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")) {
                writeToTerminal("Erfolgreiche Antwort erhalten, Katalog wird geholt");
                const regex = /"odrl:hasPolicy":\s*{\s*"@id":\s*"([A-Za-z0-9\+=/:_-]+)"/;
                const match = response.match(regex);
                if (match && match[1]) {
                    const policyId = match[1];

                    if(isLocalHost(button)){
                        command = `docker exec -i 4fef7ff3dd49 /bin/bash -c "jq --arg new_id '${policyId}' '.policy[\\\"@id\\\"] = \\$new_id' transfer/transfer-01-negotiation/resources/negotiate-contract.json > /tmp/temp.json && mv /tmp/temp.json transfer/transfer-01-negotiation/resources/negotiate-contract.json && echo DONE"`; 
                    }else{
                        command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i 674b02b6b54c /bin/sh -c 'jq --arg new_id \\\\\\"${policyId}\\\\\\" \\' .policy[\\\\\\"@id\\\\\\"] = \\$new_id' transfer/transfer-01-negotiation/resources/negotiate-contract.json > /tmp/temp.json && mv /tmp/temp.json transfer/transfer-01-negotiation/resources/negotiate-contract.json && echo DONE'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;

                        writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
                    }

                    sendCommand(command)
                        .then(response => console.log("Antwort vom Server:", response))
                        .catch(error => console.error("Fehler:", error));


                    console.log(`Policy ID: ${policyId}`);
                    writeToTerminal(policyId);
                } else {
                    writeToTerminal('Kein Katalog gefunden.');
                }
                
                
                break; // Schleife beenden
            } else {
                writeToTerminal("Keine gültige Antwort erhalten, erneut versuchen...");
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            }
        } catch (error) {
            writeToTerminal("Fehler beim fetchen des Katalogs: " + error);
            throw error; // Fehler werfen, damit connectToProvider damit umgehen kann
        }
    }
}

async function negotiateContract(button){
    writeToTerminal("Verhandle Vertrag...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    while (true) {
        try {
            
            let command = null;
            if(isLocalHost(button)){
                command = `docker exec -i 4fef7ff3dd49 /bin/bash -c "curl -d @transfer/transfer-01-negotiation/resources/negotiate-contract.json -X POST -H 'content-type: application/json' http://localhost:29193/management/v3/contractnegotiations -s"`;
            }else{
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i 674b02b6b54c /bin/sh -c 'curl -d @transfer/transfer-01-negotiation/resources/negotiate-contract.json -X POST -H \\\\\\"content-type: application/json\\\\\\" http://localhost:29193/management/v3/contractnegotiations -s'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
                writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
            }

            const response = await sendCommand(command);

            // Überprüfen, ob die Antwort gültig ist
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")) {
                writeToTerminal("Erfolgreiche Antwort erhalten, Vertrag verhandelt.");
                
                const regex = /"@id":\s*"([a-fA-F0-9\-]{36})"/;
                const match = response.match(regex);
                writeToTerminal(response);
                if (match && match[1]) {
                    contractNegotiationId = match[1];
                    writeToTerminal(contractNegotiationId);
                }
                break; // Schleife beenden
            } else {
                writeToTerminal("Keine gültige Antwort erhalten, erneut versuchen...");
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            }
        } catch (error) {
            writeToTerminal("Fehler beim verhandeln des Vertrags: " + error);
            throw error; // Fehler werfen, damit connectToProvider damit umgehen kann
        }
    }
}

async function gettingContractAgreementID(button){
    writeToTerminal("Get contractAgreementID...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    while (true) {
        try {
            let command = null;
            if(isLocalHost(button)){
                command = `docker exec -i 4fef7ff3dd49 /bin/bash -c "curl -X GET 'http://localhost:29193/management/v3/contractnegotiations/${contractNegotiationId}' --header 'Content-Type: application/json' -s | jq"`;
            }else{
                askForSshPassword(button);
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i 674b02b6b54c /bin/sh -c 'curl -X GET \\\\\\"http://localhost:29193/management/v3/contractnegotiations/${contractNegotiationId}\\\\\\" --header \\\\\\"Content-Type: application/json\\\\\\" -s'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
                writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
            }
                
            const response = await sendCommand(command);
            // Überprüfen, ob die Antwort gültig ist
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")) {
                writeToTerminal("Erfolgreiche Antwort erhalten, ID erhalten.");
                const regex = /"contractAgreementId":\s*"([a-fA-F0-9\-]{36})"/;
                const match = response.match(regex);
                if (match && match[1]) {
                    contractAgreementId = match[1];
                    writeToTerminal(contractAgreementId);
                }
                break; // Schleife beenden
            } else {
                writeToTerminal("Keine gültige Antwort erhalten, erneut versuchen...");
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            }
        } catch (error) {
            writeToTerminal("Fehler beim verhandeln des Vertrags: " + error);
            throw error; // Fehler werfen, damit connectToProvider damit umgehen kann
        }
    }
}

async function startTransfer(button){
    let command = null;

    if(isLocalHost(button)){
        command = `docker exec -i 4fef7ff3dd49 /bin/bash -c "jq --arg new_id '${contractAgreementId}' '.contractId = \\$new_id' transfer/transfer-02-consumer-pull/resources/start-transfer.json > /tmp/temp.json && mv /tmp/temp.json transfer/transfer-02-consumer-pull/resources/start-transfer.json && echo DONE"`;
    }else{
        command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i 674b02b6b54c /bin/sh -c 'jq --arg new_id \\\\\\"${contractAgreementId}\\\\\\" \\' .contractId = \\$new_id' transfer/transfer-02-consumer-pull/resources/start-transfer.json > /tmp/temp.json && mv /tmp/temp.json transfer/transfer-02-consumer-pull/resources/start-transfer.json && echo DONE'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;

        writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
    }

    sendCommand(command)
        .then(response => console.log("Antwort vom Server:", response))
        .catch(error => console.error("Fehler:", error));
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    while (true) {
        try {
            
            if(isLocalHost(button)){
                command = `docker exec -i 4fef7ff3dd49 /bin/bash -c 'curl -X POST "http://localhost:29193/management/v3/transferprocesses" -H "Content-Type: application/json" -d @transfer/transfer-02-consumer-pull/resources/start-transfer.json -s | jq'`;
            }else{
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i 674b02b6b54c /bin/sh -c 'curl -X POST "http://localhost:29193/management/v3/transferprocesses" -H "Content-Type: application/json" -d @transfer/transfer-02-consumer-pull/resources/start-transfer.json -s'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;

                writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
            }
            const response = await sendCommand(command);
            //Überprüfen, ob die Antwort gültig ist
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")) {
                writeToTerminal("Erfolgreiche Antwort erhalten, Transfer gestartet.");
                const regex = /"@id":\s*"([a-f0-9\-]{36})"/;
                const match = response.match(regex);
                if (match && match[1]) {
                    transferProcessId = match[1];
                    writeToTerminal("transferprocessid: " + transferProcessId);
                }
                break; // Schleife beenden
            } else {
                writeToTerminal("Keine gültige Antwort erhalten, erneut versuchen...");
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            }
            break;
        } catch (error) {
            writeToTerminal("Fehler beim start des Transfers: " + error);
            throw error; // Fehler werfen, damit connectToProvider damit umgehen kann
        }
    }
}

async function checkTransferStatus(button){
    await new Promise((resolve) => setTimeout(resolve, 2000));
    while (true) {
        try {

            let command = null;

            if(isLocalHost(button)){
                command = `docker exec -i 4fef7ff3dd49 /bin/bash -c "curl -s 'http://localhost:29193/management/v3/transferprocesses/${transferProcessId}'"`;
            }else{
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i 674b02b6b54c /bin/sh -c 'curl -s 'http://localhost:29193/management/v3/transferprocesses/${transferProcessId}''\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
                writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
            }

            const response = await sendCommand(command);
            writeToTerminal(response);

            // Überprüfen, ob die Antwort gültig ist
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")) {
                
                const regex = /"state":\s*"([A-Z]+)"/;
                const match = response.match(regex);

                if (match && match[1]) {
                    const transferState = match[1];
                    writeToTerminal(`Status: ${transferState}`);

                    if (transferState === "STARTED") {
                        writeToTerminal("Transfer erfolgreich gestartet!");
                        break; // Beendet die Schleife
                    }
                }
            } else {
                writeToTerminal("Keine gültige Antwort erhalten, erneut versuchen...");
            }

            await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
                break;
        } catch (error) {
            writeToTerminal("Fehler beim verhandeln des Vertrags: " + error);
            throw error; // Fehler werfen, damit connectToProvider damit umgehen kann
        }
    }
}

async function getAuthorizationKey(button){
    await new Promise((resolve) => setTimeout(resolve, 2000));
    while (true) {
        try {
            
            let command = null;

            if(isLocalHost(button)){
                command = `docker exec -i 4fef7ff3dd49 /bin/bash -c "curl -s 'http://localhost:29193/management/v3/edrs/${transferProcessId}/dataaddress' | jq"`; 
            }else{
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i 674b02b6b54c /bin/sh -c 'curl -s 'http://localhost:29193/management/v3/edrs/${transferProcessId}/dataaddress' | jq'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
                writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
            }

            const response = await sendCommand(command);
            writeToTerminal(response);

            // Überprüfen, ob die Antwort gültig ist
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")) {
                
                const regex = /"authorization":\s*"([A-Za-z0-9._-]+)"/;
                const match = response.match(regex);

                if (match && match[1]) {
                    authorizationKey = match[1];
                    writeToTerminal(authorizationKey);
                    
                }
            } else {
                writeToTerminal("Keine gültige Antwort erhalten, erneut versuchen...");
            }

            await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
                break;
        } catch (error) {
            writeToTerminal("Fehler beim verhandeln des Vertrags: " + error);
            throw error; // Fehler werfen, damit connectToProvider damit umgehen kann
        }
    }
}

async function getData(button){
    await new Promise((resolve) => setTimeout(resolve, 2000));
    while (true) {
        try {
            let command = null;  

            if(isLocalHost(button)){
                command = `docker exec -i 4fef7ff3dd49 /bin/bash -c "curl -s -X GET 'http://localhost:19291/public/1' -H 'Authorization: ${authorizationKey}'"`; 
            }else{
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i 674b02b6b54c /bin/sh -c 'curl -s -X GET 'http://localhost:19291/public/1' -H 'Authorization: ${authorizationKey}''\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
                writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
            }

            const response = await sendCommand(command);
            writeToTerminal(response);

            break;
        } catch (error) {
            writeToTerminal("Fehler beim verhandeln des Vertrags: " + error);
            throw error; // Fehler werfen, damit connectToProvider damit umgehen kann
        }
    }
}

async function connectToProvider(button) {
    try {
        // Starte den Provider und warte darauf, dass er erfolgreich gestartet wird
        await startProvider(button);
        
        // Warte auf die erfolgreiche Erstellung der Assets
        await createAssets(button);
        
        // Optional: Hier kannst du die nächsten Schritte hinzufügen, die nach der Asset-Erstellung ausgeführt werden sollen
        await createPolicies(button);
        await createContractDefinition(button);
        
        writeToTerminal("Provider successfully started");
    } catch (error) {
        writeToTerminal("Fehler beim Ausführen der Schritte: " + error);
    }
}

async function startProvider(button) {
    writeToTerminal("Provider wird gestartet...");
    
    try {
        // Starte den Provider 
        
        let command = null;  

        if(isLocalHost(button)){
            command = `docker exec -i 4fef7ff3dd49 /bin/sh -c "java -Dedc.keystore=transfer/transfer-00-prerequisites/resources/certs/cert.pfx -Dedc.keystore.password=123456 -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/provider-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar"`; 
        }else{
            askForSshPassword(button);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            //Container-ID noch ändern!
            command = `expect -c 'spawn ssh root@${actorIpAdress[button.name]} "docker exec -i 674b02b6b54c /bin/sh -c \\\"java -Dedc.keystore=transfer/transfer-00-prerequisites/resources/certs/cert.pfx -Dedc.keystore.password=123456 -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/provider-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar\\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;
        }

        sendCommand(command);
        writeToTerminal("Provider erfolgreich gestartet!");
    } catch (error) {
        writeToTerminal("Fehler beim Starten des Providers: " + error);
        throw error; // Wir werfen den Fehler, damit connectToProvider damit umgehen kann
    }
}

async function createAssets(button) {
    writeToTerminal("Starte Asset-Erstellung...");
    while (true) {
        try {

            let command = null;  

            if(isLocalHost(button)){
                command = `docker exec -i 4fef7ff3dd49 /bin/bash -c "curl --data-binary @transfer/transfer-01-negotiation/resources/create-asset.json -H 'Content-Type: application/json' http://localhost:19193/management/v3/assets -s"`; 
            }else{
                command = `expect -c 'spawn ssh root@${actorIpAdress[button.name]} "docker exec -i 674b02b6b54c /bin/sh -c \\\"curl -d @transfer/transfer-01-negotiation/resources/create-asset.json -H \\\\\\\"content-type: application/json\\\\\\\" http://localhost:19193/management/v3/assets -s\\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;
            }

            const response = await sendCommand(command);
            
            // Überprüfen, ob die Antwort gültig ist
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")) {
                writeToTerminal("Erfolgreiche Antwort erhalten, Asset erstellt.");
                writeToTerminal(response);
                break; // Schleife beenden
            } else {
                writeToTerminal("Keine gültige Antwort erhalten, erneut versuchen...");
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            }
        } catch (error) {
            writeToTerminal("Fehler beim Erstellen der Assets: " + error);
            throw error; // Fehler werfen, damit connectToProvider damit umgehen kann
        }
    }
}


function processResponse(response) {
    // Hier kannst du die Response weiterverarbeiten
    writeToTerminal("Response verarbeitet: " + response);
}

async function createPolicies(button){
    writeToTerminal("Starte Policy-Erstellung...");
    
    while (true) {
        try {

            let command = null;  

            if(isLocalHost(button)){
                command = `docker exec -i 4fef7ff3dd49 /bin/bash -c "curl --data-binary @transfer/transfer-01-negotiation/resources/create-policy.json -H 'content-type: application/json' http://localhost:19193/management/v3/policydefinitions -s"`; 
            }else{
                command = `expect -c 'spawn ssh root@${actorIpAdress[button.name]} "docker exec -i 674b02b6b54c /bin/sh -c \\\"curl -d @transfer/transfer-01-negotiation/resources/create-policy.json -H \\\\\\\"content-type: application/json\\\\\\\" http://localhost:19193/management/v3/policydefinitions -s\\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;

 
                writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
            }

            const response = await sendCommand(command);
            
            // Überprüfen, ob die Antwort gültig ist
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")) {
                writeToTerminal("Erfolgreiche Antwort erhalten, Policy erstellt.");
                writeToTerminal(response);
                break; // Schleife beenden
            } else {
                writeToTerminal("Keine gültige Antwort erhalten, erneut versuchen...");
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            }
        } catch (error) {
            writeToTerminal("Fehler beim Erstellen der Assets: " + error);
            throw error; // Fehler werfen, damit connectToProvider damit umgehen kann
        }
    }
}

async function createContractDefinition(button){
    writeToTerminal("Starte Vetrag-Erstellung...");
    
    while (true) {
        try {

            let command = null;  

            if(isLocalHost(button)){
                command = `docker exec -i 4fef7ff3dd49 /bin/bash -c "curl -d @transfer/transfer-01-negotiation/resources/create-contract-definition.json -H 'content-type: application/json' http://localhost:19193/management/v3/contractdefinitions -s"`; 
            }else{
                command = `expect -c 'spawn ssh root@${actorIpAdress[button.name]} "docker exec -i 674b02b6b54c /bin/sh -c \\\"curl -d @transfer/transfer-01-negotiation/resources/create-contract-definition.json -H \\\\\\\"content-type: application/json\\\\\\\" http://localhost:19193/management/v3/contractdefinitions -s\\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;

            }

            const response = await sendCommand(command);
            
            // Überprüfen, ob die Antwort gültig ist
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")) {
                writeToTerminal("Erfolgreiche Antwort erhalten, Vertrag erstellt.");
                writeToTerminal(response);
                break; // Schleife beenden
            } else {
                writeToTerminal("Keine gültige Antwort erhalten, erneut versuchen...");
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            }
        } catch (error) {
            writeToTerminal("Fehler beim Erstellen der Assets: " + error);
            throw error; // Fehler werfen, damit connectToProvider damit umgehen kann
        }
    }
}

function disconnectFromDevice(button){
    sessionStorage.setItem(button.name, "");
    writeToTerminal(button.name + " has beend stopped");

    let command = null;  

    if(isLocalHost(button)){
        command = `docker exec -i 4fef7ff3dd49 /bin/sh -c \"pkill -f connector.jar\"`; 
    }else{
        writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
    }

    sendCommand(command);

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
console.log(actorIpAdress);
window.addConsumer = addConsumer;
window.removeConsumer = removeConsumer;
addEventListenerToButtons();