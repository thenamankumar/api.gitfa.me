#!/usr/bin/env bash
chmod 600 key.pem
ssh -o StrictHostKeyChecking=no -i key.pem $USER@$SERVER "cd ~/api.gitfa.me/; git pull origin master; yarn; yarn prisma; pm2 restart api.gitfa.me --update-env;"
