
const ws = new WebSocket("ws://localhost:3000");
const textProvider = "provider";
const textConsumer = "consumer";
let input = null;
let responseText = null;
let hostIP = null;
let matchPolicyIds = null;
let matchAssetIds = null;
let contractNegotiationId = null;
let contractAgreementId = null;
let transferProcessId = null;
let authorizationKey = null;
//let countConsumer = 0;

// Vorübergehende Variablen
let containerIDLocalHost = null;
let containerIDProvider = null;
// let containerIDPFC = ;
// let containerIDEDGE = ;

const actorIpAdress = {
    consumer1: sessionStorage.getItem("consumer1") || "",
    consumer2: sessionStorage.getItem("consumer2") || "",
    consumer3: sessionStorage.getItem("consumer3") || "",
    provider: sessionStorage.getItem("provider") || "" // Falls vorhanden, aus sessionStorage laden
};

const assetIds = {
    asset1: sessionStorage.getItem("asset1") || "",
    asset2: sessionStorage.getItem("asset2") || "",
    asset3: sessionStorage.getItem("asset3") || ""
};

const jsonAssetData = {
    jsonAsset1: sessionStorage.getItem("jsonAsset1") || "",
    jsonAsset2: sessionStorage.getItem("jsonAsset2") || "",
    jsonAsset3: sessionStorage.getItem("jsonAsset3") || ""
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

        console.log("Sende Befehl:", command);
        ws.send(command);

        let responseText = ""; // Hier speichern wir die gesamte Antwort

        ws.onmessage = (event) => {
            console.log("Antwort erhalten:", event.data);
            if (!event.data.includes("Prozess beendet mit Code") && !event.data.includes("DEBUG") && !event.data.includes("WARNING")) {
                responseText += event.data + "\n"; // Antwort speichern
                resolve(event.data.trim());
            }
            // Falls die Nachricht "Prozess beendet mit Code" enthält, wissen wir, dass es fertig ist.
            if (event.data.includes("Prozess beendet mit Code")) {
                // resolve(responseText.trim()); // Antwort zurückgeben
                // writeToTerminal("ResponseText: " + responseText);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket-Fehler:", error);
            reject("Fehler beim Empfangen der Antwort: " + error);
        };

        ws.onclose = () => {
            console.warn("WebSocket wurde geschlossen");
            if (responseText) {
                // writeToTerminal("ResponseText: " + responseText);
                resolve(responseText.trim()); // Falls WebSocket schließt, trotzdem Antwort zurückgeben
            } else {
                reject("WebSocket geschlossen, bevor eine Antwort kam.");
            }
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


async function getcontractNegotiation() {
    try {
      const response = await fetch('/api/contractNegotiation');
      if (!response.ok) {
        throw new Error('Netzwerkfehler: ' + response.status);
      }
      const data = await response.json();
      
      return data;
      console.log(hostIp);
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
        console.log(assetIds);
        console.log(jsonAssetData);
        if (sessionStorage.getItem('countConsumer') === null) {
            // Wenn es noch nicht existiert, setze es auf 1
            sessionStorage.setItem('countConsumer', 1);
        }

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
        writeToTerminal("SSH password for " + button.name + ": " +actorSshPassword[button.name])
    }

}

async function connectToProvider(button) {
    try {
        // Start the provider and wait for it to start successfully
        await startProvider(button);
        // Wait for the successful creation of the assets
        await createAssets(button);
        // Wait for the successful creation of the policies
        await createPolicies(button);
        // Wait for the successful creation of the contract definitions
        await createContractDefinition(button);
        writeToTerminal("Provider successfully started");
    } catch (error) {
        writeToTerminal("Error when carrying out the steps: " + error);
    }
}

async function connectToConsumer(button){
    await startConsumer(button);
    await fetchCatalog(button);
    if (matchPolicyIds) {
        for (let i = 0; i < matchPolicyIds.length; i++) {
            await negotiateContract(button,matchPolicyIds[i],matchAssetIds[i]);
            await gettingContractAgreementID(button);
            await startTransfer(button, matchAssetIds[i]);
            await checkTransferStatus(button);
            await getAuthorizationKey(button);
            await getData(button, matchAssetIds[i], i+1);
        }
        writeToTerminal("Consumer succesfully connected!");
    } else {
        console.log("No policy IDs were found.");
    }  
}

function isLocalHost(button){
    if(actorIpAdress[button.name] == hostIP)
    {
        return true;
    }
}

async function startConsumer(button){
    writeToTerminal("Consumer is started...");
    
    try {
        let command = null;
        // Starte den Consumer
        getContainerId(actorIpAdress[button.name],button); 
        if(isLocalHost(button)){
            command = `docker exec -i ${containerIDLocalHost} /bin/sh -c "java -Dedc.keystore=transfer/transfer-00-prerequisites/resources/certs/cert.pfx -Dedc.keystore.password=123456 -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/consumer-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar"`;
        }else{
            askForSshPassword(button);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            command = `expect -c 'spawn ssh root@${actorIpAdress[button.name]} "docker exec -i ${containerIDProvider} /bin/sh -c \\\"java -Dedc.keystore=transfer/transfer-00-prerequisites/resources/certs/cert.pfx -Dedc.keystore.password=123456 -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/consumer-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar\\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;
            // writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
        }
        
        sendCommand(command);
        
        // writeToTerminal("Consumer successfully started!");
    } catch (error) {
        writeToTerminal("Error when starting the consumer: " + error);
        throw error; // Wir werfen den Fehler, damit connectToConsumer damit umgehen kann
    }
}


async function fetchCatalog(button){
    writeToTerminal("Fetch catalog...");
    
    while (true) {
        try {
            let command = null;
            if(isLocalHost(button)){
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl -X POST "http://localhost:29193/management/v3/catalog/request" -H 'Content-Type: application/json' -d @transfer/transfer-01-negotiation/resources/fetch-catalog.json -s"`;
            }else{
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i ${containerIDProvider} /bin/sh -c 'curl -X POST \\\\\\"http://localhost:29193/management/v3/catalog/request\\\\\\" -H \\\\\\"Content-Type: application/json\\\\\\" -d @transfer/transfer-01-negotiation/resources/fetch-catalog.json -s'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
            }

            const response = await sendCommand(command);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            // writeToTerminal(response);
            // Überprüfen, ob die Antwort gültig ist
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error") && response.toLowerCase().includes("@id")) {
                writeToTerminal("Successful response received, catalog is fetched");
                // const datasetRegex = /"dcat:dataset":\s*\[\s*({[^}]*?"@id":\s*"([^"]+)")/g;
                // const policyRegex = /"odrl:hasPolicy":\s*{\s*"@id":\s*"([^"]+)"/g;

                // Extrahiere alle Asset-IDs (dcat:dataset @id)
                // matchAssetIds = [...response.matchAll(datasetRegex)].map(m => m[2]);

                // Extrahiere alle Policy-IDs (odrl:hasPolicy @id)
                // matchPolicyIds = [...response.matchAll(policyRegex)].map(m => m[1]);
                
                const jsonData = JSON.parse(response);
                matchAssetIds = jsonData['dcat:dataset'].map(dataset => dataset['@id']);
                matchPolicyIds = jsonData['dcat:dataset'].map(dataset => dataset['odrl:hasPolicy']['@id']);

                console.log("AssetIds: " + assetIds);

                
                break; // Schleife beenden
            } else {
                // writeToTerminal("Keine gültige Antwort erhalten, erneut versuchen...");
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            }
        } catch (error) {
            writeToTerminal("Error when starting the consumer: " + error);
            throw error; // Fehler werfen, damit connectToProvider damit umgehen kann
        }
    }
}

async function negotiateContract(button, policyId, assetId){
    writeToTerminal("Contract negotiation...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    while (true) {
        try {
            
            let command = null;

            if(isLocalHost(button)){
                // writeToTerminal("negotiate Contract policyID: " + policyId);
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "jq --arg new_id '${policyId}' --arg asset_id '${assetId}' '.policy[\\\"@id\\\"] = \\$new_id | .policy[\\\"target\\\"] = \\$asset_id' transfer/transfer-01-negotiation/resources/negotiate-contract.json > /tmp/temp.json && mv /tmp/temp.json transfer/transfer-01-negotiation/resources/negotiate-contract.json && echo DONE"`;
                await new Promise((resolve) => setTimeout(resolve, 2000)); // 1 Sekunde warten und erneut versuchen
            }else{
                // writeToTerminal("Policy ID: " + policyId);
                command = `expect -c 'spawn ssh root@${actorIpAdress[button.name]} "docker exec -i ${containerIDProvider} /bin/sh -c \\"jq --arg new_id \\"${policyId}\\" \\".policy[\\\"@id\\\"] = \\\"$new_id\\\"\\\" transfer/transfer-01-negotiation/resources/negotiate-contract.json > /tmp/temp.json && mv /tmp/temp.json transfer/transfer-01-negotiation/resources/negotiate-contract.json\\""; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact'`;
                
                
                const contractnegotiation = await getcontractNegotiation();
                console.log("Contract negotiation: " + JSON.stringify(contractnegotiation));

                writeToTerminal("Write policy ID to file...");
            }

            let response = await sendCommand(command);
                // .then(response => console.log("Antwort vom Server:", response))
                // .catch(error => console.error("Fehler:", error));


            if(isLocalHost(button)){
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl -d @transfer/transfer-01-negotiation/resources/negotiate-contract.json -X POST -H 'content-type: application/json' http://localhost:29193/management/v3/contractnegotiations -s"`;
            }else{
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i ${containerIDProvider} /bin/sh -c 'curl -d @transfer/transfer-01-negotiation/resources/negotiate-contract.json -X POST -H \\\\\\"content-type: application/json\\\\\\" http://localhost:29193/management/v3/contractnegotiations -s'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
                // writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
            }

            response = await sendCommand(command);
            // writeToTerminal("negotiateContract response: " + response);
            // Überprüfen, ob die Antwort gültig ist
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")&& !response.toLowerCase().includes("done")) {
                writeToTerminal("Successful response received, contract negotiated.");
                
                const regex = /"@id":\s*"([a-fA-F0-9\-]{36})"/;
                const match = response.match(regex);
                writeToTerminal(response);
                if (match && match[1]) {
                    contractNegotiationId = match[1];
                    writeToTerminal("contractNegotiationId: " + contractNegotiationId);
                }
                break; // Schleife beenden
            } else {
                // writeToTerminal("Keine gültige Antwort erhalten, erneut versuchen...");
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            }
        } catch (error) {
            writeToTerminal("Errors in negotiating the contract: " + error);
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
                // writeToTerminal("gettingContractAgreementID contractNegotiationId: " + contractNegotiationId);
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl -X GET 'http://localhost:29193/management/v3/contractnegotiations/${contractNegotiationId}' --header 'Content-Type: application/json' -s | jq"`;
            }else{
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i ${containerIDProvider} /bin/sh -c 'curl -X GET \\\\\\"http://localhost:29193/management/v3/contractnegotiations/${contractNegotiationId}\\\\\\" --header \\\\\\"Content-Type: application/json\\\\\\" -s'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
                // writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
            }
                
            const response = await sendCommand(command);
            // writeToTerminal("gettingContractAgreementID response: " + response);
            // Überprüfen, ob die Antwort gültig ist
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")) {
                writeToTerminal("Successful response received, contractAgreementID received.");
                const regex = /"contractAgreementId":\s*"([a-fA-F0-9\-]{36})"/;
                const match = response.match(regex);
                if (match && match[1]) {
                    contractAgreementId = match[1];
                    // writeToTerminal("ContractAgreementID: "+contractAgreementId);
                }
                break; // Schleife beenden
            } else {
                // writeToTerminal("Keine gültige Antwort erhalten, erneut versuchen...");
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            }
        } catch (error) {
            writeToTerminal("Error receiving the ContractAgreementID: " + error);
            throw error; // Fehler werfen, damit connectToProvider damit umgehen kann
        }
    }
}

async function startTransfer(button, assetId){
    let command = null;

    if(isLocalHost(button)){
        // writeToTerminal(assetId);
        // writeToTerminal(contractAgreementId);
        command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "jq --arg new_id '${contractAgreementId}' --arg asset_id '${assetId}' '.contractId = \\$new_id | .assetId = \\$asset_id' transfer/transfer-02-consumer-pull/resources/start-transfer.json > /tmp/temp.json && mv /tmp/temp.json transfer/transfer-02-consumer-pull/resources/start-transfer.json && echo DONE"`;  


        // command = `docker exec -i cf7945080320 /bin/bash -c "jq --arg new_id '${contractAgreementId}' '.contractId = \\$new_id' transfer/transfer-02-consumer-pull/resources/start-transfer.json > /tmp/temp.json && mv /tmp/temp.json transfer/transfer-02-consumer-pull/resources/start-transfer.json && echo DONE"`;
    }else{
        command= `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i ${containerIDProvider} /bin/sh -c 'jq --arg new_id \\\\\\"${contractAgreementId}\\\\\\" \\\\\\\".contractId = \\\\\\$new_id\\\\\\\\" transfer/transfer-02-consumer-pull/resources/start-transfer.json > /tmp/temp.json && mv /tmp/temp.json transfer/transfer-02-consumer-pull/resources/start-transfer.json && echo DONE'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
 
        // writeToTerminal("agreement ID in Datei schreiben...");
    }

    let response = await sendCommand(command)
        // .then(response => console.log("Antwort vom Server:", response))
        // .catch(error => console.error("Fehler:", error));
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    while (true) {
        try {
            
            if(isLocalHost(button)){
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c 'curl -X POST "http://localhost:29193/management/v3/transferprocesses" -H "Content-Type: application/json" -d @transfer/transfer-02-consumer-pull/resources/start-transfer.json -s | jq'`;
            }else{
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i ${containerIDProvider} /bin/sh -c 'curl -X POST "http://localhost:29193/management/v3/transferprocesses" -H "Content-Type: application/json" -d @transfer/transfer-02-consumer-pull/resources/start-transfer.json -s'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;

                // writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
            }
            response = await sendCommand(command);
            writeToTerminal("negotiateContract response: " + response);
            //Überprüfen, ob die Antwort gültig ist
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error") && !response.toLowerCase().includes("done")) {
                // writeToTerminal("Successful response received, transfer started.");
                const regex = /"@id":\s*"([a-f0-9\-]{36})"/;
                const match = response.match(regex);
                if (match && match[1]) {
                    transferProcessId = match[1];
                    writeToTerminal("transferprocessid: " + transferProcessId);
                }
                break; // Schleife beenden
            } else {
                // writeToTerminal("Keine gültige Antwort erhalten, erneut versuchen...");
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            }
            break;
        } catch (error) {
            writeToTerminal("Error at the start of the transfer: " + error);
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
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl -s 'http://localhost:29193/management/v3/transferprocesses/${transferProcessId}'"`;
                // writeToTerminal("check transfer command: " + command);
            }else{
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i ${containerIDProvider} /bin/sh -c 'curl -s 'http://localhost:29193/management/v3/transferprocesses/${transferProcessId}''\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
                // writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
            }

            const response = await sendCommand(command);
            // writeToTerminal(response);

            // Überprüfen, ob die Antwort gültig ist
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")) {
                
                const regex = /"state":\s*"([A-Z]+)"/;
                const match = response.match(regex);

                if (match && match[1]) {
                    const transferState = match[1];
                    // writeToTerminal(`Status: ${transferState}`);

                    if (transferState === "STARTED") {
                        writeToTerminal("Transfer started successfully!");
                        break; // Beendet die Schleife
                    }
                }
            } else {
                // writeToTerminal("Keine gültige Antwort erhalten, erneut versuchen...");
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
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl -s 'http://localhost:29193/management/v3/edrs/${transferProcessId}/dataaddress' | jq"`; 
            }else{
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i ${containerIDProvider} /bin/sh -c 'curl -s 'http://localhost:29193/management/v3/edrs/${transferProcessId}/dataaddress' | jq'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
                // writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
            }

            const response = await sendCommand(command);
            // writeToTerminal(response);

            // Überprüfen, ob die Antwort gültig ist
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")) {
                
                const regex = /"authorization":\s*"([A-Za-z0-9._-]+)"/;
                const match = response.match(regex);

                if (match && match[1]) {
                    authorizationKey = match[1];
                    // writeToTerminal(authorizationKey);
                    
                }
            } else {
                // writeToTerminal("Keine gültige Antwort erhalten, erneut versuchen...");
            }

            await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
                break;
        } catch (error) {
            writeToTerminal("Error when receiving the AuthorizationKey: " + error);
            throw error; // Fehler werfen, damit connectToProvider damit umgehen kann
        }
    }
}

async function getData(button, assetId, assetNumber){
    await new Promise((resolve) => setTimeout(resolve, 2000));
    while (true) {
        try {
            let command = null;  

            if(isLocalHost(button)){
                // writeToTerminal("get data local host");
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl -s -X GET 'http://localhost:19291/public' -H 'Authorization: ${authorizationKey}'"`; 
            }else{
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i ${containerIDProvider} /bin/sh -c 'curl -s -X GET 'http://localhost:19291/public' -H 'Authorization: ${authorizationKey}''\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
                // writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
            }

            let response = await sendCommand(command);
            // writeToTerminal(response);
            const assetKey = `asset${assetNumber}`; // Dynamisch den Schlüssel generieren, z.B. "asset2"
            const jsonKey = `jsonAsset${assetNumber}`; // Dynamisch den Schlüssel generieren, z.B. "asset2"
            console.log(assetKey);
            console.log(jsonKey);
            console.log("data response: " + response);
            console.log("AssetID: " + assetId);
            writeToTerminal("AssetID: " + assetId);
            sessionStorage.setItem(assetKey, assetId);
            sessionStorage.setItem(jsonKey, response);
            


            break;
        } catch (error) {
            writeToTerminal("Error when receiving the data: " + error);
            throw error; // Fehler werfen, damit connectToProvider damit umgehen kann
        }
    }
}

function extractContainerId(response) {
    if (!response) return null; // Falls keine Antwort vorhanden ist, return null

    // Zerlege die Antwort in Zeilen
    const lines = response.trim().split("\n");

    // Die letzte Zeile enthält die Container-ID, falls vorhanden
    const lastLine = lines[lines.length - 1].trim();

    // Überprüfe, ob die letzte Zeile eine gültige Container-ID ist (mindestens 12 Zeichen hexadezimal)
    if (/^[a-f0-9]{12,}$/.test(lastLine)) {
        return lastLine;
    }

    return null; // Falls keine gültige ID gefunden wurde
}


async function getContainerId(ipAdress, button) {
    let command = null;  

    if (isLocalHost(button)) {
        // Zuerst nach dem Container für das erste Image suchen
        command = `docker ps -q --filter "ancestor=mattis96/edc:edge"`;
        let containerId = (await sendCommand(command)).trim();
        
        // Falls keine Container-ID für das erste Image gefunden wurde, versuche das zweite Image
        if (!containerId) {
            command = `docker ps -q --filter "ancestor=mattis96/edc:pfc"`;
            containerId = (await sendCommand(command)).trim();
        }
        containerId = extractContainerId(containerId);
        writeToTerminal("Container ID: " + containerId);
        console.log("ContainerID: " + containerId);
        containerIDLocalHost = containerId; 
    } else {
        askForSshPassword(button);
        await new Promise((resolve) => setTimeout(resolve, 2000)); 
        
        // Erst das erste Image (edge) ausprobieren
        command = `expect -c 'spawn ssh root@${ipAdress} "docker ps -q --filter \\"ancestor=mattis96/edc:edge\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;
        writeToTerminal("Command1: " + command);
        let containerId = await sendCommand(command);
        writeToTerminal("ContainerID1: " + containerId);
        
        // Falls keine Container-ID für das erste Image gefunden wurde, das zweite Image ausprobieren
        if (!containerId) {
            command = `expect -c 'spawn ssh root@${ipAdress} "docker ps -q --filter \\"ancestor=mattis96/edc:pfc\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;
            writeToTerminal("Command2: " + command);
            containerId = (await sendCommand(command)).trim();
            writeToTerminal("ContainerID2: " + containerId);
        }
        containerId = extractContainerId(containerId);
        writeToTerminal("Container ID: " + containerId);
        console.log("ContainerID: " + containerId);
        containerIDProvider = containerId;
    }
}


async function startProvider(button) {
    writeToTerminal("Provider is started...");
    
    try {
        // Starte den Provider 
        await getContainerId(actorIpAdress[button.name], button);
        let command = null;  

        if(isLocalHost(button)){
            command = `docker exec -i ${containerIDLocalHost} /bin/sh -c 'java -Dedc.keystore=transfer/transfer-00-prerequisites/resources/certs/cert.pfx -Dedc.keystore.password=123456 -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/provider-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar'`; 
        }else{
            // askForSshPassword(button);
            await new Promise((resolve) => setTimeout(resolve, 2000)); // 1 Sekunde warten und erneut versuchen
            //Container-ID noch ändern!
            command = `expect -c 'spawn ssh root@${actorIpAdress[button.name]} "docker exec -i ${containerIDProvider} /bin/sh -c \\\"java -Dedc.keystore=transfer/transfer-00-prerequisites/resources/certs/cert.pfx -Dedc.keystore.password=123456 -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/provider-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar\\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;
        }

        sendCommand(command);
        // writeToTerminal("Provider erfolgreich gestartet!");
    } catch (error) {
        writeToTerminal("Error when starting the provider: " + error);
        throw error; // Wir werfen den Fehler, damit connectToProvider damit umgehen kann
    }
}

async function createAssets(button) {
    writeToTerminal("Start asset creation...");
    
    const jsonFiles = ["create-asset-temperature.json", "create-asset-resistanceValue.json", "create-asset-IO.json"];
    // const jsonFiles = ["create-asset-resistanceValue.json","create-asset-temperature.json"];
    for (const jsonFile of jsonFiles) {
        while (true) {
            try {
                let command = null;
                if (isLocalHost(button)) {
                    writeToTerminal("create assets...");
                    command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl --data-binary @transfer/transfer-01-negotiation/resources/${jsonFile} -H 'Content-Type: application/json' http://localhost:19193/management/v3/assets -s"`; 
                } else {
                    command = `expect -c 'spawn ssh root@${actorIpAdress[button.name]} "docker exec -i ${containerIDProvider} /bin/sh -c \\\"curl -d @transfer/transfer-01-negotiation/resources/${jsonFile} -H \\\\\\\"content-type: application/json\\\\\\\" http://localhost:19193/management/v3/assets -s\\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;
                }

                // writeToTerminal(`Sende Anfrage mit Datei: ${jsonFile}`);
                const response = await sendCommand(command);
                
                // Überprüfen, ob die Antwort gültig ist
                if (response && response.trim() !== "" && 
                    !response.toLowerCase().includes("fehler") && 
                    !response.toLowerCase().includes("failed") && 
                    !response.toLowerCase().includes("error") && 
                    response.toLowerCase().includes("id")) {
                    
                    // writeToTerminal(`Erfolgreiche Antwort für ${jsonFile} erhalten, Asset erstellt.`);
                    // writeToTerminal(response);
                    break; // Erfolgreich -> nächste Datei
                } else {
                    // writeToTerminal(`Keine gültige Antwort für ${jsonFile}, erneut versuchen...`);
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
                }
            } catch (error) {
                writeToTerminal(`Error when creating the assets for ${jsonFile}: ` + error);
                throw error; // Fehler werfen, damit connectToProvider damit umgehen kann
            }
        }
    }
    
    writeToTerminal("All assets have been successfully created.");
}


async function createPolicies(button){
    writeToTerminal("Start policy creation...");
    
    while (true) {
        try {

            let command = null;  

            if(isLocalHost(button)){
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl --data-binary @transfer/transfer-01-negotiation/resources/create-policy.json -H 'content-type: application/json' http://localhost:19193/management/v3/policydefinitions -s"`; 
            }else{
                command = `expect -c 'spawn ssh root@${actorIpAdress[button.name]} "docker exec -i ${containerIDProvider} /bin/sh -c \\\"curl -d @transfer/transfer-01-negotiation/resources/create-policy.json -H \\\\\\\"content-type: application/json\\\\\\\" http://localhost:19193/management/v3/policydefinitions -s\\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;
                // writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
            }

            const response = await sendCommand(command);
            
            // Überprüfen, ob die Antwort gültig ist
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")) {
                // writeToTerminal("Erfolgreiche Antwort erhalten, Policy erstellt.");
                // writeToTerminal(response);
                break; // Schleife beenden
            } else {
                // writeToTerminal("Keine gültige Antwort erhalten, erneut versuchen...");
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            }






            
        } catch (error) {
            writeToTerminal("Error when creating the policies: " + error);
            throw error; // Fehler werfen, damit connectToProvider damit umgehen kann
        }
    }
}

async function createContractDefinition(button){
    writeToTerminal("Start contract creation...");
    
    while (true) {
        try {

            let command = null;  

            if(isLocalHost(button)){
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl -d @transfer/transfer-01-negotiation/resources/create-contract-definition.json -H 'content-type: application/json' http://localhost:19193/management/v3/contractdefinitions -s"`; 
            }else{
                command = `expect -c 'spawn ssh root@${actorIpAdress[button.name]} "docker exec -i ${containerIDProvider} /bin/sh -c \\\"curl -d @transfer/transfer-01-negotiation/resources/create-contract-definition.json -H \\\\\\\"content-type: application/json\\\\\\\" http://localhost:19193/management/v3/contractdefinitions -s\\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;

            }

            const response = await sendCommand(command);
            
            // Überprüfen, ob die Antwort gültig ist
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")) {
                // writeToTerminal("Erfolgreiche Antwort erhalten, Vertrag erstellt.");
                // writeToTerminal(response);
                break; // Schleife beenden
            } else {
                // writeToTerminal("Keine gültige Antwort erhalten, erneut versuchen...");
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten und erneut versuchen
            }
        } catch (error) {
            writeToTerminal("Error when creating the contract definition: " + error);
            throw error; // Fehler werfen, damit connectToProvider damit umgehen kann
        }
    }
}

function disconnectFromDevice(button){
    sessionStorage.setItem(button.name, "");
    writeToTerminal(button.name + " has beend stopped");

    let command = null;  
    // pkill an sich nicht nötig, da die Geräte ja provider und consumer sind, egal bo "verbunden" oder nicht. Hier muss eine andere Funktion rein, wie dass auf provider und consumer-
    // Seite keine Informationen angezeigt werden, wenn diese nicht verbunden sind
    if(isLocalHost(button)){
        command = `docker exec -i ${containerIDLocalHost} /bin/sh -c \"pkill -f connector.jar\"`; 
    }else{
        // writeToTerminal("Hier dann Befehl um auf anderem Geraet auszuführen");
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
        sessionStorage.setItem('countConsumer', count);
    }
}

function removeConsumer() {
    let container = document.getElementById("consumer-container");
    let consumers = container.querySelectorAll(".consumer-group"); // Holt nur die Consumer-Elemente
    let lastConsumer = consumers[consumers.length - 1];

    let inputField  = lastConsumer.querySelector("input");
    if (consumers.length > 1 && !inputField.disabled) { // Der erste Consumer bleibt immer erhalten
        container.removeChild(lastConsumer); // Nur das letzte Consumer-Element entfernen
        sessionStorage.setItem('countConsumer', consumers.length-1);
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







await getHostIp();
loadConfiguration();
console.log(actorIpAdress);
window.addConsumer = addConsumer;
window.removeConsumer = removeConsumer;
addEventListenerToButtons();