USE mysql;
CREATE USER 'calctix'@'%' IDENTIFIED BY 'Ty7snB&sgdvK6dg';
GRANT ALL PRIVILEGES ON *.* TO 'calctix'@'%';
CREATE DATABASE calctix;
FLUSH PRIVILEGES;