#!/bin/sh
cd $(git rev-parse --show-toplevel)/mdbook
exec mdbook serve --open

