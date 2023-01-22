const redis = require('redis');

const config = require('./config');

class Redis {
    constructor() {
        this.connected = 0;

        this.client = redis.createClient({
            socket: {
                port: config.redis.port,
                host: config.redis.host
            }
        });

        this.client.on('error', (err) => console.log('Redis Client Error', err));

        this.connect();
    }

    async connect() {
        await this.client.connect();
        await this.client.sendCommand(['auth', config.redis.pass]);

        this.connected = 1;
    }

    async set(key, value, expire) {
        if (this.connected) {
            await this.client.set(key, value);

            if (expire != 0) {
                this.client.expire(key, expire);
            }
        }

        return;
    }

    async incrBy(key, value, expire) {
        if (this.connected) {
            await this.client.incrBy(key, value);

            if (expire != 0) {
                this.client.expire(key, expire);
            }
        }

        return;
    }

    async hIncrBy(key1, key2, value, expire) {
        if (this.connected) {
            await this.client.hIncrBy(key1, key2, value);

            if (expire != 0) {
                this.client.expire(key1, expire);
            }
        }

        return;
    }

    async hGetAll(key) {
        if (this.connected) {
            return await this.client.hGetAll(key);
        }

        return null;
    }
}

exports.Redis = Redis;