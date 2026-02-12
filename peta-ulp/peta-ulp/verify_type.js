const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/batas-kabupaten',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            if (jsonData.length > 0) {
                console.log("First item keys:", Object.keys(jsonData[0]));
                console.log("First item 'type':", jsonData[0].type);
                if (jsonData[0].type !== 'Feature') {
                    console.log("CRITICAL: 'type' is not 'Feature'. Leaflet requires { type: 'Feature' }.");
                } else {
                    console.log("Item is a valid Feature.");
                }
            }
        } catch (e) { console.error(e); }
    });
});
req.end();
