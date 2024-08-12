# ------------------------------------------------------
# Copyright 2023 VMware, Inc.
# SPDX-License-Identifier: BSD-2-Clause
# ------------------------------------------------------
# Build element
# ------------------------------------------------------
ARG DOCKER_REPO
FROM $DOCKER_REPO/node:18.20-slim as NODE
COPY . /usr/app
WORKDIR /usr/app
RUN npm ci
RUN npm run build

# ------------------------------------------------------
# Output element artifacts
# ------------------------------------------------------
FROM scratch AS export
COPY --from=NODE /usr/app/dist ./
