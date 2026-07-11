import { PrismaClient, Role, Difficulty, LessonType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.progress.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding users...');
  const saltRounds = 10;

  // Exact passwords requested by user
  const adminPassword = await bcrypt.hash('Admin@123', saltRounds);
  const instructorPassword = await bcrypt.hash('Instructor@123', saltRounds);
  const studentPassword = await bcrypt.hash('Student@123', saltRounds);
  const defaultPassword = await bcrypt.hash('Password123', saltRounds);

  // 1 Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@learnsphere.com',
      password: adminPassword,
      role: Role.ADMIN,
      profile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Jenkins',
          biography: 'SaaS Platform Administrator & Support Specialist.',
        },
      },
    },
  });

  // 2 Instructors
  const instructor1 = await prisma.user.create({
    data: {
      email: 'instructor@learnsphere.com',
      password: instructorPassword,
      role: Role.INSTRUCTOR,
      profile: {
        create: {
          firstName: 'Alex',
          lastName: 'Rivera',
          biography: 'Senior Software Engineer with 10+ years of full-stack dev experience.',
        },
      },
    },
  });

  const _instructor2 = await prisma.user.create({
    data: {
      email: 'helen@learnsphere.com',
      password: defaultPassword,
      role: Role.INSTRUCTOR,
      profile: {
        create: {
          firstName: 'Helen',
          lastName: 'Chen',
          biography: 'AI Researcher and Data Science Consultant.',
        },
      },
    },
  });

  // 5 Students
  const students = [];
  const names = [
    { first: 'David', last: 'Miller', email: 'student@learnsphere.com', pass: studentPassword },
    { first: 'Emily', last: 'Watson', email: 'student2@learnsphere.com', pass: defaultPassword },
    { first: 'Marcus', last: 'Aurelius', email: 'student3@learnsphere.com', pass: defaultPassword },
    { first: 'Sophia', last: 'Loren', email: 'student4@learnsphere.com', pass: defaultPassword },
    { first: 'Julian', last: 'Casablancas', email: 'student5@learnsphere.com', pass: defaultPassword },
  ];

  for (let i = 0; i < 5; i++) {
    const student = await prisma.user.create({
      data: {
        email: names[i].email,
        password: names[i].pass,
        role: Role.STUDENT,
        profile: {
          create: {
            firstName: names[i].first,
            lastName: names[i].last,
            biography: `Avid learner studying courses on LearnSphere.`,
          },
        },
      },
    });
    students.push(student);
  }

  console.log('Seeding courses...');
  const coursesData = [
    {
      title: 'Full Stack Web Development',
      description: 'Master HTML, CSS, JavaScript, Node.js, Express, and React to build production-grade web applications.',
      category: 'Development',
      difficulty: Difficulty.BEGINNER,
      duration: 360,
      tags: ['webdev', 'javascript', 'react', 'nodejs'],
      learningOutcomes: [
        'Build responsive websites using CSS and HTML5.',
        'Understand server-side logic and database integration.',
        'Build and deploy stateful React single page apps.',
      ],
      instructorId: instructor1.id,
    },
    {
      title: 'Data Structures & Algorithms',
      description: 'An in-depth look at arrays, lists, trees, graphs, sorting, searching, and complexity analysis.',
      category: 'Development',
      difficulty: Difficulty.INTERMEDIATE,
      duration: 480,
      tags: ['algorithms', 'dsa', 'cs', 'interview'],
      learningOutcomes: [
        'Analyze temporal complexity using Big O notation.',
        'Implement tree and graph traversal algorithms.',
        'Master common whiteboard coding questions.',
      ],
      instructorId: instructor1.id,
    },
    {
      title: 'Machine Learning Fundamentals',
      description: 'Build predictive regression, classification models, clustering algorithms, and neural networks using python libraries.',
      category: 'Development',
      difficulty: Difficulty.ADVANCED,
      duration: 600,
      tags: ['ai', 'ml', 'python', 'datascience'],
      learningOutcomes: [
        'Implement linear regression and neural networks.',
        'Validate models with appropriate accuracy metrics.',
        'Clean and visualize raw datasets.',
      ],
      instructorId: instructor1.id,
    },
    {
      title: 'Cloud Computing',
      description: 'Learn cloud architectural concepts, deployments, cloud security, and manage AWS/Azure solutions.',
      category: 'General',
      difficulty: Difficulty.BEGINNER,
      duration: 240,
      tags: ['cloud', 'aws', 'devops', 'sysops'],
      learningOutcomes: [
        'Architect highly available systems.',
        'Configure serverless logic solutions.',
        'Understand cloud security compliance guidelines.',
      ],
      instructorId: instructor1.id,
    },
    {
      title: 'DevOps Engineering',
      description: 'Accelerate cycles with Continuous Integration / Deployment (CI/CD), Docker containers, and Kubernetes pods.',
      category: 'Development',
      difficulty: Difficulty.ADVANCED,
      duration: 300,
      tags: ['devops', 'docker', 'kubernetes', 'cicd'],
      learningOutcomes: [
        'Build automation pipelines using GitHub Actions.',
        'Deploy applications containerized under Docker.',
        'Monitor platform performance logs.',
      ],
      instructorId: instructor1.id,
    },
    {
      title: 'Database Systems',
      description: 'Cover SQL schemas, transactional controls, index optimization, and explore non-relational database stores.',
      category: 'Development',
      difficulty: Difficulty.INTERMEDIATE,
      duration: 320,
      tags: ['databases', 'sql', 'postgresql', 'nosql'],
      learningOutcomes: [
        'Formulate complex relational queries and joins.',
        'Design ACID compliant transactional workflows.',
        'Structure database index strategies.',
      ],
      instructorId: instructor1.id,
    },
    {
      title: 'UI/UX Design',
      description: 'Master prototype layouts, user stories, interaction animations, and interface design using Figma.',
      category: 'Design',
      difficulty: Difficulty.BEGINNER,
      duration: 200,
      tags: ['design', 'figma', 'uiux', 'wireframe'],
      learningOutcomes: [
        'Create interactive high-fidelity prototypes.',
        'Conduct qualitative user testing.',
        'Select typography and layout grids.',
      ],
      instructorId: instructor1.id,
    },
    {
      title: 'Cybersecurity',
      description: 'Understand vulnerability penetration testing, encryption schemes, network safety, and access key policies.',
      category: 'General',
      difficulty: Difficulty.ADVANCED,
      duration: 400,
      tags: ['security', 'hacking', 'crypto', 'network'],
      learningOutcomes: [
        'Audit web apps for injection flaws.',
        'Configure secure network socket tunnels.',
        'Set symmetric and asymmetric keys.',
      ],
      instructorId: instructor1.id,
    },
    {
      title: 'Python Programming',
      description: 'A friendly starter course on core scripts, file modules, lists, dictionaries, and functional classes.',
      category: 'Development',
      difficulty: Difficulty.BEGINNER,
      duration: 180,
      tags: ['python', 'programming', 'basics', 'scripts'],
      learningOutcomes: [
        'Write clean functional and object oriented scripts.',
        'Import external library utilities.',
        'Read and modify local files.',
      ],
      instructorId: instructor1.id,
    },
    {
      title: 'Java Programming',
      description: 'Deep dive into Object Oriented Programming (OOP), compile errors, class interfaces, and memory models.',
      category: 'Development',
      difficulty: Difficulty.BEGINNER,
      duration: 220,
      tags: ['java', 'oop', 'backend', 'desktop'],
      learningOutcomes: [
        'Implement polymorphism and inheritance schemes.',
        'Handle runtime exceptions properly.',
        'Optimize multi-threaded routines.',
      ],
      instructorId: instructor1.id,
    },
  ];

  for (const cData of coursesData) {
    const course = await prisma.course.create({
      data: {
        title: cData.title,
        description: cData.description,
        category: cData.category,
        difficulty: cData.difficulty,
        duration: cData.duration,
        tags: cData.tags,
        learningOutcomes: cData.learningOutcomes,
        status: 'PUBLISHED',
        instructorId: cData.instructorId,
      },
    });

    // Seed 6 Lessons for each course
    for (let j = 0; j < 6; j++) {
      const type = j % 3 === 0 ? LessonType.TEXT : j % 3 === 1 ? LessonType.VIDEO : LessonType.PDF;
      await prisma.lesson.create({
        data: {
          title: `Lesson ${j + 1}: Foundations of ${cData.title.split(' ')[0]}`,
          description: `A core lecture detailing essential mechanisms and modules.`,
          content: type === LessonType.TEXT 
            ? `## Overview\nThis lecture introduces the core models of ${cData.title}.\n\n### Core Topics\n- Introduction to parameters\n- Setting up local development runtimes\n- Architectural patterns and conventions.\n\n### Summary\nEnsure you complete the quiz and submit your homework before the deadline.`
            : null,
          videoUrl: type === LessonType.VIDEO ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : null,
          pdfUrl: type === LessonType.PDF ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : null,
          duration: 15,
          order: j + 1,
          type,
          courseId: course.id,
        },
      });
    }

    // Seed Assignment
    const assignment = await prisma.assignment.create({
      data: {
        title: `Homework 1: Practical implementation`,
        description: `Implement the architectural models covered in the lectures. Upload your code or text summaries below.`,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days out
        courseId: course.id,
      },
    });

    // Seed Quiz
    const quiz = await prisma.quiz.create({
      data: {
        title: `Module Assessment Quiz`,
        passingScore: 60,
        questions: [
          {
            questionText: `What is the primary architectural concept of ${cData.title.split(' ')[0]}?`,
            options: [
              'Separation of concerns and speed.',
              'Coupled parameters.',
              'Static file compilers.',
              'External dependencies.',
            ],
            correctAnswerIndex: 0,
          },
          {
            questionText: 'Which keyword represents the optimal performance pattern?',
            options: ['Asynchronous loops', 'Synchronous checks', 'Polymorphic arrays', 'Constant complexity'],
            correctAnswerIndex: 3,
          },
        ] as any,
        courseId: course.id,
      },
    });

    // Enroll students in courses (each student enrolled in 3 random courses)
    for (const student of students) {
      if (Math.random() > 0.4) {
        const enrollment = await prisma.enrollment.create({
          data: {
            studentId: student.id,
            courseId: course.id,
            progress: 33, // complete 2 lessons
          },
        });

        // Fetch course lessons to get IDs
        const lessons = await prisma.lesson.findMany({ where: { courseId: course.id } });
        
        // Complete 2 lessons
        await prisma.progress.create({
          data: {
            userId: student.id,
            lessonId: lessons[0].id,
            completed: true,
          },
        });
        await prisma.progress.create({
          data: {
            userId: student.id,
            lessonId: lessons[1].id,
            completed: true,
          },
        });

        // Submit Assignment
        await prisma.assignmentSubmission.create({
          data: {
            assignmentId: assignment.id,
            studentId: student.id,
            content: `I implemented the requested structures under GitHub repo: https://github.com/student/learnsphere-lab.\nThe code has been verified and run locally.`,
            status: 'SUBMITTED',
          },
        });

        // Attempt Quiz
        await prisma.quizAttempt.create({
          data: {
            quizId: quiz.id,
            studentId: student.id,
            score: 100,
            passed: true,
          },
        });
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
