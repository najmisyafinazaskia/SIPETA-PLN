const mongoose = require('mongoose');
const uri = "mongodb://localhost:27017/db_aceh";

console.log("Attempting to connect to:", uri);

mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 })
    .then(() => {
        console.log("SUCCESS: Connected to MongoDB!");
        return mongoose.connection.db.listCollections().toArray();
    })
    .then(cols => {
        console.log("Collections:", cols.map(c => c.name));
        process.exit(0);
    })
    .catch(err => {
        console.error("CONNECTION FAILED:", err.name, err.message);
        process.exit(1);
    });
