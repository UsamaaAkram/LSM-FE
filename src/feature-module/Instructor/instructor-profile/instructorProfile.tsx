import moment from "moment";
import { useSelector } from "react-redux";
import { Link } from 'react-router-dom';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import InstructorSidebar from '../common/instructorSidebar';
import ProfileCard from '../common/profileCard';

const InstructorProfile = () => {
  const user = useSelector((state: any) => state.auth.user);

  // Helper to format and display date & time using moment.js
  const formatDate = (dateStr?: string) =>
    dateStr ? moment(dateStr).format('DD MMM YYYY, hh:mm A') : "";

  return (
    <>
      <Breadcrumb title='My Profile' />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5 className="fw-bold">My Profile</h5>
                <Link to="#" className="edit-profile-icon">
                  <i className="isax isax-edit-2" />
                </Link>
              </div>
              <div className="card">
                <div className="card-body">
                  <h5 className="fs-18 pb-3 border-bottom mb-3">Basic Information</h5>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>First Name</h6>
                        <span>{user?.firstName || ""}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Last Name</h6>
                        <span>{user?.lastName || ""}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Registration Date</h6>
                        <span>{user?.createdAt ? formatDate(user.createdAt) : ""}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>User Name</h6>
                        <span>{user?.userName || ""}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Phone Number</h6>
                        <span>{user?.phoneNumber || ""}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Email</h6>
                        <span>{user?.email || ""}</span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <h6>Bio</h6>
                        <span>{user?.bio || ""}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Education Section */}
              <div className="card">
                <div className="card-body">
                  <h5 className="fs-18 pb-3 border-bottom mb-3">Education</h5>
                  <div className="education-flow">
                    {(user?.education ?? []).map((edu: any, idx: number) => (
                      <div key={idx} className="ps-4 pb-3 timeline-flow">
                        <div>
                          <h6 className="mb-1">
                            {edu.degree} - {edu.university}
                          </h6>
                          <p>
                            {formatDate(edu.fromDate)} - {formatDate(edu.toDate)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Experience Section */}
              <div className="card mb-0">
                <div className="card-body">
                  <h5 className="fs-18 pb-3 border-bottom mb-3">Experience</h5>
                  {(user?.experience ?? []).map((exp: any, idx: number) => (
                    <div key={idx} className="d-flex align-items-center mb-4">
                      <span className="bg-light border avatar avatar-lg text-gray-9 flex-shrink-0 me-3">
                        <i className="isax isax-briefcase fw-bold" />
                      </span>
                      <div>
                        <h6 className="mb-1">
                          {exp.position ? `${exp.position} (${exp.company})` : exp.company}
                        </h6>
                        <p>
                          {formatDate(exp.fromDate)} - {formatDate(exp.toDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorProfile;