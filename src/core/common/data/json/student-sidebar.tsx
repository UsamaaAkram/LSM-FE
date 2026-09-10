import { all_routes } from "../../../../feature-module/router/all_routes";

export const studentSidebarData = [
    {
        title:'Dashboard',
        icon:'isax isax-grid-35',
        route: all_routes.studentDashboard
    },
    {
        title:'My Profile',
        icon:'fa-solid fa-user',
        route: all_routes.studentProfile
    },
    {
        title:'Enrolled Courses',
        icon:'isax isax-teacher5',
        route: all_routes.studentCourses
    },
    // {
    //     title:'Course Resume',
    //     icon:'isax isax-play-circle5',
    //     route: all_routes.studentCourseResume
    // },
    {
        title:'My Enrollments',
        icon:'isax isax-clipboard-tick',
        route: all_routes.myEnrollments
    },
    {
        title:'Certificates',
        icon:'isax isax-note-215',
        route: all_routes.studentCertificates
    },
    
    {
        title:'Wishlist',
        icon:'isax isax-heart5',
        route: all_routes.studentWishlist
    },
    // {
    //     title:'Reviews',
    //     icon:'isax isax-star5',
    //     route: all_routes.studentReviews
    // },
    {
        title:'Quiz & Assignments',
        icon:'isax isax-award5',
        route: all_routes.studentQuiz,
        subRoute: all_routes.studentQuizQuestion
    },
    {
        // Was commented out while Order History showed template rows. It is a
        // real page now (the student's own Shop orders and deliveries).
        title:'My Products',
        icon:'isax isax-shopping-cart5',
        route: all_routes.studentMyProducts
    },
    // {
    //     title:'Referrals',
    //     icon:'isax isax-tag-user5',
    //     route: all_routes.studentReferral
    // },
    {
        title:'Messages',
        icon:'isax isax-messages-35',
        route: all_routes.studentMessage
    },
    {
        title:'Support Tickets',
        icon:'isax isax-ticket5',
        route: all_routes.studentTickets
    },
    
    
]