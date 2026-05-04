const https = require('https');

https.get('https://www.google.com', (res) => {
    console.log('Status Code:', res.statusCode);
}).on('error', (e) => {
    console.error('Error:', e.message);
});
