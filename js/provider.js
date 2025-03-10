
import { updateSharedVariable } from './configuration.js';

const actorIpAdress = {
    consumer1: sessionStorage.getItem("consumer1") || "",
    consumer2: sessionStorage.getItem("consumer2") || "",
    consumer3: sessionStorage.getItem("consumer3") || "",
    provider: sessionStorage.getItem("provider") || "" // Falls vorhanden, aus sessionStorage laden
};
const checkboxes = document.querySelectorAll(".show-assets input[type='checkbox']");

document.addEventListener('DOMContentLoaded', () => {
    loadProvider();
});

function fillAssetData(){
    loadJsonData("../daten/temperature_data.json", "asset-data1", "°C");
    loadJsonData("../daten/voltage_data.json", "asset-data2", "V");
    loadJsonData("../daten/current_data.json", "asset-data3", "A");
}

checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", function () {
        handleCheckboxChange(this);
    });
});

function handleCheckboxChange(checkbox){
    switch(checkbox.id){
        case "provider-data1":
            if(checkbox.checked){
                loadJsonData("../daten/temperature_data.json", "asset-data1", "°C");
            }else{
                clearContainer("asset-data1")
            }
            break;
        case "provider-data2":
            if(checkbox.checked){
                loadJsonData("../daten/voltage_data.json", "asset-data2", "V");
            }else{
                clearContainer("asset-data2")
            }
            break;
        case "provider-data3":
            if(checkbox.checked){
                loadJsonData("../daten/current_data.json", "asset-data3", "A");
            }else{
                clearContainer("asset-data3")
            }
            break;
    }
}

async function loadJsonData(filePath, containerId, unit) {
    console.log(`🔍 loadJsonData() wurde für ${filePath} aufgerufen!`);
    try {
        console.log(`Lade Datei: ${filePath}`);

        const response = await fetch(filePath);

        if (!response.ok) {
            throw new Error(`Fehler beim Laden der Datei: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        console.log("Geladene Daten:", data); // Debug: Zeigt die JSON-Daten in der Konsole

        const formattedLines = data.map(entry => 
            `Time: ${entry.timestamp}  Value: ${entry.value} ${unit}`
        );

        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error(`Container mit ID "${containerId}" nicht gefunden!`);
            return;
        }

        container.innerHTML = formattedLines.join('<br>');

        console.log(`Container "${containerId}" wurde aktualisiert!`);

    } catch (error) {
        console.error("Fehler beim Laden der Datei:", error);
    }
}


function clearContainer(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = ""; // Löscht nur den Inhalt des Containers
    }
}

function loadProvider() {
    if(window.location.pathname.includes("provider.html")){
        fillAssetData();
    }
    
    // Example data for demonstration
    // const data = {
    //     temperature: ['Policy 1', 'Policy 2'],
    //     voltage: ['Policy 1', 'Policy 2', 'Policy 3'],
    //     current: ['Policy 1', 'Policy 2']
    // };

    // // Catalog Policies
    // const temperaturePolicies = document.getElementById('catalog-temperature');
    // const voltagePolicies = document.getElementById('catalog-voltage');
    // const currentPolicies = document.getElementById('catalog-current');

    // data.temperature.forEach(policy => {
    //     const p = document.createElement('p');
    //     p.textContent = policy;
    //     temperaturePolicies.appendChild(p);
    // });

    // data.voltage.forEach(policy => {
    //     const p = document.createElement('p');
    //     p.textContent = policy;
    //     voltagePolicies.appendChild(p);
    // });

    // data.current.forEach(policy => {
    //     const p = document.createElement('p');
    //     p.textContent = policy;
    //     currentPolicies.appendChild(p);
    // });

    // // Asset Data (Simulating loading the values dynamically for each category)
    // const temperatureData = document.getElementById('asset-data1');
    // const voltageData = document.getElementById('asset-data2');
    // const currentData = document.getElementById('asset-data3');

    // // Assuming dynamic data is coming from an API or similar
    // temperatureData.innerHTML = '<p>Temperature Data 1</p><p>Temperature Data 2</p>';
    // voltageData.innerHTML = '<p>Voltage Data 1</p><p>Voltage Data 2</p>';
    // currentData.innerHTML = '<p>Current Data 1</p><p>Current Data 2</p>';
}

console.log(actorIpAdress);