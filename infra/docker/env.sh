#!/bin/bash
set -e

cd /home/monitorfish/
./import-meta-env -x .env.example -p public/**/*

