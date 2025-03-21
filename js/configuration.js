
// WebSocket connection to the server for real-time communication
const ws = new WebSocket("ws://localhost:3000");

// Defines the actors for provider and consumer
const textProvider = "provider";
const textConsumer = "consumer";

// General and temporary variables for the connection process
let input = null;
let hostIP = null;
let matchPolicyIds = null;
let matchAssetIds = null;
let contractNegotiationId = null;
let contractAgreementId = null;
let transferProcessId = null;
let authorizationKey = null;

// Stores container IDs for local and remote providers
let containerIDLocalHost = null;
let containerIDProvider = null;

// IP addresses of the actors, loaded from sessionStorage
const actorIpAdress = {
    consumer1: sessionStorage.getItem("consumer1") || "",
    consumer2: sessionStorage.getItem("consumer2") || "",
    consumer3: sessionStorage.getItem("consumer3") || "",
    provider: sessionStorage.getItem("provider") || ""
};

// Asset IDs corresponding to the transferred data
const assetIds = {
    asset1: sessionStorage.getItem("asset1") || "",
    asset2: sessionStorage.getItem("asset2") || "",
    asset3: sessionStorage.getItem("asset3") || ""
};

// JSON data of assets from sessionStorage
const jsonAssetData = {
    jsonAsset1: sessionStorage.getItem("jsonAsset1") || "",
    jsonAsset2: sessionStorage.getItem("jsonAsset2") || "",
    jsonAsset3: sessionStorage.getItem("jsonAsset3") || ""
};

// Stores container IDs of the actors (not used right now) right now containerIDLocalHost and containerIDProvider are used. Should be changed
const actorContainerId = {
    consumer1: sessionStorage.getItem("consumer1") || "",
    consumer2: sessionStorage.getItem("consumer2") || "",
    consumer3: sessionStorage.getItem("consumer3") || "",
    provider: sessionStorage.getItem("provider") || ""
};

const actorSshPassword = {
    consumer1: sessionStorage.getItem("consumer1") || "",
    consumer2: sessionStorage.getItem("consumer2") || "",
    consumer3: sessionStorage.getItem("consumer3") || "",
    provider: sessionStorage.getItem("provider") || ""
};

// Terminal variable for the user interface
let term;

// Triggered when the WebSocket connection is successfully opened
ws.onopen = () => console.log("Connected to the WebSocket server.");

// Triggered when the WebSocket connection is closed
ws.onclose = () => console.log("Connection closed.");

// Waits until the DOM is fully loaded before executing the function
window.addEventListener("DOMContentLoaded", () => {
    // Adds a click event listener to the element with ID "send-command"
    document.getElementById("send-command")?.addEventListener("click", () => {
        // Retrieves the value from the input field with ID "command"
        const command = document.getElementById("command").value;
        
        // Checks if a command is entered before sending it via WebSocket
        if (command) {
            ws.send(command);
        }
    });
});




/**
 * Initializes the terminal inside a specified container if it has not been initialized yet.
 * @param {string} terminalContainerId - The ID of the container where the terminal should be created.
 */
function initializeTerminal(terminalContainerId) {
    // Check if the terminal instance already exists to prevent re-initialization
    if (!term) {
        // Get the terminal container element by its ID
        const terminalContainer = document.getElementById(terminalContainerId);
        
        // Check if the container element exists
        if (!terminalContainer) {
            console.log('No terminal container found, terminal will not be initialized.');
            return; // Prevent initialization if no terminal container is available
        }

        // Create a new terminal instance
        term = new Terminal();
        // Attach the terminal to the container
        term.open(terminalContainer);

        // Configure the terminal after initialization
        term.writeln('Welcome to the web terminal!');
        term.writeln('Next, communication between provider and consumers will follow.');
    }
}

/**
 * Writes the given text to the terminal, followed by a separator line.
 * If the terminal is not initialized, an error message is logged.
 * @param {string} text - The text to be written to the terminal.
 */
function writeToTerminal(text) {
    // Ensure that the terminal is initialized before writing
    if (term) { 
        // Write the provided text to the terminal
        term.writeln(text); 
        
        // Print a separator line
        term.writeln("--------------------------------------------------------------------------------"); 
    } else {
        // Log an error if the terminal is not available
        console.error('Terminal is not initialized yet!');
        term.writeln("--------------------------------------------------------------------------------");
    }
}



/**
 * Sends a command to the terminal via WebSocket and returns a Promise that resolves with the response.
 * The command is sent to the server, and once a response is received, the Promise is resolved with the data.
 * If the command or WebSocket has an issue, the Promise is rejected with an error message.
 * 
 * Steps:
 * 1. Checks if a command is provided.
 * 2. Sends the command via WebSocket.
 * 3. Listens for responses from the server.
 * 4. Filters out debug, warning, and termination messages.
 * 5. Resolves the Promise with the response data or rejects it on error.
 * 6. Handles WebSocket closure gracefully by resolving with the response, if available, or rejecting if no response is received.
 * 
 * @param {string} command - The command to be sent to the terminal.
 * @returns {Promise} - A Promise that resolves with the response from the server.
 */
function sendCommand(command) {
    return new Promise((resolve, reject) => {
        // Check if a command is provided
        if (!command) {
            reject("No command provided");
            return;
        }

        // Log the command being sent
        console.log("Sending command:", command);
        ws.send(command); // Send the command via WebSocket

        // Variable to store the full response
        let responseText = ""; 

        // Handle incoming messages from the WebSocket
        ws.onmessage = (event) => {
            console.log("Response received:", event.data);

            // Filter out debug, warning messages, and termination messages
            if (!event.data.includes("Prozess beendet mit Code") &&
                !event.data.includes("DEBUG") &&
                !event.data.includes("WARNING")) {
                
                // Append received data to the response text
                responseText += event.data + "\n"; 
                
                // Resolve the promise with the received data
                resolve(event.data.trim());
            }

            // If the message contains "Prozess beendet mit Code", it indicates the process has finished.
            if (event.data.includes("Prozess beendet mit Code")) {
            }
        };

        // Handle WebSocket errors
        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            reject("Error receiving response: " + error);
        };

        // Handle WebSocket closure
        ws.onclose = () => {
            console.warn("WebSocket connection closed");
            
            // If there's a response text, resolve the promise with it
            if (responseText) {
                // writeToTerminal("ResponseText: " + responseText);
                resolve(responseText.trim()); 
            } else {
                // Reject if the WebSocket closed before receiving a response
                reject("WebSocket closed before a response was received.");
            }
        };
    });
}


/**
 * Fetches the host's IP address from the server via an API request. The host IP was transferred when the container was created
 * This function makes a network request to the server and retrieves the host's IP address in JSON format.
 * If successful, it stores the IP address in a variable and logs it to the console.
 * If there's an error during the fetch or response processing, it logs the error and returns `null`.
 * 
 * Steps:
 * 1. Makes a GET request to the '/api/host-ip' endpoint.
 * 2. If the request is successful, parses the JSON response and extracts the `hostIp` value.
 * 3. Logs the IP address to the console and stores it in a variable.
 * 4. If any errors occur (network error, invalid response), it catches the error and logs it.
 * 
 * @returns {Promise<string|null>} - A promise that resolves to the host's IP address or `null` if there's an error.
 */
async function getHostIp() {
    try {
        // Make a fetch request to the server to get the host's IP
        const response = await fetch('/api/host-ip');

        // Check if the response is OK (status code 2xx)
        if (!response.ok) {
            throw new Error('Network error: ' + response.status); // Throw an error if not successful
        }

        // Parse the response JSON and extract the host IP
        const data = await response.json();
        const hostIp = data.hostIp; // Store the IP address in a variable

        // Log the IP address to the console
        console.log(hostIp);
        
        // Store the IP address in a variable for further use
        hostIP = hostIp; 

    } catch (error) {
        // Log any errors that occur during the process
        console.error('Error fetching host IP:', error);
        
        // Return null if there's an error
        return null;
    }
}






if (document.getElementById('terminal-container')) {
    // Wait for the DOM to be fully loaded before initializing the terminal
    window.addEventListener('DOMContentLoaded', () => {
        // Initialize the terminal in the specified container
        initializeTerminal('terminal-container');
    });
}


// functions


/**
 * Loads the configuration for the page, performs necessary checks, restores previous values, and initializes the terminal.
 * This function is specifically executed on the "configuration.html" page, where it manages the restoration of page structure,
 * input values, terminal logs, and ensures necessary session data is in place.
 * 
 * Steps:
 * 1. Checks if the current page is "configuration.html".
 * 2. Logs asset IDs and JSON asset data for debugging purposes.
 * 3. Checks the sessionStorage for 'countConsumer' and initializes it if not found.
 * 4. Restores dynamic page structure, input values, and terminal logs.
 * 5. Initializes the terminal if it hasn't been initialized yet and restores previous logs.
 * 6. Sets up an event listener to save data before the page unloads (dynamic structure, input values, and terminal logs).
 * 7. Reattaches events to elements for interaction.
 * 8. Fetches and logs the host IP address.
 */
async function loadConfiguration() {
    // Check if the current page is "configuration.html"
    if (window.location.pathname.includes("configuration.html")) {
        // Log asset IDs and JSON asset data for debugging purposes
        console.log(assetIds);
        console.log(jsonAssetData);

        // Check if 'countConsumer' exists in sessionStorage, and initialize it if not
        if (sessionStorage.getItem('countConsumer') === null) {
            // If it doesn't exist, set it to 1
            sessionStorage.setItem('countConsumer', 1);
        }

        // Restore dynamic page structure (e.g., Consumers) from previous session
        restorePageStructure();
        
        // Restore previous input values and checkbox states
        restoreValues(); 
        
        // Restore terminal logs
        restoreTerminalLogs();

        // Only initialize the terminal if it hasn't been initialized yet
        if (!term) {
            initializeTerminal("terminal-container");
            // Show saved terminal logs again
            restoreTerminalLogs(); 
        }

        // Set up event listener to save data before the page unloads
        window.addEventListener("beforeunload", function () {
            // Save dynamic page structure (Consumers, Providers)
            savePageStructure();  
            // Save input values
            saveValues();         
            // Save terminal text
            saveTerminalLogs();   
        });

        // Reattach events to the necessary elements
        reattachEvents();

        // Fetch and log the host IP address asynchronously
        await getHostIp();
        console.log(hostIP);
    }
}


/**
 * Saves the terminal logs from the active terminal buffer into sessionStorage.
 * This function iterates through the terminal buffer, starting from the third line (index 2),
 * and collects non-empty lines to store them in sessionStorage for later restoration.
 * 
 * Steps:
 * 1. Checks if the terminal is initialized (`term` exists).
 * 2. Iterates through the terminal buffer starting from the third line (index 2).
 * 3. Collects all non-empty lines and pushes them into an array.
 * 4. Saves the array of terminal logs as a JSON string in sessionStorage under the key "terminal_logs".
 */
function saveTerminalLogs() {
    // Check if the terminal is initialized
    if (term) {
        let lines = [];
        // Get the active terminal buffer
        let buffer = term.buffer.active;  

        // Iterate through the terminal buffer starting from the third line (index 2)
        for (let i = 2; i < buffer.length; i++) {
            // Get the line at the current index, or an empty string if it doesn't exist
            let line = buffer.getLine(i)?.translateToString() || ""; 

            // Only store non-empty lines
            if (line.trim() !== "") {
                lines.push(line);
            }
        }

        // Save the collected non-empty lines in sessionStorage
        sessionStorage.setItem("terminal_logs", JSON.stringify(lines));
    }
}


// Saves the HTML content of the consumer and provider containers in sessionStorage
function savePageStructure() {
    // Store the inner HTML of the 'consumer-container' in sessionStorage
    sessionStorage.setItem("consumer-container", document.getElementById("consumer-container").innerHTML);
    
    // Store the inner HTML of the 'provider-container' in sessionStorage
    sessionStorage.setItem("provider-container", document.getElementById("provider-container").innerHTML);
}


// Restores the HTML content of the consumer and provider containers from sessionStorage
function restorePageStructure() {
    // Retrieve the saved consumer container HTML from sessionStorage
    let savedConsumers = sessionStorage.getItem("consumer-container");
    
    // Retrieve the saved provider container HTML from sessionStorage
    let savedProviders = sessionStorage.getItem("provider-container");

    // If saved consumers exist, restore the HTML content in the 'consumer-container'
    if (savedConsumers) {
        document.getElementById("consumer-container").innerHTML = savedConsumers;
    }

    // If saved providers exist, restore the HTML content in the 'provider-container'
    if (savedProviders) {
        document.getElementById("provider-container").innerHTML = savedProviders;
    }
}


// Restores the terminal logs from sessionStorage and writes them back to the terminal
function restoreTerminalLogs() {
    // Retrieve the saved terminal logs from sessionStorage
    let savedLogs = sessionStorage.getItem("terminal_logs");
    
    // If there are saved logs and the terminal is initialized, restore the logs
    if (savedLogs && term) {
        // Parse the saved logs into an array of lines
        let lines = JSON.parse(savedLogs);
        
        // Write each line back to the terminal
        lines.forEach(line => term.writeln(line));
    }
}


// Saves the values of input fields, textareas, selects, checkboxes, and radio buttons in sessionStorage
function saveValues() {
    // Store the values of input, textarea, and select elements in sessionStorage
    document.querySelectorAll("input, textarea, select").forEach(el => {
        sessionStorage.setItem(el.id + "_value", el.value);
    });

    // Store the checked state of checkboxes and radio buttons in sessionStorage
    document.querySelectorAll("input[type='checkbox'], input[type='radio']").forEach(el => {
        sessionStorage.setItem(el.id + "_checked", el.checked);
    });
}

// Restores the values and checked states of input fields, textareas, selects, checkboxes, and radio buttons from sessionStorage
function restoreValues() {
    // Restore the values of input, textarea, and select elements from sessionStorage
    document.querySelectorAll("input, textarea, select").forEach(el => {
        let savedValue = sessionStorage.getItem(el.id + "_value");
        if (savedValue !== null) el.value = savedValue;
    });

    // Restore the checked state of checkboxes and radio buttons from sessionStorage
    document.querySelectorAll("input[type='checkbox'], input[type='radio']").forEach(el => {
        let savedChecked = sessionStorage.getItem(el.id + "_checked");
        if (savedChecked !== null) el.checked = savedChecked === "true";
    });
}

// Reattaches click event listeners to elements with the "clickable" class
function reattachEvents() {
    // Loop through all elements with the "clickable" class
    document.querySelectorAll(".clickable").forEach(el => {
        // Add a click event listener to each element
        el.addEventListener("click", function () {
            alert("Element wurde erneut aktiviert!"); // Show an alert when the element is clicked
        });
    });
}




// Adds event listeners to buttons within specific groups (consumer, provider, navbar)
function addEventListenerToButtons() {
    // Select all buttons within the consumer group
    const consumerButtons = document.querySelectorAll(".consumer-group button");
    // Select all buttons within the provider group
    const providerButtons = document.querySelectorAll(".provider-group button");
    // Select all buttons within the navbar
    const resetButton = document.querySelectorAll(".navbar button");

    // Reset and add event listeners for each group of buttons
    resetAndAddEventListeners(consumerButtons);
    resetAndAddEventListeners(providerButtons);
    resetAndAddEventListeners(resetButton);
}


// Resets and adds new event listeners to the buttons
function resetAndAddEventListeners(buttons) {
    buttons.forEach(button => {
        // Remove all existing event listeners by replacing the button with a clone
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Add a new event listener to the cloned button
        newButton.addEventListener("click", function () {
            handleButtonClick(newButton); // Handle the click event on the new button
        });
    });
}


// Toggles the connection state for a device based on the provided address, input, and button
function toggleConnection(address, input, button) {
    // If the input is not disabled, establish a connection
    if(input.disabled == false) {
        // Save the address in the actorIpAdress object and sessionStorage
        actorIpAdress[button.name] = address;
        sessionStorage.setItem(button.name, address); // Writes the address into the suitable part of actorIpAdress
        console.log(`New address of ${button.name}:`, address);
        console.log(actorIpAdress);
        
        // Write to the terminal about the connection
        writeToTerminal('connected to ' + button.name + " with address: " + address);
        
        // Change the button color to indicate it's connected
        button.style.backgroundColor = "#6EC800";
        input.disabled = true; // Disable the input field after connecting
        
        // Call function to connect to the device
        connectToDevice(button);
    } else {
        // If the input is disabled, disconnect from the device
        disconnectFromDevice(button);
        console.log(button.name + " is disconnected");
        
        // Write to the terminal about the disconnection
        writeToTerminal('disconnected from ' + button.name + " with address: " + address);
        
        // Reset the button color and re-enable the input field
        button.style.backgroundColor = "#EFEFEF";
        input.disabled = false;
    }
}

// Connects to a device based on the button's name, either as a consumer or provider
function connectToDevice(button) {
    switch(true) {
        // If the button's name includes "textConsumer", connect to the consumer
        case button.name.includes(textConsumer):
            connectToConsumer(button);
            break;
        
        // If the button's name includes "textProvider", connect to the provider
        case button.name.includes(textProvider):
            connectToProvider(button);
            break;
    }
}


// Prompts the user to enter an SSH password for a specific device and stores it in sessionStorage
function askForSshPassword(button) {
    // Ask the user to input the SSH password for the given button (device)
    const password = prompt(`Bitte geben Sie das SSH-Passwort für ${button.name} ein:`);

    // If the user provides a password, store it
    if (password !== null) {
        // Store the password in the actorSshPassword object and sessionStorage
        actorSshPassword[button.name] = password;
        sessionStorage.setItem(button.name, password); // Speichert das Passwort in der Session
        
        // Log the stored password (for debugging purposes)
        console.log(`Passwort für ${button.name} gespeichert.`);
        
        // Write to the terminal that the SSH password has been saved
        writeToTerminal("SSH password for " + button.name + ": " + actorSshPassword[button.name]);
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

// Connects to a consumer, negotiates contracts, and handles asset transfers for the consumer
async function connectToConsumer(button) {
    // Start the consumer connection process
    await startConsumer(button);
    
    // Fetch the catalog for the consumer
    await fetchCatalog(button);
    
    // If there are matching policy IDs, proceed with contract negotiation and asset transfer
    if (matchPolicyIds) {
        for (let i = 0; i < matchPolicyIds.length; i++) {
            // Negotiate contract for each matched policy and asset ID
            await negotiateContract(button, matchPolicyIds[i], matchAssetIds[i]);
            
            // Get the contract agreement ID for the consumer
            await gettingContractAgreementID(button);
            
            // Start the asset transfer for the matched asset ID
            await startTransfer(button, matchAssetIds[i]);
            
            // Check the transfer status for the asset
            await checkTransferStatus(button);
            
            // Retrieve the authorization key for the consumer
            await getAuthorizationKey(button);
            
            // Fetch the data for the consumer and asset
            await getData(button, matchAssetIds[i], i + 1);
        }
        
        // Write to the terminal that the consumer has been successfully connected
        writeToTerminal("Consumer successfully connected!");
    } else {
        // Log if no matching policy IDs were found
        console.log("No policy IDs were found.");
    }
}


// Checks if the actor's IP address matches the host IP for a given button
function isLocalHost(button) {
    // If the actor's IP address matches the host IP, return true
    if (actorIpAdress[button.name] == hostIP) {
        return true;
    }
}


/**
 * Starts the consumer by executing the necessary Docker command based on the connection type (local or remote)
 * It handles SSH authentication for remote connections and executes the command to run the consumer.
 * 
 * @param {object} button - The button element that triggered the consumer start action. Contains the name property 
 *                           which represents the type of actor (consumer/provider).
 * @param {string} button.name - The name property of the button (either "consumer" or "provider") used to 
 *                                identify the target actor.
 * @returns {Promise} - A Promise that resolves when the consumer has started and the associated commands have been executed.
 */
async function startConsumer(button) {
    writeToTerminal("Consumer is started...");

    try {
        let command = null;  // Variable to hold the shell command to start the consumer

        // Get the container ID based on the actor's IP address for the given button
        getContainerId(actorIpAdress[button.name], button);

        // If the actor is on the same local host, use a local Docker command
        if (isLocalHost(button)) {
            // Command to start the consumer on the local machine using Docker
            command = `docker exec -i ${containerIDLocalHost} /bin/sh -c "java -Dedc.keystore=transfer/transfer-00-prerequisites/resources/certs/cert.pfx -Dedc.keystore.password=123456 -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/consumer-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar"`;
        } else {
            // If the actor is on a remote machine, prompt for SSH password and use SSH to run the Docker command
            askForSshPassword(button);
            
            // Wait for 1 second to allow SSH password input and retry the command
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying

            // SSH command to connect to the remote machine and start the consumer in the container
            command = `expect -c 'spawn ssh root@${actorIpAdress[button.name]} "docker exec -i ${containerIDProvider} /bin/sh -c \\\"java -Dedc.keystore=transfer/transfer-00-prerequisites/resources/certs/cert.pfx -Dedc.keystore.password=123456 -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/consumer-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar\\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;
        }

        // Send the command to the terminal to execute
        sendCommand(command);
        
    } catch (error) {
        writeToTerminal("Error when starting the consumer: " + error);
        throw error; // Throw the error so connectToConsumer can handle it
    }
}




/**
 * Fetches the catalog by making a request to the specified endpoint, either locally or remotely.
 * If the request is successful, it extracts the Asset and Policy IDs from the response and logs the details.
 * 
 * @param {object} button - The button element that triggered the fetch action. Contains the name property 
 *                           which is used to identify the actor (consumer/provider).
 * @param {string} button.name - The name property of the button used to identify the actor (either "consumer" or "provider").
 * @returns {Promise} - A Promise that resolves once the catalog has been successfully fetched and processed.
 */
async function fetchCatalog(button) {
    writeToTerminal("Fetch catalog...");
    
    while (true) {
        try {
            let command = null;  // Variable to hold the shell command for fetching the catalog

            // If the actor is on the local host, use a local Docker command
            if (isLocalHost(button)) {
                // Command to fetch the catalog from a local service using curl in a Docker container
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl -X POST "http://localhost:29193/management/v3/catalog/request" -H 'Content-Type: application/json' -d @transfer/transfer-01-negotiation/resources/fetch-catalog.json -s"`;
            } else {
                // If the actor is on a remote machine, use SSH to execute the curl command remotely
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i ${containerIDProvider} /bin/sh -c 'curl -X POST \\\\\\"http://localhost:29193/management/v3/catalog/request\\\\\\" -H \\\\\\"Content-Type: application/json\\\\\\" -d @transfer/transfer-01-negotiation/resources/fetch-catalog.json -s'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
            }

            // Send the command and wait for the response
            const response = await sendCommand(command);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying

            // Check if the response is valid (not empty or containing error messages)
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error") && response.toLowerCase().includes("@id")) {
                writeToTerminal("Successful response received, catalog is fetched");

                // Parse the response JSON and extract the Asset and Policy IDs
                const jsonData = JSON.parse(response);
                matchAssetIds = jsonData['dcat:dataset'].map(dataset => dataset['@id']);
                matchPolicyIds = jsonData['dcat:dataset'].map(dataset => dataset['odrl:hasPolicy']['@id']);

                console.log("AssetIds: " + matchAssetIds);

                break; // Break out of the loop once the catalog has been successfully fetched
            } else {
                // If the response is invalid, wait 1 second and try again
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
            }
        } catch (error) {
            writeToTerminal("Error when starting the consumer: " + error);
            throw error; // Throw the error so that connectToProvider can handle it
        }
    }
}


/**
 * Negotiates a contract by sending the policy ID and asset ID to the appropriate service.
 * The negotiation process updates the contract file with the new policy and asset information 
 * and sends it to the server for processing.
 * 
 * @param {object} button - The button element that triggered the contract negotiation.
 * @param {string} policyId - The ID of the policy to be negotiated.
 * @param {string} assetId - The ID of the asset to be negotiated.
 * @returns {Promise} - A Promise that resolves once the contract negotiation is successful and a contract ID is retrieved.
 */
async function negotiateContract(button, policyId, assetId) {
    // Log the asset ID for debugging purposes
    writeToTerminal("Get data for asset with ID: " + assetId);


    writeToTerminal("Contract negotiation...");
    await new Promise((resolve) => setTimeout(resolve, 1000));  // 1 second wait before starting negotiation

    while (true) {
        try {
            let command = null;  // Holds the shell command for the negotiation

            // If the negotiation is on the local host, modify the contract file using jq
            if (isLocalHost(button)) {
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "jq --arg new_id '${policyId}' --arg asset_id '${assetId}' '.policy[\\\"@id\\\"] = \\$new_id | .policy[\\\"target\\\"] = \\$asset_id' transfer/transfer-01-negotiation/resources/negotiate-contract.json > /tmp/temp.json && mv /tmp/temp.json transfer/transfer-01-negotiation/resources/negotiate-contract.json && echo DONE"`;
                await new Promise((resolve) => setTimeout(resolve, 2000));  // Wait 2 seconds for the contract file to update
            } else {
                // If the negotiation is remote, use SSH to modify the contract file
                command = `expect -c 'spawn ssh root@${actorIpAdress[button.name]} "docker exec -i ${containerIDProvider} /bin/sh -c \\"jq --arg new_id \\"${policyId}\\" \\".policy[\\\"@id\\\"] = \\\"$new_id\\\"\\\" transfer/transfer-01-negotiation/resources/negotiate-contract.json > /tmp/temp.json && mv /tmp/temp.json transfer/transfer-01-negotiation/resources/negotiate-contract.json\\""; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact'`;
                
                writeToTerminal("Write policy ID to file...");
            }

            // Send the command to update the contract file
            let response = await sendCommand(command);

            // Send the updated contract to the negotiation endpoint
            if (isLocalHost(button)) {
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl -d @transfer/transfer-01-negotiation/resources/negotiate-contract.json -X POST -H 'content-type: application/json' http://localhost:29193/management/v3/contractnegotiations -s"`;
            } else {
                await new Promise((resolve) => setTimeout(resolve, 1000));  // Wait 1 second before retrying
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i ${containerIDProvider} /bin/sh -c 'curl -d @transfer/transfer-01-negotiation/resources/negotiate-contract.json -X POST -H \\\\\\"content-type: application/json\\\\\\" http://localhost:29193/management/v3/contractnegotiations -s'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
            }

            // Send the negotiation request and get the response
            response = await sendCommand(command);

            // Check if the response is valid and contains the contract negotiation ID
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error") && !response.toLowerCase().includes("done")) {
                writeToTerminal("Successful response received, contract negotiated.");
                
                // Use regex to extract the contract negotiation ID from the response
                const regex = /"@id":\s*"([a-fA-F0-9\-]{36})"/;
                const match = response.match(regex);
                
                // If a match is found, store the contract negotiation ID
                if (match && match[1]) {
                    contractNegotiationId = match[1];
                }
                break;  // Break the loop once the contract has been successfully negotiated
            } else {
                await new Promise((resolve) => setTimeout(resolve, 1000));  // Wait 1 second before retrying
            }
        } catch (error) {
            writeToTerminal("Errors in negotiating the contract: " + error);
            throw error;  // Throw the error so that connectToProvider can handle it
        }
    }
}


/**
 * Retrieves the contract agreement ID by making a GET request to the contract negotiations endpoint.
 * It continuously tries to get a valid response from the server and parses the response for the contract agreement ID.
 * 
 * @param {object} button - The button element that triggered the request for the contract agreement ID.
 * @returns {Promise} - A Promise that resolves once the contract agreement ID has been successfully retrieved.
 */
async function gettingContractAgreementID(button) {
    writeToTerminal("Get contractAgreementID...");

    // Initial delay before sending the first request
    await new Promise((resolve) => setTimeout(resolve, 2000));

    while (true) {
        try {
            let command = null;  // Holds the shell command to be executed

            // Check if the command should be executed locally or remotely
            if (isLocalHost(button)) {
                // Local command to retrieve contract agreement ID
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl -X GET 'http://localhost:29193/management/v3/contractnegotiations/${contractNegotiationId}' --header 'Content-Type: application/json' -s | jq"`;
            } else {
                // Remote command to retrieve contract agreement ID (via SSH)
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second wait before retrying
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i ${containerIDProvider} /bin/sh -c 'curl -X GET \\\\\\"http://localhost:29193/management/v3/contractnegotiations/${contractNegotiationId}\\\\\\" --header \\\\\\"Content-Type: application/json\\\\\\" -s'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
            }

            // Send the command to fetch the contract agreement ID
            const response = await sendCommand(command);

            // Check if the response is valid and contains the contract agreement ID
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")) {
                writeToTerminal("Successful response received, contractAgreementID received.");

                // Use regex to extract the contract agreement ID from the response
                const regex = /"contractAgreementId":\s*"([a-fA-F0-9\-]{36})"/;
                const match = response.match(regex);

                // If a match is found, store the contract agreement ID
                if (match && match[1]) {
                    contractAgreementId = match[1];
                }

                break; // Exit the loop once the contract agreement ID is successfully retrieved
            } else {
                // If the response is not valid, wait 1 second before retrying
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        } catch (error) {
            writeToTerminal("Error receiving the ContractAgreementID: " + error);
            throw error; // Throw the error to be handled by the calling function (e.g., connectToProvider)
        }
    }
}


/**
 * Starts the transfer process by sending a command to initiate the transfer and checking the response.
 * 
 * @param {object} button - The button element that triggered the transfer process.
 * @param {string} assetId - The ID of the asset being transferred.
 * @returns {Promise} - A Promise that resolves once the transfer process is successfully initiated.
 */
async function startTransfer(button, assetId) {
    let command = null; // Holds the shell command to be executed

    // Check if the command should be executed locally or remotely
    if (isLocalHost(button)) {
        // Local command to start the transfer
        command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "jq --arg new_id '${contractAgreementId}' --arg asset_id '${assetId}' '.contractId = \\$new_id | .assetId = \\$asset_id' transfer/transfer-02-consumer-pull/resources/start-transfer.json > /tmp/temp.json && mv /tmp/temp.json transfer/transfer-02-consumer-pull/resources/start-transfer.json && echo DONE"`;
    } else {
        // Remote command to start the transfer via SSH
        command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i ${containerIDProvider} /bin/sh -c 'jq --arg new_id \\\\\\"${contractAgreementId}\\\\\\" \\\\\\\".contractId = \\\\\\$new_id\\\\\\\\" transfer/transfer-02-consumer-pull/resources/start-transfer.json > /tmp/temp.json && mv /tmp/temp.json transfer/transfer-02-consumer-pull/resources/start-transfer.json && echo DONE'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
    }

    // Send the initial command to start the transfer
    let response = await sendCommand(command);
    
    // Wait 1 second before checking the transfer status
    await new Promise((resolve) => setTimeout(resolve, 1000));

    writeToTerminal("Transfer started...");

    // Continuously check the transfer process status
    while (true) {
        try {
            // Check if the command should be executed locally or remotely
            if (isLocalHost(button)) {
                // Local command to check the transfer status
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c 'curl -X POST "http://localhost:29193/management/v3/transferprocesses" -H "Content-Type: application/json" -d @transfer/transfer-02-consumer-pull/resources/start-transfer.json -s | jq'`;
            } else {
                // Remote command to check the transfer status via SSH
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i ${containerIDProvider} /bin/sh -c 'curl -X POST "http://localhost:29193/management/v3/transferprocesses" -H "Content-Type: application/json" -d @transfer/transfer-02-consumer-pull/resources/start-transfer.json -s'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
            }

            // Send the command to check the transfer status
            response = await sendCommand(command);

            // Check if the response is valid (no errors or failure)
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error") && !response.toLowerCase().includes("done")) {
                // Extract the transfer process ID from the response
                const regex = /"@id":\s*"([a-f0-9\-]{36})"/;
                const match = response.match(regex);
                if (match && match[1]) {
                    transferProcessId = match[1]; // Store the transfer process ID
                }
                break; // Exit the loop once the transfer process ID is retrieved
            } else {
                // If the response is invalid, wait 1 second and try again
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        } catch (error) {
            writeToTerminal("Error at the start of the transfer: " + error);
            throw error; // Throw the error to be handled by the calling function (e.g., connectToProvider)
        }
    }
}


/**
 * Function to continuously check the transfer status until it is successfully started.
 * The function will check the status of the transfer process using an HTTP request to the server.
 * It will break the loop once the transfer is successfully started.
 * 
 * @param {object} button - The button element that triggered the transfer status check.
 * @returns {Promise} - Resolves when the transfer is successfully started or an error is thrown.
 */
async function checkTransferStatus(button) {
    // Delay the start of the status check by 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));

    writeToTerminal("Checking transfer status...");

    // Infinite loop to check the transfer status repeatedly
    while (true) {
        try {
            let command = null; // Holds the shell command to be executed

            // Check if the command should be executed locally or remotely
            if (isLocalHost(button)) {
                // Local command to check transfer status via curl
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl -s 'http://localhost:29193/management/v3/transferprocesses/${transferProcessId}'"`;
            } else {
                // Remote command to check transfer status via SSH and curl
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i ${containerIDProvider} /bin/sh -c 'curl -s 'http://localhost:29193/management/v3/transferprocesses/${transferProcessId}''\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
            }

            // Send the command and wait for the response
            const response = await sendCommand(command);

            // Check if the response is valid (does not contain errors)
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")) {
                // Extract the transfer state from the response
                const regex = /"state":\s*"([A-Z]+)"/;
                const match = response.match(regex);

                if (match && match[1]) {
                    const transferState = match[1]; // The transfer status extracted from the response

                    // If the transfer status is "STARTED", break the loop and indicate success
                    if (transferState === "STARTED") {
                        writeToTerminal("Transfer started successfully!");
                        break; // Exit the loop as the transfer has started successfully
                    }
                }
            }

            // If the transfer status is not "STARTED", wait for 1 second and try again
            await new Promise((resolve) => setTimeout(resolve, 1000));

            break;
        } catch (error) {
            // If an error occurs, log it and throw the error to be handled by the caller
            writeToTerminal("Error checking transfer status: " + error);
            throw error; // Rethrow the error to be handled by the calling function
        }
    }
}

/**
 * Function to get the authorization key from the transfer process.
 * It sends a request to retrieve the data address for the given transfer process ID and extracts the authorization key from the response.
 * 
 * @param {object} button - The button element that triggered the authorization key retrieval.
 * @returns {Promise} - Resolves when the authorization key is retrieved, or throws an error if it fails.
 */
async function getAuthorizationKey(button) {
    // Delay the start of the process by 2 seconds to allow for any preliminary operations to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    writeToTerminal("Getting the AuthorizationKey...");

    // Loop to attempt getting the authorization key
    while (true) {
        try {
            let command = null;

            // Check if the process should be executed locally or remotely
            if (isLocalHost(button)) {
                // Local command to retrieve the authorization key using curl
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl -s 'http://localhost:29193/management/v3/edrs/${transferProcessId}/dataaddress' | jq"`;
            } else {
                // Remote command using SSH to retrieve the authorization key
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i ${containerIDProvider} /bin/sh -c 'curl -s 'http://localhost:29193/management/v3/edrs/${transferProcessId}/dataaddress' | jq'\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
                // writeToTerminal("Hier dann Befehl um auf anderem Geraet auszufuehren");
            }

            // Execute the command and wait for the response
            const response = await sendCommand(command);
            // writeToTerminal(response);

            // Check if the response is valid (does not contain errors)
            if (response && response.trim() !== "" && !response.toLowerCase().includes("fehler") && !response.toLowerCase().includes("failed") && !response.toLowerCase().includes("error")) {
                
                // Extract the authorization key from the response using regex
                const regex = /"authorization":\s*"([A-Za-z0-9._-]+)"/;
                const match = response.match(regex);

                if (match && match[1]) {
                    authorizationKey = match[1];  // Store the authorization key
                    writeToTerminal("AuthorizationKey received");
                }
            }

            // Wait for 1 second before retrying if necessary
            await new Promise((resolve) => setTimeout(resolve, 1000)); 
            break;  // Exit the loop once the authorization key is successfully retrieved

        } catch (error) {
            // Log and throw the error if an issue occurs while retrieving the authorization key
            writeToTerminal("Error when receiving the AuthorizationKey: " + error);
            throw error;  // Rethrow the error to be handled by the caller
        }
    }
}


/**
 * Function to get the asset data from the server and store it in session storage.
 * 
 * @param {object} button - The button element that triggered the data retrieval.
 * @param {string} assetId - The unique ID of the asset whose data is to be retrieved.
 * @param {number} assetNumber - The number representing the asset (used for dynamic key generation in sessionStorage).
 * @returns {Promise} - Resolves when the asset data is retrieved and stored, or throws an error if it fails.
 */
async function getData(button, assetId, assetNumber) {
    // Delay the start of the process by 2 seconds to allow for any preliminary operations to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    writeToTerminal("Getting the data...");

    // Loop to attempt retrieving the asset data
    while (true) {
        try {
            let command = null;  

            // Check if the process should be executed locally or remotely
            if (isLocalHost(button)) {
                // Local command to retrieve asset data using curl
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl -s -X GET 'http://localhost:19291/public' -H 'Authorization: ${authorizationKey}'"`;
            } else {
                // Remote command using SSH to retrieve asset data
                command = `expect -c "spawn ssh root@${actorIpAdress[button.name]} \\"docker exec -i ${containerIDProvider} /bin/sh -c 'curl -s -X GET 'http://localhost:19291/public' -H 'Authorization: ${authorizationKey}''\\\"; expect \\"password:\\"; send \\"${actorSshPassword[button.name]}\\r\\"; interact"`;
            }

            // Execute the command and wait for the response
            let response = await sendCommand(command);

            // Dynamically create sessionStorage keys based on the asset number
            const assetKey = `asset${assetNumber}`;  // Example: "asset2"
            const jsonKey = `jsonAsset${assetNumber}`;  // Example: "jsonAsset2"

            // Store the asset ID and the retrieved data (JSON response) in sessionStorage
            sessionStorage.setItem(assetKey, assetId);
            sessionStorage.setItem(jsonKey, response);

            writeToTerminal("Data received and stored");

            // Exit the loop once the data is successfully retrieved and stored
            break;

        } catch (error) {
            // Log and throw the error if an issue occurs while retrieving the asset data
            writeToTerminal("Error when receiving the data: " + error);
            throw error;  // Rethrow the error to be handled by the caller
        }
    }
}


/**
 * Extracts the container ID from a response.
 * 
 * @param {string} response - The response text that may contain the container ID.
 * @returns {string|null} - Returns the container ID if valid, otherwise null.
 */
function extractContainerId(response) {
    // If the response is empty or null, return null
    if (!response) return null; // If no response is provided, return null

    // Split the response into lines
    const lines = response.trim().split("\n");

    // Get the last line of the response, which should contain the container ID
    const lastLine = lines[lines.length - 1].trim();

    // Check if the last line is a valid container ID (at least 12 characters, hexadecimal format)
    if (/^[a-f0-9]{12,}$/.test(lastLine)) {
        return lastLine;  // Return the container ID if valid
    }

    // If no valid container ID is found, return null
    return null; // Return null if no valid ID is found
}



/**
 * Retrieves the container ID based on the IP address and the provided button's context (whether local or remote).
 * It checks the running Docker containers for two possible images (`mattis96/edc:edge` and `mattis96/edc:pfc`).
 * 
 * @param {string} ipAdress - The IP address of the remote server if not working locally.
 * @param {Object} button - The button object, which helps in identifying if the operation is local or remote.
 */
async function getContainerId(ipAdress, button) {
    let command = null;

    if (isLocalHost(button)) {
        // If running locally, first attempt to get the container ID for the first image (edge)
        command = `docker ps -q --filter "ancestor=mattis96/edc:edge"`;
        let containerId = (await sendCommand(command)).trim();
        
        // If no container ID found for the first image, try the second image (pfc)
        if (!containerId) {
            command = `docker ps -q --filter "ancestor=mattis96/edc:pfc"`;
            containerId = (await sendCommand(command)).trim();
        }
        
        // Extract the container ID from the response
        containerId = extractContainerId(containerId);
        console.log("ContainerID: " + containerId);  // Log to console for debugging
        containerIDLocalHost = containerId; // Store the container ID for local execution
    } else {
        // If working remotely, ask for SSH password and wait a moment
        askForSshPassword(button);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds to ensure password is provided

        // Try the first image (edge) via SSH
        command = `expect -c 'spawn ssh root@${ipAdress} "docker ps -q --filter \\"ancestor=mattis96/edc:edge\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;
        
        let containerId = await sendCommand(command);

        // If no container ID found for the first image, try the second image (pfc)
        if (!containerId) {
            command = `expect -c 'spawn ssh root@${ipAdress} "docker ps -q --filter \\"ancestor=mattis96/edc:pfc\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;
            
            containerId = (await sendCommand(command)).trim();
        }

        // Extract the container ID from the response
        containerId = extractContainerId(containerId);
        console.log("ContainerID: " + containerId);  // Log to console for debugging
        containerIDProvider = containerId;  // Store the container ID for remote execution
    }
}



/**
 * Starts the provider by executing a command inside the specified container.
 * Depending on whether the execution is local or remote, it adapts the command accordingly.
 * 
 * @param {Object} button - The button object that helps to determine whether the operation is local or remote.
 */
async function startProvider(button) {
    writeToTerminal("Provider is started...");

    try {
        // Retrieve the container ID based on the IP address and button context (local or remote)
        await getContainerId(actorIpAdress[button.name], button);

        let command = null;

        // If running locally, execute the command inside the local container
        if (isLocalHost(button)) {
            // Command to run the provider in the local container
            command = `docker exec -i ${containerIDLocalHost} /bin/sh -c 'java -Dedc.keystore=transfer/transfer-00-prerequisites/resources/certs/cert.pfx -Dedc.keystore.password=123456 -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/provider-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar'`;
        } else {
            // If working remotely, wait a moment and then execute the command via SSH
            await new Promise((resolve) => setTimeout(resolve, 2000));  // Wait for 2 seconds to allow SSH session to stabilize

            // Command to run the provider on the remote container
            command = `expect -c 'spawn ssh root@${actorIpAdress[button.name]} "docker exec -i ${containerIDProvider} /bin/sh -c \\"java -Dedc.keystore=transfer/transfer-00-prerequisites/resources/certs/cert.pfx -Dedc.keystore.password=123456 -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/provider-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;
        }

        // Send the command to the local or remote system to start the provider
        sendCommand(command);
    } catch (error) {
        // Log any errors that occur during the process of starting the provider
        writeToTerminal("Error when starting the provider: " + error);
        throw error; // Rethrow the error so the calling function can handle it
    }
}


/**
 * Creates assets by sending JSON files containing asset data to the provider. 
 * It loops through predefined JSON files, sending each one to the provider and checking for a valid response.
 * If the response is valid, it proceeds to the next asset creation. 
 * The function retries if no valid response is received.
 *
 * @param {Object} button - The button object that helps determine whether the operation is local or remote.
 */
async function createAssets(button) {
    writeToTerminal("Start asset creation...");

    // List of JSON files to be used for creating assets
    const jsonFiles = ["create-asset-temperature.json", "create-asset-resistanceValue.json", "create-asset-IO.json"];
    writeToTerminal("create assets...");
    // Loop through each JSON file
    for (const jsonFile of jsonFiles) {
        while (true) {
            try {
                let command = null;

                // Check if the execution is local or remote
                if (isLocalHost(button)) {
                    // Command for local execution: sends the JSON data to the local provider's API
                    command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl --data-binary @transfer/transfer-01-negotiation/resources/${jsonFile} -H 'Content-Type: application/json' http://localhost:19193/management/v3/assets -s"`;
                } else {
                    // Command for remote execution: sends the JSON data to the provider's API over SSH
                    command = `expect -c 'spawn ssh root@${actorIpAdress[button.name]} "docker exec -i ${containerIDProvider} /bin/sh -c \\\"curl -d @transfer/transfer-01-negotiation/resources/${jsonFile} -H \\\\\\\"content-type: application/json\\\\\\\" http://localhost:19193/management/v3/assets -s\\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;
                }

                // Send the command and get the response
                const response = await sendCommand(command);

                // Check if the response is valid (not empty, does not contain error messages, and contains "id")
                if (response && response.trim() !== "" && 
                    !response.toLowerCase().includes("fehler") && 
                    !response.toLowerCase().includes("failed") && 
                    !response.toLowerCase().includes("error") && 
                    response.toLowerCase().includes("id")) {
                    break; // Successful response, move on to the next JSON file
                } else {
                    // If no valid response, wait for 1 second and try again
                    // writeToTerminal(`Keine gültige Antwort für ${jsonFile}, erneut versuchen...`);
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay before retrying
                }
            } catch (error) {
                writeToTerminal(`Error when creating the assets for ${jsonFile}: ` + error);
                throw error; // Rethrow the error so the calling function can handle it
            }
        }
    }

    // Log when all assets have been successfully created
    writeToTerminal("All assets have been successfully created.");
}



/**
 * Creates policies by sending a JSON file containing policy data to the provider.
 * The function attempts to send the policy data and waits for a valid response.
 * If the response is invalid, it retries after a 1-second delay.
 * 
 * @param {Object} button - The button object that helps determine whether the operation is local or remote.
 */
async function createPolicies(button) {
    writeToTerminal("Start policy creation...");

    // Infinite loop for retrying the policy creation in case of failure
    while (true) {
        try {
            let command = null;

            // Check if the execution is local or remote
            if (isLocalHost(button)) {
                // Command for local execution: sends the policy data to the local provider's API
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl --data-binary @transfer/transfer-01-negotiation/resources/create-policy.json -H 'content-type: application/json' http://localhost:19193/management/v3/policydefinitions -s"`;
            } else {
                // Command for remote execution: sends the policy data to the provider's API over SSH
                command = `expect -c 'spawn ssh root@${actorIpAdress[button.name]} "docker exec -i ${containerIDProvider} /bin/sh -c \\\"curl -d @transfer/transfer-01-negotiation/resources/create-policy.json -H \\\\\\\"content-type: application/json\\\\\\\" http://localhost:19193/management/v3/policydefinitions -s\\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;
            }

            // Send the command and get the response
            const response = await sendCommand(command);

            // Check if the response is valid (not empty, does not contain error messages)
            if (response && response.trim() !== "" &&
                !response.toLowerCase().includes("fehler") &&
                !response.toLowerCase().includes("failed") &&
                !response.toLowerCase().includes("error")) {
                // If response is valid, break the loop
                break;
            } else {
                // If invalid response, wait for 1 second and retry
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay before retrying
            }
        } catch (error) {
            // If an error occurs, log it and rethrow the error for higher-level handling
            writeToTerminal("Error when creating the policies: " + error);
            throw error; // Rethrow the error for handling by the calling function
        }
    }
    writeToTerminal("All policies have been successfully created.");
}


/**
 * Creates a contract definition by sending a JSON file to the provider's API.
 * The function attempts to send the contract definition and waits for a valid response.
 * If the response is invalid, it retries after a 1-second delay.
 * 
 * @param {Object} button - The button object that helps determine whether the operation is local or remote.
 */
async function createContractDefinition(button) {
    writeToTerminal("Start contract creation...");

    // Infinite loop for retrying the contract creation in case of failure
    while (true) {
        try {
            let command = null;

            // Check if the execution is local or remote
            if (isLocalHost(button)) {
                // Command for local execution: sends the contract definition to the local provider's API
                command = `docker exec -i ${containerIDLocalHost} /bin/bash -c "curl -d @transfer/transfer-01-negotiation/resources/create-contract-definition.json -H 'content-type: application/json' http://localhost:19193/management/v3/contractdefinitions -s"`;
            } else {
                // Command for remote execution: sends the contract definition to the provider's API over SSH
                command = `expect -c 'spawn ssh root@${actorIpAdress[button.name]} "docker exec -i ${containerIDProvider} /bin/sh -c \\\"curl -d @transfer/transfer-01-negotiation/resources/create-contract-definition.json -H \\\\\\\"content-type: application/json\\\\\\\" http://localhost:19193/management/v3/contractdefinitions -s\\\""; expect "password:"; send "${actorSshPassword[button.name]}\\r"; interact'`;
            }

            // Send the command and get the response
            const response = await sendCommand(command);

            // Check if the response is valid (not empty, does not contain error messages)
            if (response && response.trim() !== "" &&
                !response.toLowerCase().includes("fehler") &&
                !response.toLowerCase().includes("failed") &&
                !response.toLowerCase().includes("error")) {
                // If response is valid, break the loop
                break;
            } else {
                // If invalid response, wait for 1 second and retry
                await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay before retrying
            }
        } catch (error) {
            // If an error occurs, log it and rethrow the error for higher-level handling
            writeToTerminal("Error when creating the contract definition: " + error);
            throw error; // Rethrow the error for handling by the calling function
        }
    }
    writeToTerminal("All contracts have been successfully created.");
}


/**
 * Disconnects the device (either provider or consumer) and removes associated session data.
 * It also sends a command to stop the connector process (if needed).
 * 
 * @param {Object} button - The button object that indicates which device is being disconnected.
 */
function disconnectFromDevice(button) {
    // Clear the session storage associated with the button (device)
    sessionStorage.setItem(button.name, "");
    
    // Log the disconnection message to the terminal
    writeToTerminal(button.name + " has been stopped");

    // Initialize the command variable
    let command = null;

    // Check if the device is running locally or remotely
    if (isLocalHost(button)) {
        // For a local device, kill the connector process by using pkill to stop the 'connector.jar' process
        command = `docker exec -i ${containerIDLocalHost} /bin/sh -c \"pkill -f connector.jar\"`; 
    } else {
        // For remote device (provider or consumer), no specific command is given in the current code
    }

    // Execute the command to stop the connector (or other disconnection logic)
    sendCommand(command);
}


/**
 * Handles the button click events and triggers different actions based on the button's name or ID.
 * 
 * @param {Object} button - The button object that was clicked.
 */
function handleButtonClick(button) {
    // Declare a variable to store the address from the input field
    let address;

    // Check if the button's name contains "Consumer" or "Provider"
    switch(true) {
        // If the button's name includes "Consumer" or "Provider", perform a connection toggle
        case button.name.includes(textConsumer) || button.name.includes(textProvider):
            // Get the input field associated with the button (for address input)
            input = document.getElementById(`${button.name}-address`);
            
            // Retrieve the value entered in the address input field
            address = input.value;
            
            // Call toggleConnection function with the address, input, and button
            toggleConnection(address, input, button);
            break;

        // If the button's ID includes "reset", trigger the reset function
        case button.id.includes("reset"):
            resetButtonClick();
            break;
    }
}


/**
 * Adds a new consumer group to the container, up to a maximum of 3 consumers.
 */
function addConsumer() {
    // Get the container element where the consumer groups will be added
    let container = document.getElementById("consumer-container");
    
    // Get all the existing consumer group divs within the container
    let consumers = container.getElementsByClassName("consumer-group");
    
    // Determine the next consumer number by counting the existing consumer groups and adding 1
    let count = consumers.length + 1;

    // Check if the current count is 3 or less (maximum of 3 consumers)
    if (count <= 3) {
        // Create a new div element to represent the new consumer group
        let newConsumer = document.createElement("div");
        
        // Add the "consumer-group" class to the new div
        newConsumer.classList.add("consumer-group");
        
        // Set a unique ID for the new consumer group (e.g., "consumer1", "consumer2", etc.)
        newConsumer.setAttribute("id", `consumer${count}`);
        
        // Set the inner HTML content of the new div, including an input field for the address
        // and a button to connect the consumer
        newConsumer.innerHTML = `<input type="text" placeholder="consumer${count} address" id="consumer${count}-address"> 
                                 <button id="btn-consumer${count}" name="consumer${count}">Connect</button>`;
        
        // Append the new consumer group div to the container
        container.appendChild(newConsumer);
        
        // Call the function to add event listeners to the new buttons
        addEventListenerToButtons();
        
        // Store the current number of consumers in the session storage
        sessionStorage.setItem('countConsumer', count);
    }
}


/**
 * Removes the last consumer group from the container, as long as there is more than one consumer.
 */
function removeConsumer() {
    // Get the container element where the consumer groups are located
    let container = document.getElementById("consumer-container");

    // Select all the elements with the class "consumer-group" (these represent the consumer groups)
    let consumers = container.querySelectorAll(".consumer-group");

    // Get the last consumer group (the most recently added)
    let lastConsumer = consumers[consumers.length - 1];

    // Get the input field within the last consumer group to check if it's disabled
    let inputField  = lastConsumer.querySelector("input");

    // Check if there are more than one consumer group and if the input field of the last consumer is not disabled
    if (consumers.length > 1 && !inputField.disabled) {
        // Remove the last consumer group from the container
        container.removeChild(lastConsumer);

        // Update the session storage with the new count of consumers (one less consumer)
        sessionStorage.setItem('countConsumer', consumers.length - 1);
    }
}


/**
 * Clears all dynamically added consumer groups, except for 'consumer1' and its associated address input.
 */
function clearDynamicContent() {
    // Get all elements with the class 'consumer-group' (these represent the consumer groups)
    var consumerGroupElements = document.getElementsByClassName('consumer-group');

    // Loop through the consumer group elements in reverse order (starting from the last one)
    for (var i = consumerGroupElements.length - 1; i >= 0; i--) {
        var element = consumerGroupElements[i];

        // Check if the element is not 'consumer1' or 'consumer1-address' (so they are not removed)
        if (element.id.startsWith('consumer') && element.id !== 'consumer1' && element.id !== 'consumer1-address') {
            // Remove the element from the DOM (parent node removes the child element)
            element.parentNode.removeChild(element);
        }
    }
}





/**
 * Resets the page state, clears session storage, and navigates to a new page.
 */
function resetButtonClick() {
    
    // Clear all dynamically created consumer groups (except for 'consumer1')
    clearDynamicContent();

    // Clear all session storage data
    sessionStorage.clear();
    console.log("SessionStorage wurde gelöscht.");

    // Reset all form inputs, textareas, and selects, and enable any disabled inputs
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.value = '';          // Clears the content of the input field
        input.disabled = false;    // Re-enables the input field if it was disabled
    });

    // Clear the terminal container (e.g., console output)
    term.clear();

    // Reset all inline styles applied to elements
    document.querySelectorAll('*').forEach(el => el.style = ''); 

    // Delay the page redirection to ensure that storage and styles are cleared
    setTimeout(function() {
        window.location.href = "configuration.html"; // Redirects to the "configuration.html" page
    }, 100);  // Delay of 100 milliseconds to ensure memory is cleared before navigating
}








// Wait for the host IP address to be fetched before continuing with the execution
await getHostIp();

// Load configuration settings or preferences (presumably from some external source or configuration file)
loadConfiguration();

// Log the current state of the actor IP address object (possibly for debugging purposes)
console.log(actorIpAdress);

// Expose the addConsumer function to the global window object, making it accessible elsewhere in the code
window.addConsumer = addConsumer;

// Expose the removeConsumer function to the global window object, making it accessible elsewhere in the code
window.removeConsumer = removeConsumer;

// Attach event listeners to buttons, typically to handle user interactions with buttons on the page
addEventListenerToButtons();
