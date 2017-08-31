#!/bin/bash
./node_modules/forever/bin/forever stop -a -l /var/log/forever.log ./index.js
