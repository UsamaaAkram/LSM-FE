import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";

const ProfileCard = () => {
  const user = useSelector((state: any) => state?.auth?.user);
  const [userData, setUserData] = useState(user);
  useEffect(() => {
    setUserData(user ?? {});
  }, [user]);

  return (
    <div className="instructor-profile">
      <div className="instructor-profile-bg">
        <ImageWithBasePath
          src="assets/img/bg/card-bg-01.png"
          className="instructor-profile-bg-1"
          alt=""
        />
      </div>
      <div className="row align-items-center row-gap-3">
        <div className="col-md-6">
          <div className="d-flex align-items-center">
            <span className="avatar flex-shrink-0 avatar-xxl avatar-rounded me-3 border border-white border-3 position-relative">
              <ImageGlobal
                src={
                  userData?.photo
                    ? `${userData.photo}?id=${new Date().getTime()}`
                    : undefined
                }
                alt="img"
                className="img-fluid rounded-circle"
              />
              {!userData?.isDisable && (
                <span className="verify-tick">
                  <i className="isax isax-verify5" />
                </span>
              )}
            </span>
            <div>
              <h5 className="mb-1 text-white d-inline-flex align-items-center">
                {userData?.firstName && userData?.lastName
                  ? `${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`
                  : userData?.userName ?? userData?.name}
                <Link
                  to={all_routes.instructorsettings}
                  className="link-light fs-16 ms-2"
                  title="Edit Profile"
                >
                  <i className="isax isax-edit-2" />
                </Link>
              </h5>
              <p className="text-light">{userData?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
