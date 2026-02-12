const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const users = [
    { name: "Admin UP2K 01", username: "sipeta_up2k_01", password: "SipetaUp2k#01!", unit: "UP2K", role: "superadmin" },
    { name: "Admin UP2K 02", username: "sipeta_up2k_02", password: "SipetaUp2k#02!", unit: "UP2K", role: "superadmin" },
    { name: "Admin UP3 Banda Aceh", username: "sipeta_up3_bna", password: "SipetaBNA#26!", unit: "Banda Aceh", role: "admin" },
    { name: "Admin UP3 Langsa", username: "sipeta_up3_lgs", password: "SipetaLGS#26!", unit: "Langsa", role: "admin" },
    { name: "Admin UP3 Sigli", username: "sipeta_up3_sgi", password: "SipetaSGI#26!", unit: "Sigli", role: "admin" },
    { name: "Admin UP3 Lhokseumawe", username: "sipeta_up3_lsm", password: "SipetaLSM#26!", unit: "Lhokseumawe", role: "admin" },
    { name: "Admin UP3 Meulaboh", username: "sipeta_up3_mbo", password: "SipetaMBO#26!", unit: "Meulaboh", role: "admin" },
    { name: "Admin UP3 Subulussalam", username: "sipeta_up3_sbl", password: "SipetaSBL#26!", unit: "Subulussalam", role: "admin" }
];

const seedDB = async () => {
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 60000,
            connectTimeoutMS: 60000,
        });
        console.log("✅ Connected to MongoDB!");

        // Drop existing email index to avoid unique constraint issues with nulls if not sparse
        try {
            console.log("Checking indexes...");
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
                // Update existing user's role, name, and password
                const hashedPassword = await bcrypt.hash(u.password, 10);
                existingUser.password = hashedPassword;
                existingUser.role = u.role;
                existingUser.name = u.name;
                existingUser.unit = u.unit;
                existingUser.isVerified = true; // Ensure they can login
                await existingUser.save();
                console.log(`✅ User ${u.username} updated & verified.`);
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
