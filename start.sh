#!/bin/bash
./node_modules/forever/bin/forever start -a -l /var/log/forever.log ./index.js
