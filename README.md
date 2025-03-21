# edc-GUI

This repository provides a graphical user interface (GUI) that visually represents Gaia-X-compliant communication with an EDC (Entity Data Connector). It is designed to simplify the understanding and onboarding of these processes.

# Project Requirements and Setup

This repository depends on [edc-connector-repo-WS2024](https://github.com/mattis1896/edc-connector-repo-WS2024). Both repositories contain Dockerfiles that you need to use to build Docker containers for the project.

## Important Notes

- The **GUI** and the **EDC** (Eclipse DataSpace Connector) must be run in Docker containers created with the provided Dockerfiles.
- Currently, the system works only when both the **EDC** and **GUI** containers are running on the **same device**.

## Communication Between Two Devices

In the current setup, the containers are designed to run on a single machine. If you want to run the **GUI** and **EDC** on **two different devices**, the necessary steps will be outlined in the section **"Solution for Communication Between Two Devices"**.

# Frontend

## Configuration Page Overview

![image](https://github.com/user-attachments/assets/4b490175-3737-4842-a929-1151decfa23c)

Upon launching the GUI, you are directed to the **Configuration Page**, as shown in the Figure above. This page includes several features designed for ease of use and efficient interaction:

- **Navigation Bar**: At the top of the page, there is a navigation bar (1) that allows you to switch between the three pages. The currently active page is highlighted in light grey.

- **Reset Button**: On the configuration page, you will find a **Reset Button** that allows you to reset all settings and return to the initial state.

- **IP Address Input**: Below the navigation bar, you can enter the **IP addresses** for the **Provider** and the **Consumer** (2). 

- **Connect Button**: When the **Connect Button** is pressed, it initiates the communication process. After being clicked, the button changes color from grey to green, and it becomes inactive, preventing further input in the corresponding field.

- **Consumer Management**: In the **Consumer Section**, there are two buttons (3) that allow you to either add or remove a consumer.

- **Simulated Terminal**: On the right side of the page, a **simulated terminal** (4) displays the communication process and progress of data exchange. This simulated terminal is used because the output of a real terminal can often be difficult to understand and does not serve the purpose of this GUI effectively.

This layout ensures that all necessary configurations are clearly visible and easily accessible, making the setup process more intuitive.

## Provider Page Overview

![image](https://github.com/user-attachments/assets/abffd663-eac6-48cd-b4e0-9bd50f7d2fdf)

The second page is the **Provider Page**, as shown in the Figure above. This page displays all the information that the Provider can access:

- **Navigation Bar**: At the top of the page, there is a navigation bar (1) allowing you to switch between pages, just like on the other pages.

- **Catalog**: Below the navigation bar, the **catalog** is displayed, showing which **assets** are available and which **policies** need to be met for a Consumer to access the assets (2). When you hover over the **"i" icon** inside a circle, more detailed information about each policy is provided.

- **Asset Measurement Data**: Below the catalog, you will find the **measurement series** for each asset (3). These can be toggled on and off using the corresponding checkbox, allowing you to display or hide the data as needed.

This layout provides the Provider with all necessary details about the available assets and policies, along with an interactive way to manage and view the relevant data.

## Consumer Page Overview

![image](https://github.com/user-attachments/assets/417ce2c9-9913-414e-9bda-f1aa42ab67a1)

The final page is the **Consumer Page**, as shown in the Figure above. This page displays all the information that the Consumer can access:

- **Navigation Bar**: At the top of the page, you can switch between the different pages (1), just like on the other pages.

- **Connected Consumers**: Below the navigation bar, there is a section that displays the connected **Consumers** (2). You can switch between the listed Consumers, with the currently selected one highlighted in grey. The **IP address** of each Consumer is also shown in the center of the row to help identify the specific Consumer.

- **Data Selection**: Below this section, on the left side, you can use checkboxes to select the **data** you wish to display (3). These selected data points will be shown on the right side of the page (4). A maximum of two checkboxes can be selected at once to ensure the graphs remain readable.

- **Graphs**: The selected data will be represented in graphs that consist of a **title**, a **time axis** (x-axis), a **value axis** (y-axis), and the actual data points.

- **Policies and Data Access**: Additionally, the page shows which **policies** the selected Consumer meets and which data they are authorized to pull from the Provider (5).

This layout ensures that the Consumer can easily view the relevant data, manage selections, and understand the policies governing their access.

# Solution for Communication Between Two Devices

To enable communication between two devices, it is essential to first determine which device will act as the **Consumer** and which will act as the **Provider**. Once this is clarified, the following steps must be taken to configure the devices:

### 1. Modify the Properties Files
Both devices require modifications to their respective **properties files** located at:
[edc-connector-repo-WS2024 Configuration Files](https://github.com/mattis1896/edc-connector-repo-WS2024/tree/main/transfer/transfer-00-prerequisites/resources/configuration)
- **For the Consumer**: In the consumer's properties file, replace `localhost` with the **IP address of the Consumer**.
- **For the Provider**: In the provider's properties file, replace `localhost` with the **IP address of the Provider**.

### 2. Modify JSON Files
Additionally, the following JSON files must be updated to ensure proper communication:
- **fetch-catalog.json**
- **negotiate-contract.json**
- **start-transfer.json**

In each of these files, replace `localhost` with the **IP address of the Provider**.

### 3. Future Automation with `configuration.js`
These changes can also be automated in the future using the `configuration.js` script. However, this feature is not yet implemented. Currently, the script contains checks for each command to determine if it should be executed on `localhost` or elsewhere. It checks whether the **Consumer** is running on the same device as the GUI or on a different one. Based on this, the command will be adjusted accordingly.

### 4. Data Exchange Process
For a more detailed explanation of how the data exchange process works, refer to the **README.md** file in the `js` folder. This document provides an in-depth overview of the data flow and how the system handles communication between devices.

By following these steps and ensuring the correct configuration, you can establish seamless communication between two devices, with the Consumer and Provider exchanging data efficiently.


