// document.addEventListener("DOMContentLoaded", function () {
//     const checkboxes = document.querySelectorAll(".select-data input[type='checkbox']");
//     const consumerRight = document.createElement("div"); // Neuer Bereich für die Container
//     consumerRight.classList.add("consumer-right");
//     document.querySelector(".consumer").appendChild(consumerRight); // In den Hauptcontainer einfügen

//     function updateDisplay() {
//         // Alle aktivierten Checkboxen abrufen
//         const selectedData = Array.from(checkboxes)
//             .filter(checkbox => checkbox.checked)
//             .map(checkbox => checkbox.nextSibling.textContent.trim());

//         // Container-Bereich leeren
//         consumerRight.innerHTML = "";

//         if (selectedData.length === 0) return;

//         // Höhe jedes Containers festlegen (1/3 der Bildschirmhöhe)
//         const containerHeight = `calc(100vh / 3 - 10px)`;

//         // Neue Container erstellen
//         selectedData.forEach(data => {
//             const div = document.createElement("div");
//             div.classList.add("container"); // Gleiche Klasse wie die bestehenden Container
//             div.textContent = data;
//             div.style.height = containerHeight;
//             consumerRight.appendChild(div);
//         });
//     }

//     checkboxes.forEach(checkbox => {
//         checkbox.addEventListener("change", updateDisplay);
//     });
// });

// Alle Checkboxen abrufen
// const checkboxes = document.querySelectorAll(".select-data input[type='checkbox']");

// // Event-Listener für alle Checkboxen hinzufügen
// checkboxes.forEach(checkbox => {
//     checkbox.addEventListener("change", function () {
//         handleCheckboxChange(this);
//     });
// });

// // Funktion zur Verarbeitung der Änderungen
// function handleCheckboxChange(checkbox) {
//     const dataId = checkbox.id.replace("consumer1-", ""); // "data1", "data2", "data3"

//     if (checkbox.checked) {
//         console.log(`${dataId} wurde aktiviert`);
//         addData(dataId);
//     } else {
//         console.log(`${dataId} wurde deaktiviert`);
//         removeData(dataId);
//     }
// }

// // Daten-Container hinzufügen
// function addData(dataId) {
//     let container = document.getElementById("show-data");

//     if (!document.getElementById("vizualisation-" + dataId)) {
//         let newData = document.createElement("div");
//         newData.classList.add("container");
//         newData.textContent = dataId; // Korrekte Bezeichnung setzen
//         newData.id = "vizualisation-" + dataId;
//         container.appendChild(newData);
//     } 
// }

// // Daten-Container entfernen
// function removeData(dataId) {
//     const element = document.getElementById("vizualisation-" + dataId);
//     if (element) {
//         element.remove();
//     }
// }

// Alle Checkboxen abrufen

// Standardmäßig Consumer 1 laden

const actorIpAdress = {
    consumer1: sessionStorage.getItem("consumer1") || "",
    consumer2: sessionStorage.getItem("consumer2") || "",
    consumer3: sessionStorage.getItem("consumer3") || "",
    provider: sessionStorage.getItem("provider") || "" // Falls vorhanden, aus sessionStorage laden
};
let consumer;
document.addEventListener("DOMContentLoaded", () => loadConsumer(1));

const containerRight = document.getElementById("show-data");
const tabs = document.querySelectorAll(".navbar-consumer a");

// Funktion zum Event Listener erneut hinzufügen nach Laden der Checkboxen
function addCheckboxListeners() {
    const checkboxes = document.querySelectorAll(".select-data input[type='checkbox']");
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function () {
            handleCheckboxChange(this);
        });
    });
}

function handleCheckboxChange(checkbox) {
    const checkboxes = document.querySelectorAll(".select-data input[type='checkbox']");
    const selectedCheckboxes = Array.from(checkboxes).filter(cb => cb.checked);

    if (selectedCheckboxes.length > 2) {
        checkbox.checked = false;
        alert("For reasons of clarity, you can only activate 2 checkboxes");
        return;
    }
    updateContainers(selectedCheckboxes);
}

function updateContainers(selectedCheckboxes) {
    containerRight.innerHTML = "";

    if (selectedCheckboxes.length === 0) return;

    const containerHeight = `calc(73vh / ${selectedCheckboxes.length} - 10px)`;

    selectedCheckboxes.forEach(checkbox => {

        let newData = document.createElement("div");
        newData.classList.add("container","data");
        newData.textContent = checkbox.id.split("-")[1];
        //newData.id = "data-" + dataId.split('-')[1];  // Nimmt den Teil nach dem Bindestrich
        newData.id = "data-" + checkbox.id;
        newData.style.height = containerHeight;
        newData.style.width = "94%";
        containerRight.appendChild(newData);
        createChart(generatePath(checkbox.id), newData.id);
    });
}

function generatePath(text) {
    const variable = text.split('-').pop(); // Nimmt alles nach dem "-"
    return `../daten/${variable}_data.json`;
}

function createChart(jsonFilePath, containerID) {
    const container = document.getElementById(containerID);
    
    let newChart = document.createElement("canvas");
    newChart.id = "chart-" + containerID.split('-')[2]; 
    newChart.classList.add("chart");
    
    // Wichtig: Canvas soll gesamte Breite und Höhe nutzen
    newChart.style.width = "100%";
    newChart.style.height = "100%";

    container.appendChild(newChart);

    fetch(jsonFilePath) // JSON-Datei laden
        .then(response => response.json())
        .then(jsonData => {
            const labels = jsonData.map(entry => {
                let date = new Date(entry.timestamp);
                return date.getHours() + ':' + String(date.getMinutes()).padStart(2, '0');
            });
            const values = jsonData.map(entry => entry.value);

            const ctx = newChart.getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Value',
                        data: values,
                        borderColor: '#ff6384',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        pointBorderColor: '#ff6384',
                        pointBackgroundColor: '#ff6384',
                        pointRadius: 2,
                        pointHoverRadius: 7,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.2
                    }]
                },
                options: {
                    responsive: true,  // Automatische Anpassung aktivieren
                    maintainAspectRatio: false, // Erlaubt freie Größenanpassung
                    animation: false, // Animation deaktivieren
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Time'
                            },
                            grid: {
                                color: 'rgba(200, 200, 200, 0.3)'
                            }
                        },
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Value'
                            },
                            grid: {
                                color: 'rgba(200, 200, 200, 0.3)'
                            }
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Fehler beim Laden der JSON-Datei:', error));
}

function clearDynamicContent() {
    // Element mit der ID 'show-data' selektieren
    var element = document.getElementById('show-data');
    
    // Den Inhalt des Elements löschen
    element.innerHTML = '';
}


function loadConsumer(consumerNumber) {
    if(consumer != consumerNumber){
        const dataSelection = document.getElementById("data-selection");
        consumer = consumerNumber;
        const dataLabels = {
            1: { temperature: "consumer1-temperature", voltage: "consumer1-voltage", current: "consumer1-current" },
            2: { temperature: "consumer2-temperature", voltage: "consumer2-voltage", current: "consumer2-current" },
            3: { temperature: "consumer3-temperature", voltage: "consumer3-voltage", current: "consumer3-current" }
        };

        // Aktualisiert die Checkboxen basierend auf der Auswahl
        dataSelection.innerHTML = `
            <div class="select-data">
                <label><input type="checkbox" id="${dataLabels[consumerNumber].temperature}"> Temperature</label>
                <label><input type="checkbox" id="${dataLabels[consumerNumber].voltage}"> Voltage</label>
                <label><input type="checkbox" id="${dataLabels[consumerNumber].current}"> Current</label>
            </div>
        `;
        const consumerName = "consumer"+consumerNumber;
        if(actorIpAdress[consumerName].length > 0){
            document.getElementById("show-consumer-address").textContent = "";
            document.getElementById("show-consumer-address").textContent = "IP-Address: " + actorIpAdress[consumerName];
        }else{
            document.getElementById("show-consumer-address").textContent = "";
            document.getElementById("show-consumer-address").textContent = "No Consumer " + consumerNumber + " connected!";
        }
           

        // Event-Listener nachträglich für neue Checkboxen setzen
        addCheckboxListeners();

        // Hintergrundfarben der Tabs aktualisieren
        document.getElementById("tab-consumer1").style.backgroundColor = "";
        document.getElementById("tab-consumer2").style.backgroundColor = "";
        document.getElementById("tab-consumer3").style.backgroundColor = "";
        document.getElementById(`tab-consumer${consumerNumber}`).style.backgroundColor = "#EFF0F1";

        clearDynamicContent();
    }

    
}



