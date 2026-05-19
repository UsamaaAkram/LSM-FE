// import { useDispatch } from "react-redux";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { instructorSidebarData } from "../../../core/common/data/json/instructor-sidebar";
// import { all_routes } from "../../router/all_routes";
// import { logout } from "../../../core/redux/authSlice";
// const InstructorSidebar = () => {
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const handleLogout = async () => {
//     dispatch(logout());
//     navigate(all_routes.homeone);
//   };
//   return (
//     <div className="col-lg-3 ">
//       <div className="settings-sidebar mb-lg-0 theiaStickySidebar">
//         <div>
//           <h6 className="mb-3">Main Menu</h6>
//           <ul className="mb-3 pb-1">
//             {instructorSidebarData.map((menu: any, index: any) => (
//               <li key={index}>
//                 <Link
//                   to={menu.route}
//                   className={`d-inline-flex align-items-center ${
//                     location.pathname === menu.route ||
//                     location.pathname === menu.subRoute
//                       ? "active"
//                       : ""
//                   }`}
//                 >
//                   <i className={`${menu.icon} me-2`} />
//                   {menu.title}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//           <hr />
//           <h6 className="mb-3">Account Settings</h6>
//           <ul>
//             <li>
//               <Link
//                 to={all_routes.instructorsettings}
//                 className={`d-inline-flex align-items-center ${
//                   location.pathname.includes("settings") ? "active" : ""
//                 }`}
//               >
//                 <i className="isax isax-setting-25 me-2" />
//                 Settings
//               </Link>
//             </li>
//             <li>
//               <Link
//                 to="#"
//                 onClick={handleLogout}
//                 className="d-inline-flex align-items-center"
//               >
//                 <i className="isax isax-logout5 me-2" />
//                 Logout
//               </Link>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InstructorSidebar;



import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { instructorSidebarData } from "../../../core/common/data/json/instructor-sidebar";
import { all_routes } from "../../router/all_routes";
import { logout } from "../../../core/redux/authSlice";

const InstructorSidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state: any) => state.auth.user);
  const modulesAccess = user?.role === "instructor" ? user?.modules ?? [] : null;

  // Remove "All Instructors" menu for instructors
  const filteredSidebar = instructorSidebarData.filter(menu => {
    if (user?.role === "instructor" && menu.title === "All Instructors") {
      return false;
    }
    return true;
  });

  // Helper to match module to sidebar title (normalize name)
  const canAccess = (menu: any) => {
    if (!modulesAccess) return true; // admin or other: full access
    const mod = modulesAccess.find(
      (item: any) =>
        item.name.toLowerCase() ===
        menu.title.replace(/\s+/g, "").toLowerCase()
    );
    return !mod?.isDisable;
  };

  const handleLogout = async () => {
    dispatch(logout());
    navigate(all_routes.homeone);
  };

  return (
    <div className="col-lg-3 ">
      <div className="settings-sidebar mb-lg-0 theiaStickySidebar">
        <div>
          <h6 className="mb-3">Main Menu</h6>
          <ul className="mb-3 pb-1">
            {filteredSidebar
              .filter(menu => canAccess(menu))
              .map((menu: any, index: any) => (
                <li key={index}>
                  <Link
                    to={menu.route}
                    className={`d-inline-flex align-items-center ${
                      location.pathname === menu.route ||
                      location.pathname === menu.subRoute
                        ? "active"
                        : ""
                    }`}
                  >
                    <i className={`${menu.icon} me-2`} />
                    {menu.title}
                  </Link>
                </li>
              ))}
          </ul>
          <hr />
          <h6 className="mb-3">Account Settings</h6>
          <ul>
            <li>
              <Link
                to={all_routes.instructorsettings}
                className={`d-inline-flex align-items-center ${
                  location.pathname.includes("settings") ? "active" : ""
                }`}
              >
                <i className="isax isax-setting-25 me-2" />
                Settings
              </Link>
            </li>
            <li>
              <Link
                to="#"
                onClick={handleLogout}
                className="d-inline-flex align-items-center"
              >
                <i className="isax isax-logout5 me-2" />
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InstructorSidebar;