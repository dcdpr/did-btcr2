#!/bin/sh
cd $(git rev-parse --show-toplevel)
exec mdbook serve --open
