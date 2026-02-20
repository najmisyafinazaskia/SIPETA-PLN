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
                const firstFeature = jsonData[0];
                const coords = firstFeature.geometry.coordinates;
                // Inspect deep to find the first pair
                let point = coords;
                while (Array.isArray(point[0])) {
                    point = point[0];
                }
                console.log("First point coordinates:", point);

                const [x, y] = point;
                console.log(`X (Candidate Lng): ${x}`);
                console.log(`Y (Candidate Lat): ${y}`);

                if (y > 90 || y < -90) {
                    console.log("WARNING: Y is out of latitude range (-90 to 90). Coordinates might be swapped or incorrectly projected.");
                } else if (x < 6) {
                    console.log("WARNING: X is very small (Check if it is Lat). Aceh should be around Lng 95-98.");
                } else {
                    console.log("Coordinates look likely valid for Aceh?");
                }
            }
        } catch (e) {
            console.error("Error parsing:", e);
        }
    });
});
req.end();
