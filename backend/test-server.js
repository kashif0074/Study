const express = require('express');
const app = express();
const PORT = 5051;

app.get('/', (req, res) => {
    res.send('Hello from minimal server!');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Minimal server running on http://0.0.0.0:${PORT}`);
});
