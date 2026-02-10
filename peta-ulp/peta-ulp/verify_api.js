const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/batas-kabupaten',
    method: 'GET',
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            console.log(`Data received. Is Array? ${Array.isArray(jsonData)}`);
            console.log(`Length: ${jsonData.length}`);
            if (jsonData.length > 0) {
                console.log("Sample item keys:", Object.keys(jsonData[0]));
                if (jsonData[0].geometry) {
                    console.log("Sample geometry type:", jsonData[0].geometry.type);
                }
            }
        } catch (e) {
            console.log("Response is not JSON:", data.substring(0, 100));
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
