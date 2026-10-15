import dotenv from 'dotenv';
import path from 'path';

// Load the single project-wide env file in both source and compiled layouts.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
