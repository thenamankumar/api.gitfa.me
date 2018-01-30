chmod 600 key.pem
ssh -o StrictHostKeyChecking=no -i key.pem $USER@$SERVER "cd /var/www/html/gitfame-backend; git reset --hard HEAD; git pull origin master; npm i; pm2 restart gitfame-backend;"
