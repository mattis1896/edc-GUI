
// Create an object to store the IP addresses of different actors, loading from sessionStorage if available
const actorIpAdress = {
    consumer1: sessionStorage.getItem("consumer1") || "", 
    consumer2: sessionStorage.getItem("consumer2") || "", 
    consumer3: sessionStorage.getItem("consumer3") || "", 
    provider: sessionStorage.getItem("provider") || "" 
};

// Select all checkbox input elements within elements having the class "show-assets"
const checkboxes = document.querySelectorAll(".show-assets input[type='checkbox']");

// Wait for the DOM content to be fully loaded before running the function
document.addEventListener('DOMContentLoaded', () => {
    // Call the loadProvider function to check and load relevant data
    loadProvider();
});


// This function loads data from three JSON files into specific HTML elements with different units.
function fillAssetData() {
    // Load temperature data from the JSON file and insert it into the element with ID "asset-data1" with unit "°C"
    loadJsonData("../daten/temperature_data.json", "asset-data1", "°C");
    
    // Load resistance value data from the JSON file and insert it into the element with ID "asset-data2" with unit "Ω"
    loadJsonData("../daten/resistanceValue_data.json", "asset-data2", "Ω");
    
    // Load IO data from the JSON file and insert it into the element with ID "asset-data3" with no unit
    loadJsonData("../daten/IO_data.json", "asset-data3", "");
}


// This code attaches an event listener to each checkbox that triggers a function when the checkbox state changes.
checkboxes.forEach(checkbox => {
    // Add an event listener for the "change" event to each checkbox
    checkbox.addEventListener("change", function () {
        // Call the handleCheckboxChange function when the checkbox state changes
        handleCheckboxChange(this);
    });
});


// This function handles changes in the state of checkboxes and loads or clears data accordingly.
function handleCheckboxChange(checkbox) {
    // Switch based on the ID of the checkbox to determine which data to load or clear
    switch(checkbox.id) {
        case "provider-data1":
            // If the checkbox is checked, load temperature data into "asset-data1", otherwise clear it
            if(checkbox.checked) {
                loadJsonData("../daten/temperature_data.json", "asset-data1", "°C");
            } else {
                clearContainer("asset-data1");
            }
            break;
        case "provider-data3":
            // If the checkbox is checked, load IO data into "asset-data3", otherwise clear it
            if(checkbox.checked) {
                loadJsonData("../daten/IO_data.json", "asset-data3", "");
            } else {
                clearContainer("asset-data3");
            }
            break;
        case "provider-data2":
            // If the checkbox is checked, load resistance value data into "asset-data2", otherwise clear it
            if(checkbox.checked) {
                loadJsonData("../daten/resistanceValue_data.json", "asset-data2", "Ω");
            } else {
                clearContainer("asset-data2");
            }
            break;
    }
}


// This function asynchronously loads data from a JSON file, formats it, and updates a specified HTML container with the data.
async function loadJsonData(filePath, containerId, unit) {
    // Log the call of the function for debugging purposes
    console.log(`loadJsonData() wurde für ${filePath} aufgerufen!`);
    
    try {
        // Log the file path being loaded
        console.log(`Lade Datei: ${filePath}`);

        // Fetch the JSON data from the specified file path
        const response = await fetch(filePath);

        // Check if the response is OK (status 200-299), otherwise throw an error
        if (!response.ok) {
            throw new Error(`Fehler beim Laden der Datei: ${response.status} ${response.statusText}`);
        }

        // Parse the JSON data
        const data = await response.json();

        // Log the loaded data for debugging purposes
        console.log("Geladene Daten:", data);

        // Format the data into lines with timestamp and value, appending the unit
        const formattedLines = data.map(entry => 
            `Time: ${entry.timestamp}  Value: ${entry.value} ${unit}`
        );

        // Get the container element by its ID
        const container = document.getElementById(containerId);
        
        // Check if the container element exists
        if (!container) {
            console.error(`Container mit ID "${containerId}" nicht gefunden!`);
            return;
        }

        // Update the inner HTML of the container with the formatted data
        container.innerHTML = formattedLines.join('<br>');

        // Log that the container has been updated
        console.log(`Container "${containerId}" wurde aktualisiert!`);

    } catch (error) {
        // Log any errors that occur during the process
        console.error("Fehler beim Laden der Datei:", error);
    }
}



// This function clears the content of a specified container by its ID.
function clearContainer(containerId) {
    // Get the container element by its ID
    const container = document.getElementById(containerId);

    // Check if the container exists
    if (container) {
        // Clear the content inside the container
        container.innerHTML = ""; // Löscht nur den Inhalt des Containers
    }
}


// This function checks if the current page is "provider.html" and if so, calls the fillAssetData function.
function loadProvider() {
    // Check if the current page's URL contains "provider.html"
    if(window.location.pathname.includes("provider.html")) {
        // If true, call the fillAssetData function to load the data
        fillAssetData();
    }
}
