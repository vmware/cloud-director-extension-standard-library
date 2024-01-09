# ------------------------------------------------------
# Copyright 2023 VMware, Inc.
# SPDX-License-Identifier: BSD-2-Clause
# ------------------------------------------------------
# Build element
# ------------------------------------------------------
ARG DOCKER_REPO

FROM $DOCKER_REPO/node:16-slim as NODE
WORKDIR /usr/app
ADD . .
RUN npm ci && npm run build

# ------------------------------------------------------
# Output element artifacts
# ------------------------------------------------------
FROM scratch AS export
COPY --from=NODE /usr/app/lib ./
