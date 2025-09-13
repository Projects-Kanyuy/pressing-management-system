// server/seeder.js

import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import all necessary models
import DirectoryAdmin from './models/DirectoryAdmin.js';
import Tenant from './models/Tenant.js';
import Listing from './models/DirectoryListing.js';
import Plan from './models/Plan.js';
import Order from './models/Order.js';
import Customer from './models/Customer.js';
//import Service from './models/serviceModel.js';

// Import sample data if you have any (optional)
// import users from './data/users.js';
// import products from './data/products.js';

dotenv.config();
connectDB();

// --- DEFINE THE DEFAULT SUBSCRIPTION PLANS WITH REGIONAL PRICING ---
const defaultPlans = [
    {
        name: 'Trial',
        prices: [
            { currency: 'USD', amount: 0 },
        ],
        features: ['Up to 50 Orders', '1 Staff Account', 'Basic Features for 14 Days'],
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Basic',
        prices: [
            // Major International
            { currency: 'USD', amount: 29 },
            { currency: 'EUR', amount: 27 },
            { currency: 'GBP', amount: 23 },
            { currency: 'CAD', amount: 39 },
            // CEMAC Zone (Central Africa)
            { currency: 'XAF', amount: 18000 },
            // UEMOA Zone (West Africa)
            { currency: 'XOF', amount: 18000 },
            // Other Key African Currencies
            { currency: 'NGN', amount: 25000 }, // Nigeria
            { currency: 'GHS', amount: 350 },  // Ghana
            { currency: 'KES', amount: 3800 }, // Kenya
            { currency: 'ZAR', amount: 550 },  // South Africa
            { currency: 'ZWL', amount: 0 },   // Zimbabwe (Set to 0 or a high number, as it's volatile)
        ],
        features: [ 'Up to 250 Orders per month', '2 Staff Accounts', 'Customer Management', 'Payment Tracking', 'Email Notifications' ],
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Pro',
        prices: [
            // Major International
            { currency: 'USD', amount: 59 },
            { currency: 'EUR', amount: 55 },
            { currency: 'GBP', amount: 47 },
            { currency: 'CAD', amount: 79 },
            // CEMAC Zone (Central Africa)
            { currency: 'XAF', amount: 36000 },
             // UEMOA Zone (West Africa)
            { currency: 'XOF', amount: 36000 },
            // Other Key African Currencies
            { currency: 'NGN', amount: 50000 },
            { currency: 'GHS', amount: 700 },
            { currency: 'KES', amount: 7800 },
            { currency: 'ZAR', amount: 1100 },
            { currency: 'ZWL', amount: 0 },
        ],
        features: [ 'Unlimited Orders', 'Up to 10 Staff Accounts', 'Everything in Basic', 'SMS Notifications', 'Basic Sales Reports' ],
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Enterprise',
        prices: [
             { currency: 'USD', amount: 0 }, // Represents "Contact Us"
        ],
        features: [ 'Everything in Pro', 'Unlimited Staff Accounts', 'Custom Branding', 'Advanced Analytics', 'Priority Support' ],
        isActive: true,
        isFeatured: false,
    },
];


const importData = async () => {
    try {
        console.log('Starting data import...');
        
        // --- 1. Clear ALL existing data ---
        // This provides a clean slate for a fresh install.
        await Order.deleteMany();
        await Customer.deleteMany();
        //await Service.deleteMany();
        await Listing.deleteMany();
        await Tenant.deleteMany();
        await Plan.deleteMany();
        await DirectoryAdmin.deleteMany();
        
        console.log('✅ All previous collections cleared.');

        // --- 2. Create the Directory Admin User ---
        // Ensure your .env file has ADMIN_EMAIL and ADMIN_PASSWORD
        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be set in your .env file.');
            process.exit(1);
        }
        const adminUser = await DirectoryAdmin.create({
            username: 'Super Admin',
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
        });
        console.log(`✅ Directory Admin '${adminUser.name}' created.`);

        // --- 3. Insert the Default Subscription Plans ---
        await Plan.insertMany(defaultPlans);
        console.log(`✅ ${defaultPlans.length} default subscription plans have been imported.`);
        
        console.log('\nData import completed successfully!');
        process.exit();

    } catch (error) {
        console.error(`❌ Error during data import: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        console.log('Starting data destruction...');

        await Order.deleteMany();
        await Customer.deleteMany();
        //await Service.deleteMany();
        await Listing.deleteMany();
        await Tenant.deleteMany();
        await Plan.deleteMany();
        await DirectoryAdmin.deleteMany();

        console.log('✅ All data has been destroyed.');
        process.exit();
    } catch (error) {
        console.error(`❌ Error during data destruction: ${error}`);
        process.exit(1);
    }
};

// Command line argument logic to switch between import and destroy
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}