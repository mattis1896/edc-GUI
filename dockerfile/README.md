# Dockerfile for GUI in a Docker Image

This document explains how to build and run a Docker container that encapsulates a GUI application.

## Build Command

To build the Docker image, use the following command:

```bash
docker build -t <username>/edc:gui

docker build: This command is used to create a Docker image from a Dockerfile.
-t <username>/edc:gui: This option tags the image with the specified name and version. Replace <username> with your Docker Hub username or any desired identifier.
edc is the name of the application or project.
gui is the tag that represents the version or the functionality (in this case, GUI) of the image.

## Run Command

To build the Docker image, use the following command:

```bash
docker run -e HOST_IP=<host-ip> -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock --name gui -it <username>/edc:gui

