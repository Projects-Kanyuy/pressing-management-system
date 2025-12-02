require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('./models/Plan');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/press-directory';
        if (!mongoURI) {
            console.error('❌ MONGODB_URI is not set in environment variables');
            console.error('Please set MONGODB_URI in your .env file');
            process.exit(1);
        }
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('\n💡 Solutions:');
        console.error('1. Make sure MongoDB is running: brew services start mongodb-community');
        console.error('2. Or install MongoDB: brew install mongodb-community');
        console.error('3. Or use MongoDB Atlas (cloud): Update MONGODB_URI in .env');
        console.error('4. Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo');
        process.exit(1);
    }
};

const seedPlans = async () => {
    try {
        await connectDB();

        const isDestroy = process.argv.includes('-d');

        if (isDestroy) {
            await Plan.deleteMany({});
            console.log('All plans deleted');
            process.exit(0);
        }

        const plans = [
            {
                name: 'Trial',
                description: 'Free trial plan for new users',
                prices: [
                    { currency: 'USD', amount: 0 },
                    { currency: 'EUR', amount: 0 },
                    { currency: 'FCFA', amount: 0 },
                ],
                features: ['Basic features', 'Limited support'],
                isActive: true,
            },
            {
                name: 'Basic',
                description: 'Basic plan for small businesses',
                prices: [
                    { currency: 'USD', amount: 29.99 },
                    { currency: 'EUR', amount: 24.99 },
                    { currency: 'FCFA', amount: 18000 },
                ],
                features: ['All basic features', 'Email support', 'Monthly reports'],
                isActive: true,
            },
            {
                name: 'Pro',
                description: 'Professional plan for growing businesses',
                prices: [
                    { currency: 'USD', amount: 79.99 },
                    { currency: 'EUR', amount: 69.99 },
                    { currency: 'FCFA', amount: 48000 },
                ],
                features: ['All features', 'Priority support', 'Advanced analytics', 'Custom integrations'],
                isActive: true,
            },
        ];

        for (const planData of plans) {
            const existingPlan = await Plan.findOne({ name: planData.name });
            if (existingPlan) {
                console.log(`Plan ${planData.name} already exists, skipping...`);
                continue;
            }

            const plan = new Plan(planData);
            await plan.save();
            console.log(`Plan ${planData.name} created successfully`);
        }

        console.log('Plans seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding plans:', error);
        process.exit(1);
    }
};

seedPlans();


