service mariadb start
service redis-server start
cd /mnt/apps/apps/app
pm2 start server.js
tail -F /var/log