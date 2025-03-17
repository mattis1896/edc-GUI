
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
    loadJsonData("../daten/resistanceValue_data.json", "asset-data2", "Ω");
    loadJsonData("../daten/IO_data.json", "asset-data3", "");
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
        case "provider-data3":
            if(checkbox.checked){
                loadJsonData("../daten/IO_data.json", "asset-data3", "");
            }else{
                clearContainer("asset-data3")
            }
            break;
        case "provider-data2":
            if(checkbox.checked){
                loadJsonData("../daten/resistanceValue_data.json", "asset-data2", "Ω");
            }else{
                clearContainer("asset-data2")
            }
            break;
    }
}

async function loadJsonData(filePath, containerId, unit) {
    console.log(`loadJsonData() wurde für ${filePath} aufgerufen!`);
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
    
}

console.log(actorIpAdress);