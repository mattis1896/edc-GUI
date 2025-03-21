# Dockerfile for GUI in a Docker Image

This document explains how to build and run a Docker container that encapsulates a GUI application.

## Build Command

To build the Docker image, use the following command:

```bash
docker build -t <username>/edc:gui
```
**docker build**
This command is used to create a Docker image from a Dockerfile. It reads the instructions in the Dockerfile and builds the image accordingly.

**-t <username>/edc:gui**:
This option tags the image with a specified name and version.

Replace <username> with your Docker Hub username or any desired identifier.
edc: The name of the application or project.
gui: The tag that represents the version or functionality of the image, in this case, the GUI version.
