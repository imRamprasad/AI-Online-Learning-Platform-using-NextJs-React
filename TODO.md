# Fix Enrolled Courses Cards Data Not Updating

## Issues Identified
- EnrollCourseList.jsx incorrectly accesses joined data fields (treats course as direct object instead of {enrollCourseTable, coursesTable})
- CourseCard.jsx has similar issues in refreshProgress function
- No automatic refresh mechanism when returning to the page after progress updates

## Tasks
- [ ] Update EnrollCourseList.jsx to correctly access course.coursesTable and course.enrollCourseTable fields
- [ ] Fix calculateProgress function in EnrollCourseList.jsx
- [ ] Add window focus event listener to refresh enrolled courses data
- [ ] Update CourseCard.jsx refreshProgress to correctly access joined data fields
- [ ] Test enrollment and progress updates to verify data refreshes properly
