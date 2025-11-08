
#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });

(async () => {
  const courseId = 'f07fbe4a-e530-48fe-8961-8b8ed24f09a2';
  const courseData = {
    "course": {
      "name": "Introduction to Java Programming",
      "description": "A comprehensive course for beginners to learn the fundamentals of Java programming, from basic syntax to object-oriented principles.",
      "category": "Programming",
      "level": "Beginner",
      "includeVideo": true,
      "noOfChapters": 6,
      "bannerImagePrompt": "Create a modern, flat-style 2D digital illustration representing Java programming. Include UI/UX elements such as mockup screens, text blocks, icons, buttons, and creative workspace tools. Add symbolic elements related to Java, like the coffee cup logo, code snippets, and class diagrams. Use a vibrant color palette (blues, purples, oranges) with a clean, professional look. The illustration should feel creative, tech-savvy, and educational, ideal for visualizing concepts in a Java course.",
      "chapters": [
        { "chapterName": "Getting Started with Java", "duration": "1.5 Hours", "topics": ["What is Java?", "Setting up the Java Development Kit (JDK)", "Your First Java Program: Hello World", "Understanding the Java Virtual Machine (JVM)"] },
        { "chapterName": "Basic Syntax and Data Types", "duration": "2 Hours", "topics": ["Variables and Primitive Data Types", "Operators (Arithmetic, Relational, Logical)", "Strings and String Manipulation", "Type Casting"] },
        { "chapterName": "Control Flow Statements", "duration": "2.5 Hours", "topics": ["Conditional Statements (if, else, switch)", "Looping Statements (for, while, do-while)", "Branching Statements (break, continue)", "User Input with the Scanner Class"] },
        { "chapterName": "Methods and Arrays", "duration": "2 Hours", "topics": ["Defining and Calling Methods", "Method Parameters and Return Values", "Introduction to Arrays", "Iterating Through Arrays"] },
        { "chapterName": "Introduction to Object-Oriented Programming (OOP)", "duration": "3 Hours", "topics": ["Classes and Objects", "Constructors", "Encapsulation (Getters and Setters)", "The 'this' Keyword"] },
        { "chapterName": "Core OOP Concepts", "duration": "3.5 Hours", "topics": ["Inheritance", "Polymorphism", "Abstraction (Abstract Classes and Interfaces)", "Introduction to Packages"] }
      ]
    }
  };

  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      console.error('ERROR: DATABASE_URL not set. Make sure .env.local file is configured.');
      process.exit(1);
    }
    const { neon } = await import('@neondatabase/serverless');
    const client = neon(DATABASE_URL);

    console.log(`Updating course with ID: ${courseId}...`);

    const updateSql = `UPDATE public.courses SET "courseJson" = $1 WHERE "cid" = $2 RETURNING "cid", "name", "updatedAt";`;
    const values = [JSON.stringify(courseData), courseId];
    
    const res = await client.query(updateSql, values);
    
    const row = Array.isArray(res) ? res[0] : (res?.rows?.[0] || null);

    if (row) {
      console.log('✅ Successfully updated course:');
      console.log(row);
    } else {
      console.warn('⚠️ Course not found or not updated. No rows returned.');
    }

    if (typeof client.end === 'function') await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Update script failed:', err);
    process.exit(2);
  }
})();
