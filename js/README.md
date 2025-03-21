# JS Folder

The **"js"** folder contains the JavaScript files responsible for the application’s logic. These files manage the interaction, data handling, and dynamic content of the GUI. Below is a breakdown of the key JavaScript files and their functionalities.

## 1. `configuration.js`

The **`configuration.js`** file manages all user-provided information, including IP addresses and, if necessary, passwords for the Provider and Consumer.

### Key Functions:
- **Data Management**: Stores relevant information in variables and session storage to ensure all pages can access the required data. This includes IP addresses, terminal outputs, and other necessary information.
- **Persistence**: Ensures that IP addresses and terminal outputs remain visible upon reopening the configuration page, preventing the misleading impression that no Provider or Consumer is connected.
- **Automated Data Exchange**: Manages the automated data exchange process. For more information, refer to Chapter 4.5.
- **Event Handling**: Adds event listeners for interactive elements like buttons and checkboxes.
- **Dynamic Consumer Management**: Allows for the dynamic addition or removal of Consumers when the corresponding button is clicked.
- **Reset Function**: The **`resetButtonClick()`** function is triggered when the reset button is pressed. It clears relevant data, such as session storage, terminal content, and saved IP addresses.

### Automated Data Exchange

#### Prerequisites

To automate the data exchange, the following setup is required:

1. **EDC Docker Container**: The EDC Docker container must be running on all devices.
2. **GUI Docker Container**: The GUI Docker container must be running on one device (the Edge computer in this demo setup).

**Important considerations for the demo setup**:
- The **GUI** should be running on the **Edge Computer**, as described earlier.
- Ensure that the Docker containers are started correctly. For proper communication with the EDC, the following internal ports must be exposed via port mapping:
  - **19193**
  - **29193**
  - **19291**
  
  These ports need to be accessible from outside the containers to allow proper communication.

3. **IP Address Configuration**: When starting the Docker container for the GUI, the host IP address must be passed using the following option:
   ```bash
   -e HOST_IP=<IP-ADDRESS>

## 2. `provider.js`

The **`provider.js`** file handles the logic for the Provider page. When the page is loaded, the policies for the assets and the measurement series are populated in the corresponding HTML elements.

### Key Functions:
- **Policy and Measurement Series Display**: Upon page load, the policies related to the assets and the measurement series are inserted into the relevant HTML containers.
- **JSON Data Loading**: Uses the **`loadJsonData()`** function to asynchronously fetch JSON data (using `fetch`), extract values, and display them in the appropriate HTML elements.

## 3. `consumer.js`

The **`consumer.js`** file handles the logic for the Consumer page. Upon loading, **Consumer1** is selected by default, and all available data is populated into the respective HTML elements.

### Key Functions:
- **Default Consumer Selection**: When the Consumer page is loaded, **Consumer1** is automatically selected, and the relevant data is displayed.
- **Checkbox Interaction**: Event listeners are added to checkboxes. When a checkbox is clicked, a new container element is dynamically created, displaying the data corresponding to the selected checkbox.
- **Graph Generation**: A chart is created based on the selected data using the **Chart.js** library. The graph is rendered inside an HTML `<canvas>` element. The data for the graph is extracted from the source (either a URL or JSON object) and plotted with timestamps on the x-axis and corresponding values on the y-axis. The chart is responsive and adjusts its size according to the container.
- **Error Handling**: Any errors during the data processing are logged in the browser’s console for troubleshooting.

### Chart.js Integration:
The graph for the selected data is drawn using the **Chart.js** library. It creates a line chart that is fully configurable, ensuring it looks as shown in Figure 4.5. The chart’s appearance and behavior are responsive, adapting to different screen sizes.
