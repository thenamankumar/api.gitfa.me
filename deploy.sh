chmod 600 key.pem
ssh -o StrictHostKeyChecking=no -i key.pem $USER@$SERVER "pm2 stop server; rm -rf /var/www/html/gitfame-backend/*;"
scp -o StrictHostKeyChecking=no -i key.pem -r ./* $USER@$SERVER:/var/www/html/gitfame-backend
ssh -o StrictHostKeyChecking=no -i key.pem $USER@$SERVER "pm2 start /var/www/html/gitfame-backend/server.js;"