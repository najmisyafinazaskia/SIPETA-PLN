
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Location = require('./models/Location');

        const stats = await Location.aggregate([
            {
                $group: {
                    _id: null,
                    totalDesa: { $sum: 1 },
                    totalDusun: {
                        $sum: {
                            $size: {
                                $filter: {
                                    input: { $ifNull: ["$dusun_detail", []] },
                                    as: "d",
                                    cond: {
                                        $and: [
                                            { $ne: ["$$d.status", "REFF!"] },
                                            { $ne: ["$$d.nama", "REFF!"] },
                                            { $ne: ["$$d.status", "#REF!"] }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        console.log("Stats from DB:", stats[0]);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
