require('dotenv').config();
const mongoose = require('mongoose');
const DirectoryAdmin = require('./models/DirectoryAdmin');

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

const seedDirectoryAdmin = async () => {
    try {
        await connectDB();

        const isDestroy = process.argv.includes('-d');

        if (isDestroy) {
            await DirectoryAdmin.deleteMany({});
            console.log('All directory admins deleted');
            process.exit(0);
        }

        const defaultAdmin = {
            username: process.env.DIRECTORY_ADMIN_USERNAME || 'admin',
            password: process.env.DIRECTORY_ADMIN_PASSWORD || 'admin123',
            email: process.env.DIRECTORY_ADMIN_EMAIL || 'admin@pressmark.com',
            isActive: true,
        };

        const existingAdmin = await DirectoryAdmin.findOne({ username: defaultAdmin.username });

        if (existingAdmin) {
            console.log('Directory admin already exists');
            process.exit(0);
        }

        const admin = new DirectoryAdmin(defaultAdmin);
        await admin.save();

        console.log('Directory admin created successfully:');
        console.log(`Username: ${defaultAdmin.username}`);
        console.log(`Password: ${defaultAdmin.password}`);
        console.log(`Email: ${defaultAdmin.email}`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding directory admin:', error);
        process.exit(1);
    }
};

seedDirectoryAdmin();


