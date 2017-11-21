chmod 600 key.pem
ssh -o StrictHostKeyChecking=no -i key.pem $USER@$SERVER "rm -rf /var/www/html/gitfame-backend/*;"
scp -o StrictHostKeyChecking=no -i key.pem -r ./* $USER@$SERVER:/var/www/html/gitfame-backend
ssh -o StrictHostKeyChecking=no -i key.pem $USER@$SERVER "cd /var/www/html/gitfame-backend/; npm run server;"