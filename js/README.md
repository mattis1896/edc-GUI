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

4. **WebSocket and Python Servers**: Both the WebSocket server inside the GUI Docker container and the Python server in the EDC Docker container need to be running. This setup is handled automatically through their respective Dockerfiles.

5. **Connector Creation**: Inside the Docker containers, the "build" folder must be correctly positioned to build the connector in the EDC. The connector will then be automatically used as either a Provider or Consumer, depending on the configuration. This is handled automatically through their respective Dockerfiles.

6. **Required JSON Files**: For communication with the EDC (as outlined in the demo setup), several JSON files are required. These JSON files are used to facilitate the negotiation and exchange of data between the Provider and Consumer. 

#### Data exchange process

As mentioned earlier, the data exchange takes place when connecting the Provider and Consumer on the **configuration.js** page. It's important to note that the **Provider** must be connected first, followed by the **Consumer**, as the Provider needs to create the assets and policies, and then assign the policies to the assets before the Consumer can retrieve them.

To automate the data exchange, **Connect** functions have been written for both the Provider and the Consumer parts. These functions are executed when the **Connect** button is pressed. These functions are shown in **Figure below**. Since communication always requires waiting for a response, these functions are asynchronous. The functions executed within the **Connect** functions are also asynchronous, which can be recognized by the use of **await**.

The **button** object is always passed along as an argument, as it contains information about which Provider or Consumer has been connected. These functions are documented in the code, although the comments have been removed to prevent the image from taking up too much space.

![image](https://github.com/user-attachments/assets/e22c70f5-3796-4ca1-a0d1-4ec13744513a)

#### Provider Workflow

The **connectToProvider** function executes all actions for the Provider. Within the **startProvider** function, a Java connector is launched as a Provider in the Docker container on the device with the corresponding IP address. 

Next, the **createAssets** function creates all assets. For each asset, a separate **create-asset** file is created and sent as a POST request to an API at `<IP-Address>:19193` (Provider port). The response is read to check if the asset was successfully created. 

In the **createPolicies** and **createContractDefinition** functions, the respective JSON files are sent to the same API. Currently, the policy does not have an effect, meaning any Consumer can fetch the asset assigned to the policy. As a result, the Consumer retrieves each asset. In the **create-contract-definition.json**, the policy is assigned to all assets. The response is checked to ensure everything was created correctly; if not, an error is thrown.

#### Consumer Workflow

The **connectToConsumer** function executes all actions for the Consumer. In the **startConsumer** function, a Java connector is started as a Consumer in the Docker container on the device with the corresponding IP address.

In the **fetchCatalog** function, a POST request is made to send the **fetch-catalog.json** to an API at `<IP-Address>:29193` (Consumer port). This file includes the `counterPartyAddress`, indicating the source of the catalog request. The response contains details about each asset, along with a `policyId` and the associated `assetId`. These IDs are filtered from the response and stored in the `matchPolicyIds` and `matchAssetIds`.

Now, the data transfer for each asset can proceed. For each `policyId`, the following steps are executed:

1. **negotiateContract** function: The `policyId` and `assetId` are written to the **negotiate-contract.json** to ensure the contract is negotiated for the correct asset.
2. A POST request is sent with the **negotiate-contract.json** to the Consumer API.
3. The response contains a UUID (Universally Unique Identifier), which is used to check the negotiation status in the **gettingContractAgreementID** function. This function sends a GET request with the UUID to the Consumer API, which returns the negotiation status. 
    - If the status is `FINALIZED`, the response also contains a `contractAgreementId`, which is needed to transfer the data.
    - If the status is `TERMINATED`, the asset cannot be fetched. However, this status is not yet reached in the current demo setup, as no functional policies exist. Once these policies are in place, a check will be performed to determine whether the asset can be fetched.

4. **startTransfer** function: The `contractAgreementId` and `assetId` are written to the **start-transfer.json**. This file contains information about who the data is coming from, which asset should be retrieved, and that the contract has been accepted by the Provider (`contractAgreementId`). 

    A POST request with the **start-transfer.json** is sent to the Consumer API to start the transfer process. The response contains a `transfer-process-id`, which is used in the **checkTransferStatus** function to verify if the transfer process has started. This is done with a GET request to the Consumer API.

5. If the transfer status is `STARTED`, the **getAuthorization** function is triggered. This function sends a GET request to the Consumer API with the `transfer-process-id` to obtain an `authorization-key`, which is required to retrieve the data from the Provider.

6. **getData** function: The data is fetched from the simulated JSON files at `<IP-Address>:19291` using a GET request. These values are then stored in the Session Storage, so they can be accessed from the GUI on the Consumer page.


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

### Important Commands

1. **Execute a command via SSH**  
   To execute a command on a target device using SSH, use the following command in your terminal on the source device:

   ```bash
   expect -c "spawn ssh root@<ip-target-device> \"<command>\"; expect \"password:\"; send \"<ssh-password>\r\"; interact"

- Replace <ip-target-device> with the IP address of the target device.
- Replace <command> with the command you want to execute on the target device.
- Replace <ssh-password> with the SSH password for the target device.

### Important Commands

2. **Execute a command in a Docker container**  

   To execute a command inside a Docker container, use the following:

   ```bash
   docker exec <containerID> <command>


- Replace <containerID> with the ID of the Docker container.
- Replace <command> with the command you want to run inside the container.

3. **Combine steps 1 and 2 to execute a command in a container on a remote device**

To execute a command inside a Docker container on a remote device, you can combine the previous two commands.
