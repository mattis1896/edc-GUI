
// Load Consumer 1 by default
document.addEventListener("DOMContentLoaded", () => loadConsumer(1));

// Stores the IP addresses of actors, loaded from sessionStorage
const actorIpAdress = {
    consumer1: sessionStorage.getItem("consumer1") || "",
    consumer2: sessionStorage.getItem("consumer2") || "",
    consumer3: sessionStorage.getItem("consumer3") || "",
    provider: sessionStorage.getItem("provider") || "" 
};

// Stores asset IDs associated with the transferred data
const assetIds = {
    asset1: sessionStorage.getItem("asset1") || "",
    asset2: sessionStorage.getItem("asset2") || "",
    asset3: sessionStorage.getItem("asset3") || ""
};

// Stores JSON asset data from sessionStorage
const jsonAssetData = {
    jsonAsset1: sessionStorage.getItem("jsonAsset1") || "",
    jsonAsset2: sessionStorage.getItem("jsonAsset2") || "",
    jsonAsset3: sessionStorage.getItem("jsonAsset3") || ""
};

// Consumer variables
let consumer;
let countConsumer = parseInt(sessionStorage.getItem('countConsumer'), 10);

// Logging the consumer count for debugging
console.log(countConsumer);

// DOM elements for UI interactions
const containerRight = document.getElementById("show-data");
const tabs = document.querySelectorAll(".navbar-consumer a");


// Function to reattach event listeners to checkboxes after they are loaded
function addCheckboxListeners() {
    // Select all checkboxes inside elements with the class "select-data"
    const checkboxes = document.querySelectorAll(".select-data input[type='checkbox']");
    
    // Iterate over each checkbox
    checkboxes.forEach(checkbox => {
        // Add an event listener to detect when the checkbox state changes
        checkbox.addEventListener("change", function () {
            // Call the function to handle the change event
            handleCheckboxChange(this);
        });
    });
}


// Function to handle the change event of a checkbox
function handleCheckboxChange(checkbox) {
    // Select all checkboxes inside elements with the class "select-data"
    const checkboxes = document.querySelectorAll(".select-data input[type='checkbox']");
    
    // Create an array of currently checked checkboxes
    const selectedCheckboxes = Array.from(checkboxes).filter(cb => cb.checked);

    // If more than 2 checkboxes are selected, prevent the additional selection
    if (selectedCheckboxes.length > 2) {
        checkbox.checked = false; // Uncheck the last clicked checkbox
        alert("For reasons of clarity, you can only activate 2 checkboxes");
        return; // Exit the function early
    }

    // Update the containers based on the selected checkboxes
    updateContainers(selectedCheckboxes);
}


// Function to dynamically create the navigation bar for consumers
function createNavbar() {
    // Select the navbar element with the class 'navbar-consumer'
    const navbar = document.querySelector('.navbar-consumer');
    
    // Clear the current content of the navbar
    navbar.innerHTML = '';
    
    // Create links for each consumer ID
    for (let i = 1; i <= countConsumer; i++) {
        // Create an anchor element
        const aTag = document.createElement('a');
        aTag.href = '#'; // Set the href attribute
        aTag.id = `tab-consumer${i}`; // Assign a unique ID
        aTag.textContent = `Consumer ${i}`; // Set the link text
        
        // Add an onclick event handler to load the corresponding consumer data
        aTag.setAttribute('onclick', `loadConsumer(${i})`);
        
        // Append the link to the navbar
        navbar.appendChild(aTag);
    }

    // Optional: Add a span element to display the consumer address
    const span = document.createElement('span');
    span.id = 'show-consumer-address'; // Assign an ID to the span
    navbar.appendChild(span); // Append the span to the navbar
}


// Function to update the right container based on selected checkboxes
function updateContainers(selectedCheckboxes) {
    // Clear the current content of the right container
    containerRight.innerHTML = "";

    // If no checkboxes are selected, exit the function
    if (selectedCheckboxes.length === 0) return;

    // Calculate the height of each container dynamically based on the number of selected checkboxes
    const containerHeight = `calc(73vh / ${selectedCheckboxes.length} - 10px)`;

    // Iterate through each selected checkbox
    selectedCheckboxes.forEach((checkbox) => {
        // Create a new div element for the data container
        let newData = document.createElement("div");
        newData.classList.add("container", "data"); // Add necessary CSS classes
        newData.textContent = checkbox.id.split("-")[1]; // Extract and set the content from the checkbox ID
        newData.id = "data-" + checkbox.id; // Assign a unique ID
        newData.style.height = containerHeight; // Set the calculated height
        newData.style.width = "94%"; // Set a fixed width

        // Append the newly created container to the right container
        containerRight.appendChild(newData);

        // Extract the first number found in the checkbox ID (e.g., "checkbox-1" -> "1")
        const match = checkbox.id.match(/\d+/);
        const checkboxNumber = match ? match[0] : "1"; // Default to "1" if no number is found

        // Dynamically select the corresponding JSON object based on the extracted number
        console.log(jsonAssetData); // Debugging: Log the full JSON data object
        const jsonKey = "jsonAsset" + checkboxNumber; // Constructs keys like "jsonAsset1", "jsonAsset2", etc.
        console.log(jsonKey); // Debugging: Log the dynamically generated JSON key

        // Parse the corresponding JSON object or fallback to an empty object if the key is not found
        const jsonObject = JSON.parse(jsonAssetData[jsonKey] || "{}");

        // Construct the asset ID key dynamically
        const assetIdKey = "asset" + checkboxNumber;

        // Call the function to create a chart using the parsed JSON data
        createChart(jsonObject, newData.id, assetIds[assetIdKey]);
    });
}


// Function to generate a file path based on the given text
function generatePath(text) {
    // Extract the part of the string after the last hyphen ("-")
    const variable = text.split('-').pop(); 

    // Construct and return the file path using the extracted variable
    return `../daten/${variable}_data.json`;
}


// Function to create and render a chart based on the given data source
function createChart(dataSource, containerID, chartTitle) {
    
    // Select the container element by its ID
    const container = document.getElementById(containerID);
    
    // Create and set up the title for the chart
    let title = document.createElement("h7");
    title.innerText = chartTitle; // Set the chart title
    container.appendChild(title); // Append the title to the container

    // Create a new canvas element for the chart
    let newChart = document.createElement("canvas");
    newChart.id = "chart-" + containerID.split('-')[2]; // Generate a unique ID for the canvas
    newChart.classList.add("chart"); // Add the "chart" class to the canvas

    // Set the width and height of the canvas
    newChart.style.width = "100%";
    newChart.style.height = "100%";

    // Append the canvas to the container
    container.appendChild(newChart);

    // Check if the dataSource is a string (URL to the JSON file) or an object (direct JSON data)
    let dataPromise = typeof dataSource === "string"
        ? fetch(dataSource).then(response => response.json()) // If it's a URL: fetch and parse the JSON
        : Promise.resolve(dataSource); // If it's already an object: use it directly

    // Process the fetched or provided JSON data
    dataPromise
        .then(jsonData => {
            
            // Extract labels (hours and minutes) from the timestamp in the JSON data
            const labels = jsonData.map(entry => {
                let date = new Date(entry.timestamp);
                return date.getHours() + ':' + String(date.getMinutes()).padStart(2, '0');
            });

            // Extract the values from the JSON data
            const values = jsonData.map(entry => entry.value);

            // Get the context of the canvas for chart rendering
            const ctx = newChart.getContext('2d');

            // Create a new Chart.js line chart
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels, // Time labels on the x-axis
                    datasets: [{
                        label: 'Value',
                        data: values, // Data to plot on the y-axis
                        borderColor: '#ff6384', // Line color
                        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Fill color under the line
                        pointBorderColor: '#ff6384', // Color of the points' border
                        pointBackgroundColor: '#ff6384', // Color of the points' background
                        pointRadius: 2, // Size of the points
                        pointHoverRadius: 7, // Size of the points when hovered
                        borderWidth: 2, // Line thickness
                        fill: true, // Whether to fill the area under the line
                        tension: 0.2 // Smoothness of the line
                    }]
                },
                options: {
                    responsive: true, // Make the chart responsive to window resizing
                    maintainAspectRatio: false, // Allow the aspect ratio to be flexible
                    animation: false, // Disable animations for performance
                    plugins: {
                        legend: { display: false } // Hide the chart legend
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Time' }, // Set the x-axis label
                            grid: { color: 'rgba(200, 200, 200, 0.3)' } // Set grid line color for x-axis
                        },
                        y: {
                            beginAtZero: false, // Do not start y-axis at zero
                            title: { display: true, text: 'Value' }, // Set the y-axis label
                            grid: { color: 'rgba(200, 200, 200, 0.3)' } // Set grid line color for y-axis
                        }
                    }
                }
            });
        })
        // Catch and log any errors
        .catch(error => console.error('Error loading or processing the JSON data:', error)); 
}



// Function to clear dynamic content in the specified element
function clearDynamicContent() {
    
    // Select the element with the ID 'show-data'
    var element = document.getElementById('show-data');
    
    // Clear the content inside the selected element
    element.innerHTML = '';
}

// Function to load and display content for a specific consumer
function loadConsumer(consumerNumber) {
    
    // Rebuild the navbar when a new consumer is loaded
    createNavbar(); 

    // Check if the selected consumer is different from the current one
    if (consumer !== consumerNumber) {
        
        // Select the data selection element where checkboxes will be inserted
        const dataSelection = document.getElementById("data-selection");
        
        // Update the current consumer number
        consumer = consumerNumber;

        // Dynamically create labels based on the selected consumer number
        const dataLabels = {};
        for (let i = 1; i <= countConsumer; i++) {
            dataLabels[i] = {
                temperature: `consumer${i}-temperature`,
                IO: `consumer${i}-IO`,
                resistanceValue: `consumer${i}-resistanceValue`
            };
        }

        // Update the content of the data selection area with checkboxes for the consumer's assets
        dataSelection.innerHTML = `
            <div class="select-data">
                <label><input type="checkbox" id="1_${assetIds["asset1"]}"> ${assetIds["asset1"]}</label>
                <label><input type="checkbox" id="2_${assetIds["asset2"]}"> ${assetIds["asset2"]}</label>
                <label><input type="checkbox" id="3_${assetIds["asset3"]}"> ${assetIds["asset3"]}</label>
            </div>
        `;

        // Dynamically set the name for the selected consumer
        const consumerName = `consumer${consumerNumber}`;
        
        // Display the IP address for the selected consumer
        if (actorIpAdress[consumerName].length > 0) {
            document.getElementById("show-consumer-address").textContent = `IP-Address: ${actorIpAdress[consumerName]}`;
        } else {
            document.getElementById("show-consumer-address").textContent = `No Consumer ${consumerNumber} connected!`;
        }

        // Re-apply event listeners to newly created checkboxes
        addCheckboxListeners();

        // Reset the background color of all consumer tabs
        for (let i = 1; i <= countConsumer; i++) {
            document.getElementById(`tab-consumer${i}`).style.backgroundColor = "";
        }

        // Highlight the background color of the selected consumer's tab
        document.getElementById(`tab-consumer${consumerNumber}`).style.backgroundColor = "#EFF0F1";

        // Clear dynamic content before loading new data
        clearDynamicContent();
    }
}




