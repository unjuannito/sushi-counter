#!/bin/sh
set -eu

mkdir -p /app/data

exec /usr/bin/dumb-init -- "$@"
