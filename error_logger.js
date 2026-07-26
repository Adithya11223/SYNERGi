const http = require('http');
http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    console.log('ERROR LOGGED:', body);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('ok');
  });
}).listen(9999, () => console.log('Listening on 9999...'));
