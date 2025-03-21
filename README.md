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

Upon launching the GUI, you are directed to the **Configuration Page**, as shown in Figure 4.3. This page includes several features designed for ease of use and efficient interaction:

- **Navigation Bar**: At the top of the page, there is a navigation bar (1) that allows you to switch between the three pages. The currently active page is highlighted in light grey.

- **Reset Button**: On the configuration page, you will find a **Reset Button** that allows you to reset all settings and return to the initial state.

- **IP Address Input**: Below the navigation bar, you can enter the **IP addresses** for the **Provider** and the **Consumer** (2). 

- **Connect Button**: When the **Connect Button** is pressed, it initiates the communication process. After being clicked, the button changes color from grey to green, and it becomes inactive, preventing further input in the corresponding field.

- **Consumer Management**: In the **Consumer Section**, there are two buttons (3) that allow you to either add or remove a consumer.

- **Simulated Terminal**: On the right side of the page, a **simulated terminal** (4) displays the communication process and progress of data exchange. This simulated terminal is used because the output of a real terminal can often be difficult to understand and does not serve the purpose of this GUI effectively.

This layout ensures that all necessary configurations are clearly visible and easily accessible, making the setup process more intuitive.

