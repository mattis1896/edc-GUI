
// Standardmäßig Consumer 1 laden

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

let consumer;
let countConsumer = parseInt(sessionStorage.getItem('countConsumer'), 10);
document.addEventListener("DOMContentLoaded", () => loadConsumer(1));


console.log(countConsumer);


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

function createNavbar() {
    const navbar = document.querySelector('.navbar-consumer');
    
    // Leeren des aktuellen Inhalts der Navbar
    navbar.innerHTML = '';
    
    // Erstellen der Links für jede Consumer-ID
    for (let i = 1; i <= countConsumer; i++) {
        const aTag = document.createElement('a');
        aTag.href = '#';
        aTag.id = `tab-consumer${i}`;
        aTag.textContent = `Consumer ${i}`;
        
        // Hinzufügen des OnClick-Handlers für jeden Consumer
        aTag.setAttribute('onclick', `loadConsumer(${i})`);
        
        // Füge den Link zur Navbar hinzu
        navbar.appendChild(aTag);
    }

    // Optional: Füge das span-Element für die Adresse hinzu
    const span = document.createElement('span');
    span.id = 'show-consumer-address';
    navbar.appendChild(span);
}

function updateContainers(selectedCheckboxes) {
    containerRight.innerHTML = "";

    if (selectedCheckboxes.length === 0) return;

    const containerHeight = `calc(73vh / ${selectedCheckboxes.length} - 10px)`;

    selectedCheckboxes.forEach((checkbox) => {
        let newData = document.createElement("div");
        newData.classList.add("container", "data");
        newData.textContent = checkbox.id.split("-")[1];
        newData.id = "data-" + checkbox.id;
        newData.style.height = containerHeight;
        newData.style.width = "94%";
        containerRight.appendChild(newData);
        const match = checkbox.id.match(/\d+/); // Sucht die erste Zahl in der ID
        const checkboxNumber = match ? match[0] : "1"; // Falls keine Zahl gefunden wird, Standardwert "1"
        // Dynamische Auswahl des JSON-Objekts basierend auf dem Index
        console.log(jsonAssetData)
        const jsonKey = "jsonAsset" + checkboxNumber; // Ergibt z.B. "jsonAsset1", "jsonAsset2", ...
        console.log(jsonKey);
        const jsonObject = JSON.parse(jsonAssetData[jsonKey] || "{}"); // Fallback auf leeres JSON, falls nicht vorhanden
        const assetIdKey = "asset" + checkboxNumber;
        createChart(jsonObject, newData.id, assetIds[assetIdKey]);
    });
}

function generatePath(text) {
    const variable = text.split('-').pop(); // Nimmt alles nach dem "-"
    return `../daten/${variable}_data.json`;
}

function createChart(dataSource, containerID, chartTitle) {
    const container = document.getElementById(containerID);
    
    // Überschrift erstellen
    let title = document.createElement("h7");
    title.innerText = chartTitle; // Die Überschrift wird hier gesetzt
    container.appendChild(title); // Überschrift zum Container hinzufügen

    let newChart = document.createElement("canvas");
    newChart.id = "chart-" + containerID.split('-')[2]; 
    newChart.classList.add("chart");

    newChart.style.width = "100%";
    newChart.style.height = "100%";

    container.appendChild(newChart);

    // Prüfen, ob `dataSource` ein String (Pfad zur JSON-Datei) oder ein Objekt (direkte JSON-Daten) ist
    let dataPromise = typeof dataSource === "string"
        ? fetch(dataSource).then(response => response.json()) // Falls URL: Laden
        : Promise.resolve(dataSource); // Falls JSON-Objekt: Direkt verwenden

    dataPromise
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
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Time' },
                            grid: { color: 'rgba(200, 200, 200, 0.3)' }
                        },
                        y: {
                            beginAtZero: false,
                            title: { display: true, text: 'Value' },
                            grid: { color: 'rgba(200, 200, 200, 0.3)' }
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Fehler beim Laden oder Verarbeiten der JSON-Daten:', error));
}



// function createChart(jsonFilePath, containerID) {
//     const container = document.getElementById(containerID);
    
//     let newChart = document.createElement("canvas");
//     newChart.id = "chart-" + containerID.split('-')[2]; 
//     newChart.classList.add("chart");
    
//     // Wichtig: Canvas soll gesamte Breite und Höhe nutzen
//     newChart.style.width = "100%";
//     newChart.style.height = "100%";

//     container.appendChild(newChart);

//     fetch(jsonFilePath) // JSON-Datei laden
//         .then(response => response.json())
//         .then(jsonData => {
//             const labels = jsonData.map(entry => {
//                 let date = new Date(entry.timestamp);
//                 return date.getHours() + ':' + String(date.getMinutes()).padStart(2, '0');
//             });
//             const values = jsonData.map(entry => entry.value);

//             const ctx = newChart.getContext('2d');
//             new Chart(ctx, {
//                 type: 'line',
//                 data: {
//                     labels: labels,
//                     datasets: [{
//                         label: 'Value',
//                         data: values,
//                         borderColor: '#ff6384',
//                         backgroundColor: 'rgba(255, 99, 132, 0.2)',
//                         pointBorderColor: '#ff6384',
//                         pointBackgroundColor: '#ff6384',
//                         pointRadius: 2,
//                         pointHoverRadius: 7,
//                         borderWidth: 2,
//                         fill: true,
//                         tension: 0.2
//                     }]
//                 },
//                 options: {
//                     responsive: true,  // Automatische Anpassung aktivieren
//                     maintainAspectRatio: false, // Erlaubt freie Größenanpassung
//                     animation: false, // Animation deaktivieren
//                     plugins: {
//                         legend: {
//                             display: false
//                         }
//                     },
//                     scales: {
//                         x: {
//                             title: {
//                                 display: true,
//                                 text: 'Time'
//                             },
//                             grid: {
//                                 color: 'rgba(200, 200, 200, 0.3)'
//                             }
//                         },
//                         y: {
//                             beginAtZero: false,
//                             title: {
//                                 display: true,
//                                 text: 'Value'
//                             },
//                             grid: {
//                                 color: 'rgba(200, 200, 200, 0.3)'
//                             }
//                         }
//                     }
//                 }
//             });
//         })
//         .catch(error => console.error('Fehler beim Laden der JSON-Datei:', error));
// }

function clearDynamicContent() {
    // Element mit der ID 'show-data' selektieren
    var element = document.getElementById('show-data');
    
    // Den Inhalt des Elements löschen
    element.innerHTML = '';
}

function loadConsumer(consumerNumber) {
    createNavbar(); // Navbar neu erstellen, wenn ein neuer Consumer geladen wird
    console.log(assetIds);
    console.log(jsonAssetData);
    console.log(assetIds["asset1"]);



    // Wenn der Consumer gewechselt wurde
    if (consumer !== consumerNumber) {
        const dataSelection = document.getElementById("data-selection");
        consumer = consumerNumber;

        // Dynamische Labels basierend auf der Consumer-Nummer
        const dataLabels = {};
        for (let i = 1; i <= countConsumer; i++) {
            dataLabels[i] = {
                temperature: `consumer${i}-temperature`,
                IO: `consumer${i}-IO`,
                resistanceValue: `consumer${i}-resistanceValue`
            };
        }

        // Aktualisieren der Checkboxen basierend auf der Auswahl
        // dataSelection.innerHTML = `
        //     <div class="select-data">
        //         <label><input type="checkbox" id="${dataLabels[consumerNumber].temperature}"> Temperature</label>
        //         <label><input type="checkbox" id="${dataLabels[consumerNumber].resistanceValue}"> Resistance value pt1000</label>
        //         <label><input type="checkbox" id="${dataLabels[consumerNumber].IO}"> IO signal</label>
        //     </div>
        // `;

        dataSelection.innerHTML = `
            <div class="select-data">
                <label><input type="checkbox" id="1_${assetIds["asset1"]}"> ${assetIds["asset1"]}</label>
                <label><input type="checkbox" id="2_${assetIds["asset2"]}"> ${assetIds["asset2"]}</label>
                <label><input type="checkbox" id="3_${assetIds["asset3"]}"> ${assetIds["asset3"]}</label>
            </div>
        `;

        // Dynamisch den Consumer-Namen festlegen
        const consumerName = `consumer${consumerNumber}`;
        
        // Dynamische IP-Adresse des Consumers anzeigen
        if (actorIpAdress[consumerName].length > 0) {
            document.getElementById("show-consumer-address").textContent = `IP-Address: ${actorIpAdress[consumerName]}`;
        } else {
            document.getElementById("show-consumer-address").textContent = `No Consumer ${consumerNumber} connected!`;
        }

        // Event-Listener nachträglich für neue Checkboxen setzen
        addCheckboxListeners();

        // Hintergrundfarben der Tabs aktualisieren
        for (let i = 1; i <= countConsumer; i++) {
            document.getElementById(`tab-consumer${i}`).style.backgroundColor = "";
        }
        document.getElementById(`tab-consumer${consumerNumber}`).style.backgroundColor = "#EFF0F1";

        // Dynamisch die restlichen Inhalte löschen
        clearDynamicContent();
    }
}



