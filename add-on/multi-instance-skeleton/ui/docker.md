# Building this project with Docker
This project is suited for building using Docker. You are not limited to building using only 
Docker, however building with Docker, guarantees use of compatible 
nodejs and npm versions, which you shouldn't install locally.

To build using Docker simply run:

DOCKER_BUILDKIT=1 docker build --no-cache --target=export --output=dist .