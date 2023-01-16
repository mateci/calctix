FROM ubuntu:latest

RUN apt-get update

RUN apt-get -y install curl vim net-tools wget git procps

RUN curl -sL https://deb.nodesource.com/setup_18.x  | bash -
RUN apt-get -y install nodejs

RUN npm install -g npm@latest

RUN apt-get install -y redis-server

RUN apt-get install -y mariadb-server

RUN npm install -g n

RUN npm install -g pm2

RUN touch ~/.vimrc

COPY docker.sql /mnt/docker.sql
COPY sql/main.sql /mnt/main.sql

RUN service mariadb start && mysql -u root -h localhost < /mnt/docker.sql && mysql -u root -h localhost calctix < /mnt/main.sql
RUN sed -i 's/bind-address/#bind-address/' /etc/mysql/mariadb.conf.d/50-server.cnf

COPY docker.sh /mnt/docker.sh
RUN chmod +x /mnt/docker.sh
ENTRYPOINT /mnt/docker.sh