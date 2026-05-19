import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { all_routes } from "../../router/all_routes";
import ProfileCard from "../common/profileCard";
import StudentSidebar from "../common/studentSidebar";

const StudentProfile = () => {
  const user = useSelector((state: any) => state?.auth?.user);
  // If you want to use latest (e.g., after update), you can also pull from state.student?.profile if available.
  const profileData = user?.student ? user : {}; // you may adapt based on state shape

  // Flatten for easy access
  const student = profileData?.student ?? {};
  const guardian = profileData?.guardian ?? {};

  // Optionally derive registration date (createdAt)
  const registered = profileData?.createdAt
    ? dayjs(profileData.createdAt).format("DD MMM YYYY, hh:mm A")
    : "";

  return (
    <>
      <Breadcrumb title="My Profile" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5 className="fw-bold">My Profile</h5>
                <Link to={all_routes.studentSettings} className="edit-profile-icon">
                  <i className="isax isax-edit-2" />
                </Link>
              </div>
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="fs-18 page-title fw-bold">
                    Basic Information
                  </h6>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>First Name</h6>
                        <span>{student.firstName || "-"}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Last Name</h6>
                        <span>{student.lastName || "-"}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Registration Date</h6>
                        <span>{registered || "-"}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>User Name</h6>
                        <span>{student.userName || "-"}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Phone Number</h6>
                        <span>{student.phoneNumber || "-"}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Email</h6>
                        <span>{student.email || "-"}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Gender</h6>
                        <span>{student.gender || "-"}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Date of birth</h6>
                        <span>
                          {student.dob
                            ? dayjs(student.dob).format("DD MMM YYYY")
                            : "-"}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Age</h6>
                        <span>{student.age ?? "-"}</span>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div>
                        <h6>Bio</h6>
                        <span>{student.bio || "No bio available."}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card mb-0 mt-3">
                <div className="card-body">
                  <h6 className="fs-18 page-title fw-bold">
                    Guardian Information
                  </h6>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Guardian Name</h6>
                        <span>{guardian.name || "-"}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Relation</h6>
                        <span>{guardian.relation || "-"}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Guardian Phone</h6>
                        <span>{guardian.phone || "-"}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Occupation</h6>
                        <span>{guardian.occupation || "-"}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Address</h6>
                        <span>{guardian.address || "-"}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Has Guardian</h6>
                        <span>{guardian.isGuardian ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* You can add more sections here for education, etc */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentProfile;
