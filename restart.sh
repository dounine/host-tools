#!/bin/bash
./node_modules/forever/bin/forever restart -a -l /var/log/forever.log ./index.js
