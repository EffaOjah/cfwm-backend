require('dotenv').config();
const { pool } = require('../config/database');
const { slugify } = require('../utils/slugify');

async function generateSlugs() {
    console.log('🚀 Starting devotional slug generation migration...\n');

    let connection;
    try {
        connection = await pool.getConnection();

        // 1. Check if 'slug' column exists in apapro_devotionals
        console.log('Checking database schema...');
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'apapro_devotionals' 
              AND COLUMN_NAME = 'slug'
        `);

        if (columns.length === 0) {
            console.log('Adding missing `slug` column to `apapro_devotionals` table...');
            await connection.query(`
                ALTER TABLE apapro_devotionals 
                ADD COLUMN slug VARCHAR(255) NULL AFTER title
            `);
            console.log('✅ Added `slug` column.');
        } else {
            console.log('✅ `slug` column already exists.');
        }

        // 2. Fetch all devotionals
        const [devotionals] = await connection.query(`
            SELECT id, title, DATE_FORMAT(date, '%Y-%m-%d') as date, slug 
            FROM apapro_devotionals 
            ORDER BY date ASC
        `);

        console.log(`Found ${devotionals.length} total devotionals.\n`);

        const usedSlugs = new Set();

        // First pass: register already existing non-empty slugs to avoid collisions
        for (const dev of devotionals) {
            if (dev.slug && dev.slug.trim()) {
                usedSlugs.add(dev.slug.trim());
            }
        }

        let updatedCount = 0;
        let skippedCount = 0;

        // Second pass: generate slugs for devotionals that don't have one
        for (const dev of devotionals) {
            if (dev.slug && dev.slug.trim()) {
                console.log(`ℹ️ [Skipped] "${dev.title}" (${dev.date}) already has slug: ${dev.slug}`);
                skippedCount++;
                continue;
            }

            let baseSlug = slugify(dev.title);
            if (!baseSlug) {
                baseSlug = `devotional-${dev.date || 'entry'}`;
            }

            let candidateSlug = baseSlug;
            let counter = 1;

            while (usedSlugs.has(candidateSlug)) {
                candidateSlug = `${baseSlug}-${counter}`;
                counter++;
            }

            // Assign candidate slug
            usedSlugs.add(candidateSlug);

            await connection.query(
                `UPDATE apapro_devotionals SET slug = ? WHERE id = ?`,
                [candidateSlug, dev.id]
            );

            console.log(`✅ [Updated] "${dev.title}" (${dev.date}) ➔ ${candidateSlug}`);
            updatedCount++;
        }

        // 3. Ensure UNIQUE index on slug
        console.log('\nEnsuring unique index on `slug` column...');
        const [indexes] = await connection.query(`
            SELECT INDEX_NAME 
            FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'apapro_devotionals' 
              AND INDEX_NAME = 'unique_apapro_slug'
        `);

        if (indexes.length === 0) {
            await connection.query(`
                ALTER TABLE apapro_devotionals 
                ADD UNIQUE KEY unique_apapro_slug (slug)
            `);
            console.log('✅ Added unique index `unique_apapro_slug`.');
        } else {
            console.log('✅ Unique index `unique_apapro_slug` already in place.');
        }

        console.log('\n=============================================');
        console.log(`🎉 Migration complete!`);
        console.log(`   Updated: ${updatedCount} devotional(s)`);
        console.log(`   Skipped: ${skippedCount} devotional(s) (already had slugs)`);
        console.log('=============================================\n');

    } catch (error) {
        console.error('❌ Error during devotional slug generation:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\nTip: Make sure DB credentials in cfwm-backend/.env match your MySQL database.');
        }
        process.exit(1);
    } finally {
        if (connection) connection.release();
        await pool.end();
        process.exit(0);
    }
}

generateSlugs();
