const { createCertificateForCompletedTest } = require('./modules/Labs/labs.service');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function testCertificateGeneration() {
  try {
    console.log('🧪 Testing new PDF certificate generation...');
    
    // Get a completed test
    const test = await prisma.labTest.findFirst({
      where: { status: 'COMPLETED' },
      orderBy: { completionDate: 'desc' }
    });
    
    if (!test) {
      console.log('❌ No completed test found');
      return;
    }
    
    console.log(`📋 Found test: ${test.testId}`);
    console.log(`📝 Sample: ${test.sampleName}`);
    console.log(`🔬 Test type: ${test.testType}`);
    
    // Ensure test has results
    if (!test.results) {
      console.log('➕ Adding sample results...');
      await prisma.labTest.update({
        where: { testId: test.testId },
        data: {
          results: {
            totalPlateCount: '< 1000 CFU/g',
            yeastMold: '< 100 CFU/g',
            salmonella: 'Absent/25g',
            ecoli: 'Absent/g',
            staphylococcus: 'Absent/g'
          }
        }
      });
      
      // Refetch the updated test
      const updatedTest = await prisma.labTest.findUnique({
        where: { testId: test.testId }
      });
      
      console.log('📊 Results added:', updatedTest.results);
      
      // Generate certificate
      console.log('📄 Generating certificate...');
      const certificate = await createCertificateForCompletedTest(updatedTest);
      
      console.log(`✅ Certificate created: ${certificate.certificateId}`);
      
      // Check if PDF was created
      const certificatesDir = path.join(__dirname, 'uploads', 'certificates');
      const files = fs.readdirSync(certificatesDir);
      const newCertFile = files.find(file => file.includes(certificate.certificateId));
      
      if (newCertFile) {
        const filePath = path.join(certificatesDir, newCertFile);
        const stats = fs.statSync(filePath);
        console.log(`📁 PDF file: ${newCertFile}`);
        console.log(`📏 File size: ${stats.size} bytes`);
        
        if (stats.size > 5000) {
          console.log('🎉 SUCCESS: Proper PDF generated!');
        } else {
          console.log('⚠️  WARNING: File seems too small for a proper PDF');
        }
      } else {
        console.log('❌ ERROR: Certificate file not found');
      }
    } else {
      console.log('📊 Test already has results:', test.results);
      
      // Generate certificate
      const certificate = await createCertificateForCompletedTest(test);
      console.log(`✅ Certificate created: ${certificate.certificateId}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testCertificateGeneration();