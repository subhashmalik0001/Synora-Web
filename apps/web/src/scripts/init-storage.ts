import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initStorage() {
    console.log('Initializing Storage...');
    
    const { data, error } = await supabase.storage.createBucket('medical-records', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
    });

    if (error) {
        if (error.message.includes('already exists')) {
            console.log('Bucket "medical-records" already exists.');
        } else {
            console.error('Error creating bucket:', error);
            process.exit(1);
        }
    } else {
        console.log('Bucket "medical-records" created successfully.');
    }

    console.log('Storage initialization complete.');
}

initStorage().catch(console.error);
