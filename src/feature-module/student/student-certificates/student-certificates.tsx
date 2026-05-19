import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import type { AppDispatch, RootState } from "../../../core/redux/store";
import { fetchStudentCertificates } from "../../../core/redux/studentCertificatesSlice";
import { downloadCertificate } from "../../../core/redux/studentCertificatesSlice"; // import thunk here!
import ProfileCard from "../common/profileCard";
import StudentSidebar from "../common/studentSidebar";
import { toast } from "react-toastify";

const StudentCertificates = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser: any = useSelector<RootState>(
    (state: any) => state.auth.user
  );
  const certificates: any = useSelector<RootState>(
    (state: any) => state.studentCertificates?.certificates
  );
  const loading: any = useSelector<RootState>(
    (state: any) => state.studentCertificates?.loading
  );

  //   const handleDownload = async (courseId: string) => {
  //   if (!currentUser?._id || !courseId) return;
  //   try {
  //     const res: any = await dispatch(
  //       downloadCertificate({ studentId: currentUser._id, courseId })
  //     ).unwrap();
  //     // Use the direct S3/public URL returned by the server
  //     const link = document.createElement("a");
  //     link.href = res.url;         // <-- use the new 'url' property from backend
  //     link.download = res.filename || "certificate.pdf";
  //     link.target = "_blank";      // (optional) open in new tab if download doesn't trigger
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } catch (err: any) {
  //     toast.error(
  //       err?.message ||
  //         "Failed to download certificate. Are you eligible? (70%+ progress required)"
  //     );
  //   }
  // };

  //   useEffect(() => {
  //     if (currentUser?._id) {
  //       dispatch(fetchStudentCertificates(currentUser._id));
  //     }
  //   }, [dispatch, currentUser?._id]);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (courseId: string) => {
    if (!currentUser?._id || !courseId) return;
    setDownloadingId(courseId); // set loader spinning for the row
    try {
      const res: any = await dispatch(
        downloadCertificate({ studentId: currentUser._id, courseId })
      ).unwrap();
      const link = document.createElement("a");
      link.href = res.url;
      link.download = res.filename || "certificate.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      toast.error(err);
    } finally {
      setDownloadingId(null); // clear spinner after download/failed
    }
  };

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchStudentCertificates(currentUser._id));
    }
  }, [dispatch, currentUser?._id]);

  return (
    <>
      <Breadcrumb title="My Certificates" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5>My Certificates</h5>
              </div>
              <div className="table-responsive custom-table">
                <table className="table">
                  <thead className="thead-light">
                    <tr>
                      <th>ID</th>
                      <th>Certificate Name</th>
                      <th>Marks</th>
                      <th>Out of</th>
                      <th>Grade</th>
                      <th>Action</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center">
                          <span className="spinner-border spinner-border-md" />
                        </td>
                      </tr>
                    ) : certificates?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center">
                          No certificates found.
                        </td>
                      </tr>
                    ) : (
                      certificates?.map((cert: any, idx: number) => (
                        <tr key={cert.id || idx}>
                          <td>{cert.id}</td>
                          <td>
                            <Link to="#" className="fw-semibold">
                              {cert.certificateName}
                            </Link>
                          </td>
                          <td>{cert.marks}</td>
                          <td>{cert.outOf}</td>
                          <td>{cert.grade || "—"}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <button
                                className="d-inline-flex fs-14 action-icon btn"
                                onClick={() => handleDownload(cert.courseID)}
                                title="Download Certificate"
                                disabled={downloadingId === cert.courseID}
                              >
                                {downloadingId === cert.courseID ? (
                                  <span className="spinner-border spinner-border-sm ms-0" />
                                ) : (
                                  <i className="isax isax-import" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentCertificates;
