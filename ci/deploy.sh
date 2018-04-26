#!/usr/bin/env bash
chmod 600 key.pem
ssh -o StrictHostKeyChecking=no -i key.pem $USER@$SERVER "cd ~/api/; git pull origin master; yarn && yarn prisma && pm2 restart api.sharecake.io;"
