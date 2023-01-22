const cluster = require('cluster');
const http = require('http');
const url = require('url');
const fs = require('fs');
const process = require('process');

const config = require('./config');

const { Redis } = require('./class.redis');

// const indexFile = fs.readFileSync('./index.html');
const calctixFile = fs.readFileSync('./calctix.js');

const redis = new Redis();

async function processData(data) {
    // buradaki en büyük problem daha sonrasında subkeylerin silinmesi gerekliliği
    // o yüzden keylere ek bir zamanlı değer daha eklenebilir ki sonrasında expire kolayca yapılabilsin.

    // d1: saniye bazında sayfa görüntüleme istatistiği için
    redis.hIncrBy('d1:s:' + data.sid, 't:' + data.time, 1, 0);

    // 0. saniyede unixtime
    let timeAt0Second = data.time - data.time % 60;
    
    // d2: dakika bazında sayfa görüntüleme istatistiği için
    redis.hIncrBy('d2:s:' + data.sid, 't:' + timeAt0Second, 1, 0);
}

// siteye ait istatistik datasını getir
async function getAllData(sid) {
    return {
        'secondly': await redis.hGetAll('d1:s:' + sid), 
        'minutely': await redis.hGetAll('d2:s:' + sid),
    };
}

const requestListener = async function (req, res) {
    let uri = url.parse(req.url, true);

    if (uri.pathname == '/calctix.js') {
        // processData fonksiyonunu daha sonra calctix.js içinden çağırılacak olan bir isteğe bağlayacağız. 
        // İlk faz için fazla bir veriye ihtiyacımız yok
        // İhtiyacımız olabilecek verileri topluyoruz.

        let data = {
            // user agent
            uagent: req.headers['user-agent'],
            // client ip - https://stackoverflow.com/a/19524949
            cip: req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress,
            // request unixtime
            time: parseInt(Date.now() / 1000),
            // url the script is exist
            uri: req.headers['referer'],
            // site id
            sid: parseInt(uri.query.id),
        };

        processData(data);

        res.writeHead(200);
        res.end(calctixFile);
    } else if (uri.pathname == '/stats') {
        res.writeHead(200);
        res.end(JSON.stringify(await getAllData(parseInt(uri.query.id))));
    } else {
        const indexFile = fs.readFileSync('./index.html');

        res.writeHead(200);
        res.end(indexFile);
    }
};

if (cluster.isPrimary) {
    const numCPUs = 1 // require('os').cpus().length;

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
    http.createServer(requestListener).listen(config.http.port);

    console.log('Worker Started', process.pid);
}

