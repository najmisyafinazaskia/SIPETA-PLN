const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const users = [
    { name: "Admin UP2K 01", username: "sipeda_up2k_01", password: "SipedaUp2k#01!", unit: "UP2K" },
    { name: "Admin UP2K 02", username: "sipeda_up2k_02", password: "SipedaUp2k#02!", unit: "UP2K" },
    { name: "Admin UP3 Banda Aceh", username: "sipeda_up3_bna", password: "SipedaBNA#26!", unit: "Banda Aceh" },
    { name: "Admin UP3 Langsa", username: "sipeda_up3_lgs", password: "SipedaLGS#26!", unit: "Langsa" },
    { name: "Admin UP3 Sigli", username: "sipeda_up3_sgi", password: "SipedaSGI#26!", unit: "Sigli" },
    { name: "Admin UP3 Lhokseumawe", username: "sipeda_up3_lsm", password: "SipedaLSM#26!", unit: "Lhokseumawe" },
    { name: "Admin UP3 Meulaboh", username: "sipeda_up3_mbo", password: "SipedaMBO#26!", unit: "Meulaboh" },
    { name: "Admin UP3 Subulussalam", username: "sipeda_up3_sbl", password: "SipedaSBL#26!", unit: "Subulussalam" }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        // Drop existing email index to avoid unique constraint issues with nulls if not sparse
        try {
            await User.collection.dropIndex('email_1');
            console.log("Dropped email index.");
        } catch (e) {
            console.log("Email index not found or already dropped.");
        }

        for (let u of users) {
            const existingUser = await User.findOne({ username: u.username });
            if (!existingUser) {
                const hashedPassword = await bcrypt.hash(u.password, 10);
                await User.create({
                    ...u,
                    password: hashedPassword,
                    isVerified: true
                });
                console.log(`User ${u.username} created.`);
            } else {
                console.log(`User ${u.username} already exists.`);
            }
        }

        console.log("Seeding completed!");
        process.exit();
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDB();
