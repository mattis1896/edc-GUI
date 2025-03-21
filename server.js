// Import required modules
const http = require("http");
const express = require("express");
const WebSocket = require("ws");
const path = require("path");
const { spawn } = require("child_process");

// Create an instance of Express app
const app = express();

// HTTP server creation
const server = http.createServer(app);

// Create a WebSocket server that uses the HTTP server
const wss = new WebSocket.Server({ server });

// Middleware to serve static files from various directories
// The app.use() method is used to specify directories from which static assets like 
// HTML, CSS, JS, images, and data can be accessed by the client. 
// The express.static() function serves files directly from the specified directory.
app.use(express.static(path.join(__dirname, "html"))); 
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js"))); 
app.use("/pictures", express.static(path.join(__dirname, "pictures"))); 
app.use("/daten", express.static(path.join(__dirname, "daten"))); 


// WebSocket handling
// This sets up WebSocket communication between the server and client. 
// When a client connects, the server listens for messages and processes them.

wss.on("connection", (ws) => {
    console.log("A client has connected.");

    // When the server receives a message from the client
    ws.on("message", (message) => {
        const command = message.toString().trim(); // Convert buffer to string and remove extra whitespace
        console.log(`Command received: ${command}`);

        if (!command) {
            ws.send("Error: No command sent.");
            return;
        }

        // Execute the command using `spawn` from the child_process module
        const child = spawn(command, { shell: true });

        // Send the command's output in real-time
        child.stdout.on("data", (data) => {
            console.log("stdout:", data.toString());
            ws.send(data.toString()); // Send output to the client
        });

        // Send any error output to the client
        child.stderr.on("data", (data) => {
            console.error("stderr:", data.toString());
            ws.send("Error: " + data.toString()); // Send error message to the client
        });

        // Log when the process ends and send the exit code to the client
        child.on("close", (code) => {
            console.log(`Process finished with code ${code}`);
            ws.send(`Process finished with code ${code}`);
        });

        // Handle errors starting the process
        child.on("error", (error) => {
            console.error("Error starting the process:", error);
            ws.send("Error starting the process: " + error.message); // Send error message to the client
        });
    });

    // Log when the client closes the connection
    ws.on("close", () => console.log("Client has closed the connection."));
});


// Serve the "configuration.html" page at the root URL
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "html", "configuration.html"));
});

// Start the server on the specified port or default to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Return the host's IP address from environment variables as JSON
app.get("/api/host-ip", (req, res) => {
    res.json({ hostIp: process.env.HOST_IP });
});

// This API route is currently not being used.
// API route for contract negotiation that fetches, edits, and writes JSON data
app.get("/api/contractNegotiation", async (req, res) => {
    try {
        const value = await testReadJson("192.168.2.18", "wago");
        console.log(JSON.stringify(value, null, 2));
        const editedValue = insertPolicyId(value, "Test");
        writeJsonToFile("192.168.2.18", "wago", editedValue)
        res.json(JSON.parse(value)); // Try to parse the string as JSON.
        
    } catch (error) {
        res.status(500).json({ error: "Error retrieving data" });
    }
});

// This function is currently not being used.
// Reads a JSON file from a remote server using SSH and returns the content.
async function testReadJson(ipAdresse, passwort) {
    return new Promise((resolve, reject) => {
        const remotePath = 'transfer/transfer-01-negotiation/resources/negotiate-contract.json';
        exec(`expect -c 'spawn ssh root@${ipAdresse} "docker exec -i ccd6c7aff556 /bin/sh -c \\"cat ${remotePath}\\""; expect "password:"; send "${passwort}\\r"; interact'`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error reading the file: ${error}`);
                console.error(`stderr: ${stderr}`);
                reject(error); // Pass error to promise
                return;
            }
            console.log(stdout);
            const match = stdout.match(/\{[\s\S]*\}/);
            if (match) {
                stdout = match[0]; // Extract the JSON part
                console.log(stdout);
                stdout = JSON.parse(stdout);
                resolve(stdout); // Resolve with the result
            }
        });
    });
}

// This function is currently not being used.
// Inserts a policy ID into the contract negotiation file and returns the updated object.
function insertPolicyId(negotiateContractFile, policyId) {
    negotiateContractFile.policy["@id"] = policyId;
    console.log("New negotiation: " + JSON.stringify(negotiateContractFile, null, 2));
    return negotiateContractFile;
}

// This function is currently not being used.
// Writes JSON data to a file on a remote server using SSH.
async function writeJsonToFile(ipAdresse, passwort, jsonData) {
    return new Promise((resolve, reject) => {
        const remotePath = 'transfer/transfer-01-negotiation/resources/negotiate-contract.json';
        const jsonString = JSON.stringify(jsonData, null, 2); // Convert object to JSON string
        const escapedJsonString = jsonString.replace(/"/g, '\\"');
        exec(`expect -c 'spawn ssh root@${ipAdresse} "docker exec -i ccd6c7aff556 /bin/sh -c \\"echo \\"${escapedJsonString}\\" > ${remotePath}\\""; expect "password:"; send "${passwort}\\r"; interact'`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error writing the file: ${error}`);
                console.error(`stderr: ${stderr}`);
                reject(error);
                return;
            }
            resolve();
        });
    });
}



