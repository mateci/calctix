const cluster = require('cluster');
const http = require('http');
const url = require('url');
const fs = require('fs');
const redis = require('redis');
const process = require('process');

const config = require('./config');

const calctixFile = fs.readFileSync('./calctix.js');

async function connectRedis() {
    const redisClient = redis.createClient({
        socket: {
            port: config.redis.port,
            host: config.redis.host
        }
    });

    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    
    await redisClient.connect();
    console.log('Redis Connected');
    await redisClient.sendCommand(['auth', config.redis.pass]);
}

connectRedis();

const requestListener = function (req, res) {
    let uri = url.parse(req.url, true);

    if (uri.pathname == '/calctix.js') {
        res.end(calctixFile);
    } else {
        res.writeHead(200);
        res.end('');
    }
};

if (cluster.isPrimary) {
    const numCPUs = require('os').cpus().length;

    // fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log('Worker Died', worker.process.pid);

        // fork a new one
        cluster.fork();
    });
} else {
    http.createServer(requestListener).listen(80);

    console.log('Worker Started', process.pid);
}

