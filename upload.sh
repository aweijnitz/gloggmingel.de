#!/usr/bin/env bash
gulp deploy
rsync -avz dist/ aw@andersw.info:/home/aw/www/gloggmingel.de/public_html/
