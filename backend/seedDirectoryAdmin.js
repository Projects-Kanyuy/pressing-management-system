// backend/seedDirectoryAdmin.js

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import DirectoryAdmin from './models/DirectoryAdmin.js'; // Ensure this path and filename are correct

// Load environment variables from your .env file
dotenv.config();


const importAdmin = async () => {
    try {
        await connectDB();

        // 1. Clear existing directory admins
        await DirectoryAdmin.deleteMany();
        console.log('✅ Previous Directory Admins cleared.');

        // 2. Check for required .env variables
        // --- We will use ADMIN_EMAIL as the username for consistency ---
        const adminUsername = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminUsername || !adminPassword) {
            console.error('❌ ERROR: ADMIN_EMAIL and ADMIN_PASSWORD must be set in your .env file.');
            process.exit(1);
        }

        // --- 3. THIS IS THE FIX ---
        // Create the new admin user object with the correct fields: 'username' and 'password'.
        const adminData = {
            username: adminUsername,
            password: adminPassword,
        };

        // 4. Use Model.create() to trigger the 'pre-save' hook for hashing
        const createdAdmin = await DirectoryAdmin.create(adminData);

        // 5. Log the correct property: createdAdmin.username
        console.log(`✅ Directory Admin '${createdAdmin.username}' created successfully.`);
        console.log('You can now log in with the credentials from your .env file.');
        process.exit();

    } catch (error) {
        console.error('❌ ERROR seeding directory admin:', error);
        process.exit(1);
    }
};


const destroyAdmin = async () => {
    try {
        await connectDB();
        await DirectoryAdmin.deleteMany();
        console.log('✅ Directory Admin user(s) successfully destroyed!');
        process.exit();
    } catch (error) {
        console.error('❌ ERROR destroying directory admin data:', error);
        process.exit(1);
    }
};

// Command line argument logic
if (process.argv[2] === '-d') {
    destroyAdmin();
} else {
    importAdmin();
}