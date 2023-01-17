# ------------------------------------------------------
# Copyright 2023 VMware, Inc.
# SPDX-License-Identifier: BSD-2-Clause
# ------------------------------------------------------

# syntax=docker/dockerfile:1

# ------------------------------------------------------
# Build element
# ------------------------------------------------------
FROM node:16-slim as build
WORKDIR /usr/app
ADD . .
RUN npm ci && npm run build

# ------------------------------------------------------
# Output element artifacts
# ------------------------------------------------------
FROM scratch AS export
COPY --from=build /usr/app/lib ./
