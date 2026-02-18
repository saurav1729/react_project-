import mongoose from 'mongoose';
import Category from './src/models/Category';
import dotenv from 'dotenv';

dotenv.config();

const checkCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        const categories = await Category.find({});
        console.log('Found categories:', categories.length);
        console.log(JSON.stringify(categories, null, 2));

        if (categories.length === 0) {
            console.log('No categories found! You might need to seed the database.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkCategories();
