# edc-GUI

This repository provides a graphical user interface (GUI) that visually represents Gaia-X-compliant communication with an EDC (Entity Data Connector). It is designed to simplify the understanding and onboarding of these processes.

# Project Requirements and Setup

This repository depends on [edc-connector-repo-WS2024](https://github.com/mattis1896/edc-connector-repo-WS2024). Both repositories contain Dockerfiles that you need to use to build Docker containers for the project.

## Important Notes

- The **GUI** and the **EDC** (Eclipse DataSpace Connector) must be run in Docker containers created with the provided Dockerfiles.
- Currently, the system works only when both the **EDC** and **GUI** containers are running on the **same device**.

## Communication Between Two Devices

In the current setup, the containers are designed to run on a single machine. If you want to run the **GUI** and **EDC** on **two different devices**, the necessary steps will be outlined in the section **"Solution for Communication Between Two Devices"**.
