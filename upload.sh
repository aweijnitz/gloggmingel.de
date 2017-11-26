#!/usr/bin/env bash
gulp deploy
rsync -avz -e "ssh -i $HOME/.ssh/andersw.info" dist/ aw@andersw.info:/home/aw/www/gloggmingel.de/public_html/
