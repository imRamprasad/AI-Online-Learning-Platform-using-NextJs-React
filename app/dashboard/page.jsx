import React from 'react'
import WelcomeBanner from '../workspace/_components/WelcomeBanner';
import CourseList from '../workspace/_components/CourseList';
import EnrollCourseList from '../workspace/_components/EnrollCourseList';

function Dashboard() {
  return (
    <div>
      <WelcomeBanner/>
      <EnrollCourseList/>
      <CourseList/>
    </div>
  )
}

export default Dashboard;
