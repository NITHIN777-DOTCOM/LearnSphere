import { prisma } from '../prisma/client.js';

async function verify() {
  console.log('--- Verifying Database Tables via Prisma ---');
  
  const models = [
    { name: 'User', query: () => prisma.user.findMany({ take: 1 }) },
    { name: 'Profile', query: () => prisma.profile.findMany({ take: 1 }) },
    { name: 'Course', query: () => prisma.course.findMany({ take: 1 }) },
    { name: 'Enrollment', query: () => prisma.enrollment.findMany({ take: 1 }) },
    { name: 'Lesson', query: () => prisma.lesson.findMany({ take: 1 }) },
    { name: 'Assignment', query: () => prisma.assignment.findMany({ take: 1 }) },
    { name: 'Quiz', query: () => prisma.quiz.findMany({ take: 1 }) },
    { name: 'Progress', query: () => prisma.progress.findMany({ take: 1 }) },
  ];

  let successCount = 0;
  
  for (const model of models) {
    try {
      await model.query();
      console.log(`✅ Model '${model.name}' table is verified and accessible.`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ Model '${model.name}' failed verification:`, error.message);
    }
  }

  console.log(`\nDatabase verification complete: ${successCount}/${models.length} tables verified.`);
  
  await prisma.$disconnect();
  process.exit(successCount === models.length ? 0 : 1);
}

verify().catch((err) => {
  console.error('Unhandled verification error:', err);
  process.exit(1);
});
