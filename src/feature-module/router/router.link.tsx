import { Navigate, Route } from "react-router";
import ComingSoon from "../auth/coming-soon/comingSoon";
import Error404 from "../auth/error/error-404/error400";
import Error500 from "../auth/error/error-500/error500";
import ForgortPassword from "../auth/forgot-password/forgortPassword";
import LockScreen from "../auth/lock-screen/lockScreen";
import Login from "../auth/login/login";
import Otp from "../auth/otp/otp";
import Register from "../auth/register/register";
import SetPassword from "../auth/set-password/setPassword";
import UnderConstruction from "../auth/underconstruction/underConstruction";
import BlogDetailsLeftSidebar from "../blog/blog-details/blogDetailsLeftSidebar";
import BlogDetailsRightSidebar from "../blog/blog-details/blogDetailsRightSidebar";
import BlogCarousal from "../blog/blog-layouts/blogCarousal";
import BlogGrid from "../blog/blog-layouts/blogGrid";
import BlogGrid2 from "../blog/blog-layouts/blogGrid2";
import BlogGrid3 from "../blog/blog-layouts/blogGrid3";
import BlogLeftSidebar from "../blog/blog-layouts/blogLeftSidebar";
import BlogMasonry from "../blog/blog-layouts/blogMasonry";
import BlogRightSidebar from "../blog/blog-layouts/blogRightSidebar";
import AddNewCourse from "../Courses/add-newCourse/addNewCourse";
import CourseCart from "../Courses/course-cart/courseCart";
import CourseCategoryThree from "../Courses/course-category-three/courseCategoryThree";
import CourseCheckout from "../Courses/course-checkout/courseCheckout";
import CourseDetailsTwo from "../Courses/course-details-2/courseDetailsTwo";
import CourseDetails from "../Courses/course-details/courseDetails";
import CourseResume from "../Courses/course-resume/courseResume";
import CourseWatch from "../Courses/course-watch/courseWatch";
import HomeOne from "../HomePages/home-one/homeone";
import InstructorAnnouncements from "../Instructor/instructor-announcements/instructorAnnouncements";
import InstructorAssignment from "../Instructor/instructor-assignment/instructorAssignment";
import InstructorCertificate from "../Instructor/instructor-certificate/instructorCertificate";
import InstructorCourse from "../Instructor/instructor-course/instructorCourse";
// import InstructorCourseGrid from "../Instructor/instructor-course/instructorCourseGrid";
import InstructorDashboard from "../Instructor/instructor-dashboard/instructorDashboard";
import InstructorEarning from "../Instructor/instructor-earning/instructorEarning";
import InstructorMessage from "../Instructor/instructor-message/instructorMessage";
import InstructorPayout from "../Instructor/instructor-payout/instructorPayout";
import InstructorProfile from "../Instructor/instructor-profile/instructorProfile";
import InstructorQuizResult from "../Instructor/instructor-quiz-result/instructorQuizResult";
import InstructorQuiz from "../Instructor/instructor-quiz/instructorQuiz";
import InstructorChangePassoword from "../Instructor/instructor-settings/instructor-change-password/instructorChangePassoword";
import InstructorIntegrations from "../Instructor/instructor-settings/instructor-integrations/instructorIntegrations";
import InstructorLinkedAccounts from "../Instructor/instructor-settings/instructor-linked-accounts/instructorLinkedAccounts";
import InstructorNotification from "../Instructor/instructor-settings/instructor-notification/instructorNotification";
import InstructorPlanSettings from "../Instructor/instructor-settings/instructor-plans-settings/instructorPlanSettings";
import InstructorSocialprofileSettings from "../Instructor/instructor-settings/instructor-socialprofile-settings/instructorSocialprofileSettings";
import InstructorWithdraw from "../Instructor/instructor-settings/instructor-withdraw/instructorWithdraw";
import InstructorStatement from "../Instructor/instructor-statement/instructorStatement";
import InstructorTickets from "../Instructor/instructor-tickets/instructorTickets";
import StudentGrid from "../Instructor/student-grid/studentGrid";
import StudentList from "../Instructor/student-list/studentList";
import AboutUs from "../Pages/about-us/aboutUs";
import BecomeInstructor from "../Pages/become-instructor/becomeInstructor";
import ContactUs from "../Pages/contact-us/contactUs";
import Faq from "../Pages/faq/faq";
import InstructorDetails from "../Pages/instructor/instructor-details/instructor-details";
import InstructorGrid from "../Pages/instructor/instructor-grid/instructorGrid";
import InstructorList from "../Pages/instructor/instructor-list/instructorList";
import Notification from "../Pages/notification/notification";
import PricePlanning from "../Pages/price-planning/pricePlanning";
import PrivacyPolicy from "../Pages/privacy-policy/privacyPolicy";
import TermsCondition from "../Pages/terms-condition/termsCondition";
import Testimonials from "../Pages/testimonials/testimonials";
import StudentDashboard from "../student/dashboard/studentDashboard";
import { all_routes } from "./all_routes";

import BlogDetails from "../blog/blog-details/blogDetails";
import InstructorQuizQuestions from "../Instructor/instructor-quiz-question/instructorQuizQuestions";
import InstructorProfileSettings from "../Instructor/instructor-settings/instructor-profile-settings/instructorProfile";
import StudentsDetails from "../Instructor/student-details/studentsDetails";
import StudentCertificates from "../student/student-certificates/student-certificates";
import StudentCourseResume from "../student/student-course-resume/student-course-resume";
import StudentCourse from "../student/student-course/studentCourse";
import StudentMessage from "../student/student-message/studentMessage";
import StudentOrder from "../student/student-order-history/studentOrder";
import StudentProfile from "../student/student-profile/studentProfile";
import StudentQuizQuestion from "../student/student-quiz-question/studentQuizQuestion";
import StudentQuiz from "../student/student-quiz/studentQuiz";
import StudentRefferal from "../student/student-refferal/studentRefferal";
import StudentReviews from "../student/student-reviews/studentReviews";
import StudentBillingAddress from "../student/student-settings/student-billing-address/studentBillingAddress";
import StudentChangePassword from "../student/student-settings/student-change-password/studentChangePassword";
import StudentLinkedAccounts from "../student/student-settings/student-linked-accounts/studentLinkedAccounts";
import StudentNotification from "../student/student-settings/student-notifications/studentNotification";
import StudentSocialProfile from "../student/student-settings/student-social-profile/studentSocialProfile";
import StudentSettings from "../student/student-settings/studentSettings";
import StudentTickets from "../student/student-tickets/studentTickets";
import StudentWishlist from "../student/student-wishlist/studentWishlist";
import EditCourse from "../Courses/edit-course/edit-course";
import TeacherApprovalScreen from "../Instructor/approval-screen/approval-screen";
import AllInstructorGrid from "../Instructor/instructor-list/instructorGrid";

const routes = all_routes;

export const authRoutes = [
  {
    path: routes.login,
    element: <Login />,
    route: Route,
  },
  {
    path: routes.register,
    element: <Register />,
    route: Route,
  },
  {
    path: routes.forgotpassword,
    element: <ForgortPassword />,
    route: Route,
  },
  {
    path: routes.setpassowrd,
    element: <SetPassword />,
    route: Route,
  },
  {
    path: routes.otp,
    element: <Otp />,
    route: Route,
  },
  {
    path: routes.lockscreen,
    element: <LockScreen />,
    route: Route,
  },
  {
    path: routes.Error404,
    element: <Error404 />,
    route: Route,
  },
  {
    path: routes.Error500,
    element: <Error500 />,
    route: Route,
  },
  {
    path: routes.underconstruction,
    element: <UnderConstruction />,
    route: Route,
  },
  {
    path: routes.comingSoon,
    element: <ComingSoon />,
    route: Route,
  },
];

export const publicRoutes = [
  {
    path: "/",
    name: "Root",
    element: <Navigate to="/index" />,
    route: Route,
  },
  {
    path: routes.homeone,
    element: <HomeOne />,
    route: Route,
  },
  {
    path: routes.courseCategory,
    element: <CourseCategoryThree />,
    route: Route,
  },

  {
    path: routes.courseDetails,
    element: <CourseDetails />,
    route: Route,
  },
  {
    path: routes.courseDetails2,
    element: <CourseDetailsTwo />,
    route: Route,
  },
  {
    path: routes.blogGrid,
    element: <BlogGrid />,
    route: Route,
  },
  {
    path: routes.blogGrid2,
    element: <BlogGrid2 />,
    route: Route,
  },
  {
    path: routes.blogGrid3,
    element: <BlogGrid3 />,
    route: Route,
  },
  {
    path: routes.blogCarousal,
    element: <BlogCarousal />,
    route: Route,
  },
  {
    path: routes.blogMasonry,
    element: <BlogMasonry />,
    route: Route,
  },
  {
    path: routes.blogLeftSidebar,
    element: <BlogLeftSidebar />,
    route: Route,
  },
  {
    path: routes.blogRightSidebar,
    element: <BlogRightSidebar />,
    route: Route,
  },
  {
    path: routes.blogDetailsLeftSidebar,
    element: <BlogDetailsLeftSidebar />,
    route: Route,
  },
  {
    path: routes.blogDetailsRightSidebar,
    element: <BlogDetailsRightSidebar />,
    route: Route,
  },
  {
    path: routes.blogDetails,
    element: <BlogDetails />,
    route: Route,
  },
  {
    path: routes.about_us,
    element: <AboutUs />,
    route: Route,
  },
  {
    path: routes.contactUs,
    element: <ContactUs />,
    route: Route,
  },
  {
    path: routes.becomeAnInstructor,
    element: <BecomeInstructor />,
    route: Route,
  },
  {
    path: routes.testimonials,
    element: <Testimonials />,
    route: Route,
  },
  {
    path: routes.pricingPlan,
    element: <PricePlanning />,
    route: Route,
  },
  {
    path: routes.FAQ,
    element: <Faq />,
    route: Route,
  },
  {
    path: routes.termsConditions,
    element: <TermsCondition />,
    route: Route,
  },
  {
    path: routes.privacyPolicy,
    element: <PrivacyPolicy />,
    route: Route,
  },
  // IMPORTANT: All Instructor and Student routes removed
];

export const protectedRoutes = [
  {
    path: routes.courseResume,
    element: <CourseResume />,
    route: Route,
  },
  {
    path: routes.courseWatch,
    element: <CourseWatch />,
    route: Route,
  },
  {
    path: routes.courseCart,
    element: <CourseCart />,
    route: Route,
  },
  {
    path: routes.courseCheckout,
    element: <CourseCheckout />,
    route: Route,
  },
  {
    path: routes.addNewCourse,
    element: <AddNewCourse />,
    route: Route,
  },

  {
    path: routes.editCourse,
    element: <EditCourse />,
    route: Route,
  },

  {
    path: routes.approvalScreen,
    element: <TeacherApprovalScreen />,
    route: Route,
  },
  {
    path: routes.allInstructorList,
    element: <AllInstructorGrid />,
    route: Route,
  },

  // Instructor routes
  {
    path: routes.instructorDashboard,
    element: <InstructorDashboard />,
    route: Route,
  },
  {
    path: routes.instructorProfile,
    element: <InstructorProfile />,
    route: Route,
  },
  {
    path: routes.instructorCourse,
    element: <InstructorCourse />,
    route: Route,
  },
  {
    path: routes.instructorAnnouncements,
    element: <InstructorAnnouncements />,
    route: Route,
  },
  {
    path: routes.instructorAssignment,
    element: <InstructorAssignment />,
    route: Route,
  },
  {
    path: routes.instructorQuiz,
    element: <InstructorQuiz />,
    route: Route,
  },
  {
    path: routes.instructorQuizResult,
    element: <InstructorQuizResult />,
    route: Route,
  },
  {
    path: routes.instructorCertificate,
    element: <InstructorCertificate />,
    route: Route,
  },
  {
    path: routes.instructorEarning,
    element: <InstructorEarning />,
    route: Route,
  },
  {
    path: routes.instructorPayout,
    element: <InstructorPayout />,
    route: Route,
  },
  {
    path: routes.instructorStatements,
    element: <InstructorStatement />,
    route: Route,
  },
  {
    path: routes.instructorMessage,
    element: <InstructorMessage />,
    route: Route,
  },
  {
    path: routes.instructorTickets,
    element: <InstructorTickets />,
    route: Route,
  },
  {
    path: routes.instructorChangePassword,
    element: <InstructorChangePassoword />,
    route: Route,
  },
  {
    path: routes.instructorPlan,
    element: <InstructorPlanSettings />,
    route: Route,
  },
  {
    path: routes.instructorSocialProfiles,
    element: <InstructorSocialprofileSettings />,
    route: Route,
  },
  {
    path: routes.instructorLinkedAccounts,
    element: <InstructorLinkedAccounts />,
    route: Route,
  },
  {
    path: routes.instructorNotification,
    element: <InstructorNotification />,
    route: Route,
  },
  {
    path: routes.instructorIntegrations,
    element: <InstructorIntegrations />,
    route: Route,
  },
  {
    path: routes.instructorWithdraw,
    element: <InstructorWithdraw />,
    route: Route,
  },
  // {
  //   path: routes.instructorCourseGrid,
  //   element: <InstructorCourseGrid />,
  //   route: Route,
  // },
  {
    path: routes.instructorGrid,
    element: <InstructorGrid />,
    route: Route,
  },
  {
    path: routes.instructorList,
    element: <InstructorList />,
    route: Route,
  },
  {
    path: routes.instructorDetails,
    element: <InstructorDetails />,
    route: Route,
  },
  {
    path: routes.instructorQA,
    element: <InstructorQuizQuestions />,
    route: Route,
  },
  {
    path: routes.instructorsettings,
    element: <InstructorProfileSettings />,
    route: Route,
  },

  // Student routes
  {
    path: routes.studentsGrid,
    element: <StudentGrid />,
    route: Route,
  },
  {
    path: routes.studentsList,
    element: <StudentList />,
    route: Route,
  },
  {
    path: routes.studentsDetails,
    element: <StudentsDetails />,
    route: Route,
  },
  {
    path: routes.studentDashboard,
    element: <StudentDashboard />,
    route: Route,
  },
  {
    path: routes.studentProfile,
    element: <StudentProfile />,
    route: Route,
  },
  {
    path: routes.studentCourses,
    element: <StudentCourse />,
    route: Route,
  },
  {
    path: routes.studentCourseResume,
    element: <StudentCourseResume />,
    route: Route,
  },
  {
    path: routes.studentCertificates,
    element: <StudentCertificates />,
    route: Route,
  },
  {
    path: routes.studentWishlist,
    element: <StudentWishlist />,
    route: Route,
  },
  {
    path: routes.studentReviews,
    element: <StudentReviews />,
    route: Route,
  },
  {
    path: routes.studentQuiz,
    element: <StudentQuiz />,
    route: Route,
  },
  {
    path: routes.studentQuizQuestion,
    element: <StudentQuizQuestion />,
    route: Route,
  },
  {
    path: routes.studentOrderHistory,
    element: <StudentOrder />,
    route: Route,
  },
  {
    path: routes.studentReferral,
    element: <StudentRefferal />,
    route: Route,
  },
  {
    path: routes.studentMessage,
    element: <StudentMessage />,
    route: Route,
  },
  {
    path: routes.studentTickets,
    element: <StudentTickets />,
    route: Route,
  },
  {
    path: routes.studentSettings,
    element: <StudentSettings />,
    route: Route,
  },
  {
    path: routes.studentChangePassword,
    element: <StudentChangePassword />,
    route: Route,
  },
  {
    path: routes.studentSocialProfile,
    element: <StudentSocialProfile />,
    route: Route,
  },
  {
    path: routes.studentLinkedAccounts,
    element: <StudentLinkedAccounts />,
    route: Route,
  },
  {
    path: routes.studentNotification,
    element: <StudentNotification />,
    route: Route,
  },
  {
    path: routes.studentBillingAddress,
    element: <StudentBillingAddress />,
    route: Route,
  },

   {
    path: routes.studentApprovalScreen,
    element: <TeacherApprovalScreen />,
    route: Route,
  },

  // General routes for logged in users
  {
    path: routes.notification,
    element: <Notification />,
    route: Route,
  },
];
