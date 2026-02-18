import mongoose from 'mongoose';
import Category from './src/models/Category';
import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

const categoriesToSeed = [
    { name: 'Software Development Request' },
    { name: 'Service Request' },
    { name: 'Knowledge Base Request' },
    { name: 'General Question' }
];

const seedCategories = async () => {
    try {
        console.log('Connecting to MongoDB...', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to MongoDB');

        for (const cat of categoriesToSeed) {
            const existing = await Category.findOne({ name: cat.name });
            if (!existing) {
                await Category.create(cat);
                console.log(`Created category: ${cat.name}`);
            } else {
                console.log(`Category exists: ${cat.name}`);
            }
        }

        const count = await Category.countDocuments();
        console.log(`Total categories in DB: ${count}`);

    } catch (error) {
        console.error('Error seeding categories:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Done');
    }
};

seedCategories();
