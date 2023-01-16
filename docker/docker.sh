service mariadb start
service redis-server start
cd /mnt/apps/apps/app
cp config.sample.js config.js 
npm install
pm2 start server.js
tail -F /var/log