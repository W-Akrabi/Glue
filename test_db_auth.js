const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
    try {
        console.log('🧪 Testing database authentication...');
        
        // Get admin user
        const user = await prisma.user.findUnique({
            where: { email: 'admin@acme.com' },
            include: { organization: true }
        });
        
        if (!user) {
            console.log('❌ Admin user not found');
            return false;
        }
        
        console.log(`✅ Found user: ${user.email} (Role: ${user.role})`);
        console.log(`   Organization: ${user.organization.name}`);
        
        // Test password comparison
        const passwordMatch = await bcrypt.compare('password123', user.password);
        console.log(`✅ Password match: ${passwordMatch}`);
        
        // Get task count  
        const taskCount = await prisma.task.count({
            where: { organizationId: user.organizationId }
        });
        console.log(`✅ Tasks in org: ${taskCount}`);
        
        return passwordMatch;
        
    } catch (error) {
        console.error('❌ Database test error:', error);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

testAuth().then(success => {
    process.exit(success ? 0 : 1);
});