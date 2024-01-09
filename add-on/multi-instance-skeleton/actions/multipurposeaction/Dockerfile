# ------------------------------------------------------
# Copyright 2023 VMware, Inc.
# SPDX-License-Identifier: BSD-2-Clause
# ------------------------------------------------------
# Build element
# ------------------------------------------------------
ARG DOCKER_REPO

FROM $DOCKER_REPO/golang:1.19.2-bullseye AS GOLANG

ADD . /opt/src
WORKDIR /opt/src
RUN env GOARCH=amd64 GOOS=linux     go build -ldflags="-s -w" -o dist/linux .
RUN env GOARCH=amd64 GOOS=darwin    go build -ldflags="-s -w" -o dist/darwin .
RUN env GOARCH=amd64 GOOS=windows   go build -ldflags="-s -w" -o dist/windows.exe .


# ------------------------------------------------------
# Output element artifacts
# ------------------------------------------------------
FROM scratch AS export
COPY --from=GOLANG /opt/src/dist ./
