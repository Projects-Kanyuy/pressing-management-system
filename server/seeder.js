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
            { currency: 'ZWL', amount: 0 },   // Zimbabwe
            { currency: 'PHP', amount: 110 }, // Philippines
        ],
        features: [
            'Register and manage your clients manually',
            'Generate receipts for every transaction',
            '1 user account',
            'Works on Android & Laptop',
            'Includes a 1-month free trial'
        ],
        limits: {
            maxStaff: 1, // Only the owner
            // No hard order limit for simplicity, can be enforced in code if needed
        },
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Starter',
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
            { currency: 'ZWL', amount: 0 },   // Zimbabwe
             // Asia
            { currency: 'PHP', amount: 560 }, // Philippines
        ],
        features: [
            'Get local traffic',
            'Home pickups & deliveries with tracking',
            'In-app messaging with clients',
            'Bulk SMS & email promotions',
            'Up to 2 worker accounts',
            'Real-time activity tracking',
            'Daily, weekly, monthly sales reports',
            'Automated customer retention tools'
        ],
        limits: {
            maxStaff: 2,
        },
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Growth',
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
            { currency: 'ZWL', amount: 0 },   // Zimbabwe
             // Asia
            { currency: 'PHP', amount: 1400 }, // Philippines
        ],
        features: [
            'Everything in Starter Plan',
            '3x more customer traffic',
            'Priority directory listing',
            'Up to 5 worker accounts',
            'Advanced analytics dashboard',
            'Automated client reminders'
        ],
        limits: {
            maxStaff: 5,
        },
        isActive: true,
        isFeatured: true, // This is the most popular plan
    },
    {
        name: 'Pro',
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
            { currency: 'ZWL', amount: 0 },   // Zimbabwe
            // Asia
            { currency: 'PHP', amount: 2800 }, // Philippines
        ],
        features: [
            'Everything in Growth Plan',
            '6x more customer traffic & premium placement',
            'Up to 15 worker accounts',
            'Detailed activity tracking to prevent fraud',
            'One-click access to all sales reports',
            'Dedicated priority support'
        ],
        limits: {
            maxStaff: 15,
        },
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