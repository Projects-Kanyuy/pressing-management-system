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
        limits: { maxStaff: 1, maxOrdersPerMonth: 100 },
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Basic',
        prices: [
            // Major International
            { currency: 'USD', amount: 2 },
            { currency: 'EUR', amount: 1.85 },
            { currency: 'GBP', amount: 1.60 },
            { currency: 'CAD', amount: 2.70 },
            // CEMAC Zone (Central Africa)
            { currency: 'XAF', amount: 1200 },
            // UEMOA Zone (West Africa)
            { currency: 'XOF', amount: 1200 },
            // Other Key African Currencies
            { currency: 'NGN', amount: 1700 }, // Nigeria
            { currency: 'GHS', amount: 24 },  // Ghana
            { currency: 'KES', amount: 260 }, // Kenya
            { currency: 'ZAR', amount: 37 },  // South Africa
            { currency: 'ZWL', amount: 0 },   // Zimbabwe (Set to 0 or a high number, as it's volatile)
        ],
        features: [
            'Register and manage your clients manually',
            'Generate receipts for every transaction',
            'Only one user (you) can manage the platform',
            'Includes a 1-month free trial before billing starts',
            'Works on Android App and Laptop Installation'
        ],
        limits: { maxStaff: 1, maxOrdersPerMonth: 1000 },
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Starter',
        prices: [
            // Major International
            { currency: 'USD', amount: 10 },
            { currency: 'EUR', amount: 9.25 },
            { currency: 'GBP', amount: 8 },
            { currency: 'CAD', amount: 13.50 },
            // CEMAC Zone (Central Africa)
            { currency: 'XAF', amount: 6000 },
            // UEMOA Zone (West Africa)
            { currency: 'XOF', amount: 6000 },
            // Other Key African Currencies
            { currency: 'NGN', amount: 8500 }, // Nigeria
            { currency: 'GHS', amount: 120 },  // Ghana
            { currency: 'KES', amount: 1300 }, // Kenya
            { currency: 'ZAR', amount: 185 },  // South Africa
            { currency: 'ZWL', amount: 0 },
        ],
        features: [
            'Get local traffic — connect instantly with people nearby who need laundry services',
            'Offer home pickups and deliveries with client tracking',
            'Register and manage customers easily',
            'Communicate with clients directly through in-app messaging',
            'Send bulk SMS and bulk emails to promote offers or reminders',
            'Add up to 2 workers to help manage orders and deliveries',
            'Real-time accountability: track all activities so staff can\'t cheat',
            'View daily, weekly, or monthly sales in one click',
            'Predict returning customers and send them promotions automatically',
            'Works on both Android App and Laptop Installation for your office'
        ],
        limits: { maxStaff: 2, maxOrdersPerMonth: 5000 },
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Growth',
        prices: [
            // Major International
            { currency: 'USD', amount: 25 },
            { currency: 'EUR', amount: 23 },
            { currency: 'GBP', amount: 20 },
            { currency: 'CAD', amount: 34 },
            // CEMAC Zone (Central Africa)
            { currency: 'XAF', amount: 15000 },
            // UEMOA Zone (West Africa)
            { currency: 'XOF', amount: 15000 },
            // Other Key African Currencies
            { currency: 'NGN', amount: 21250 }, // Nigeria
            { currency: 'GHS', amount: 300 },  // Ghana
            { currency: 'KES', amount: 3250 }, // Kenya
            { currency: 'ZAR', amount: 462 },  // South Africa
            { currency: 'ZWL', amount: 0 },
        ],
        features: [
            'Everything in Starter Plan',
            '3× more customer traffic from your area',
            'Priority listing in the PressMark directory',
            'Add up to 5 workers, all managed under one account',
            'Advanced analytics and performance dashboard',
            'Automated reminders to clients for pickups and deliveries',
            'Full support for Android and Laptop access'
        ],
        limits: { maxStaff: 5, maxOrdersPerMonth: 15000 },
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Pro',
        prices: [
            // Major International
            { currency: 'USD', amount: 50 },
            { currency: 'EUR', amount: 46 },
            { currency: 'GBP', amount: 40 },
            { currency: 'CAD', amount: 68 },
            // CEMAC Zone (Central Africa)
            { currency: 'XAF', amount: 30000 },
            // UEMOA Zone (West Africa)
            { currency: 'XOF', amount: 30000 },
            // Other Key African Currencies
            { currency: 'NGN', amount: 42500 }, // Nigeria
            { currency: 'GHS', amount: 600 },  // Ghana
            { currency: 'KES', amount: 6500 }, // Kenya
            { currency: 'ZAR', amount: 925 },  // South Africa
            { currency: 'ZWL', amount: 0 },
        ],
        features: [
            'Everything in Starter and Growth Plans',
            '6× more customer traffic and premium directory placement',
            'Add up to 15 workers and monitor every transaction in real time',
            'Prevent staff cheating with detailed activity tracking',
            'One-click access to daily, weekly, and monthly sales reports',
            'Smart prediction of returning customers with auto-promotion tools',
            'Dedicated priority support line',
            'Full Android App + Laptop Installation access'
        ],
        limits: { maxStaff: 15, maxOrdersPerMonth: 1000000 },
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Enterprise',
        prices: [
            { currency: 'USD', amount: 0 }, // Represents "Contact Us"
        ],
        features: ['Everything in Pro', 'Unlimited Staff Accounts', 'Custom Branding', 'Advanced Analytics', 'Priority Support'],
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