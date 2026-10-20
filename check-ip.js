const https = require('https');

https.get('https://api.ipify.org', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(`Public IP: ${data}`));
}).on('error', (err) => {
  console.error('Error fetching public IP:', err.message);
});
