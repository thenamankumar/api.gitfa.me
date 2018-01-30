chmod 600 key.pem
npm i
ssh -o StrictHostKeyChecking=no -i key.pem $USER@$SERVER "rm -rf /var/www/html/gitfame-backend/*;"
scp -o StrictHostKeyChecking=no -i key.pem -r ./* $USER@$SERVER:/var/www/html/gitfame-backend
ssh -o StrictHostKeyChecking=no -i key.pem $USER@$SERVER "pm2 restart gitfame-backend;"
