# ------------------------------------------------------
# Copyright 2023 VMware, Inc.
# SPDX-License-Identifier: BSD-2-Clause
# ------------------------------------------------------

# syntax=docker/dockerfile:1

# ------------------------------------------------------
# Build element
# ------------------------------------------------------
FROM node:12.16.3-slim as NODE
COPY . /usr/app
WORKDIR /usr/app
RUN npm ci
RUN npm run build

# ------------------------------------------------------
# Output element artifacts
# ------------------------------------------------------
FROM scratch AS export
COPY --from=NODE /usr/app/dist ./
