# Dockerfile for GUI in a Docker Image

This document explains how to build and run a Docker container that encapsulates a GUI application.

## Build Command

To build the Docker image, use the following command:

```bash
docker build -t <username>/edc:gui
```
`docker build`
This command is used to create a Docker image from a Dockerfile. It reads the instructions in the Dockerfile and builds the image accordingly.

`-t <username>/edc:gui`:
This option tags the image with a specified name and version.

Replace <username> with your Docker Hub username or any desired identifier.
edc: The name of the application or project.
gui: The tag that represents the version or functionality of the image, in this case, the GUI version.

## Run Command

Once the Docker image is built, you can run the container using the following command:

```bash
docker run -e HOST_IP=<host-ip> -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock --name gui -it <username>/edc:gui
```
### Explanation of the Run Command

`docker run`:
This command starts a new container from the image created in the previous step. It runs the application inside the container.

`-e HOST_IP=<host-ip>`:
This sets an environment variable HOST_IP inside the container.
Replace <host-ip> with the actual IP address of the host machine where the GUI application will be running.

`-p 3000:3000`:
This option binds port 3000 of the host machine to port 3000 of the container.
It allows external access to the container’s GUI application.

`-v /var/run/docker.sock:/var/run/docker.sock`:
This option mounts the Docker socket from the host into the container.
The Docker socket (/var/run/docker.sock) allows the container to interact with the Docker daemon running on the host machine. This is useful to exercise commands in container.

`--name gui`:
This assigns the name gui to the running container. You can refer to this container by its name when performing other Docker operations, such as stopping or inspecting it.

`-it`:
This option allows interactive terminal access to the container.

<username>/edc:gui:
This specifies the image to run. It refers to the image you built earlier with the docker build command.

`<username>`:
Your Docker username or repository name.
  - edc: The project or image name.
  - gui: The tag that represents the GUI version of the image.
