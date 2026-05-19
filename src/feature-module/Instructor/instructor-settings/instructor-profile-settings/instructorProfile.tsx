import { DatePicker } from "antd";
import dayjs from "dayjs";
import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Breadcrumb from "../../../../core/common/Breadcrumb/breadcrumb";
import ImageGlobal from "../../../../core/common/ImageGlobal/ImageGlobal";
import {
  clearInstructorState,
  updateInstructorProfile,
} from "../../../../core/redux/instructor";
import InstructorSidebar from "../../common/instructorSidebar";
import ProfileCard from "../../common/profileCard";
import InstructorSettingsLink from "../settings-link/instructorSettingsLink";

// ------ Validation Schema ------
const validationSchema = Yup.object({
  firstName: Yup.string().required("First name required"),
  lastName: Yup.string().required("Last name required"),
  userName: Yup.string().required("User name required"),
  phoneNumber: Yup.string().required("Phone number required"),
  bio: Yup.string().required("Bio required"),
  education: Yup.array()
    .of(
      Yup.object({
        degree: Yup.string().required("Degree required"),
        university: Yup.string().required("Institute required"),
        fromDate: Yup.mixed().required("From Date required"),
        toDate: Yup.mixed().required("To Date required"),
      })
    )
    .min(1, "At least one education record required"),
  experience: Yup.array()
    .of(
      Yup.object({
        company: Yup.string().required("Company required"),
        position: Yup.string().required("Position required"),
        fromDate: Yup.mixed().required("From Date required"),
        toDate: Yup.mixed().required("To Date required"),
      })
    )
    .min(1, "At least one experience record required"),
});

const InstructorProfileSettings = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((state: any) => state.auth.user);
  const { loading, error, success } = useSelector(
    (state: any) => state.instructor
  );

  // Hydrate initial values for Formik
  const initialValues = {
    firstName: authUser?.firstName || "",
    lastName: authUser?.lastName || "",
    userName: authUser?.userName || "",
    phoneNumber: authUser?.phoneNumber || "",
    bio: authUser?.bio || "",
    avatarFile: null as File | null,
    education: Array.isArray(authUser?.education)
      ? authUser.education.map((edu: any) => ({
          degree: edu.degree || "",
          university: edu.university || "",
          fromDate: edu.fromDate ? dayjs(edu.fromDate) : null,
          toDate: edu.toDate ? dayjs(edu.toDate) : null,
        }))
      : [{ degree: "", university: "", fromDate: null, toDate: null }],
    experience: Array.isArray(authUser?.experience)
      ? authUser.experience.map((exp: any) => ({
          company: exp.company || "",
          position: exp.position || "",
          fromDate: exp.fromDate ? dayjs(exp.fromDate) : null,
          toDate: exp.toDate ? dayjs(exp.toDate) : null,
        }))
      : [{ company: "", position: "", fromDate: null, toDate: null }],
  };
  const [avatarPreviewUrl, setAvatarPreviewUrl] = React.useState<string | null>(
    null
  );

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(clearInstructorState());
      }, 2500);
      setAvatarPreviewUrl(null);
    }
  }, [success, dispatch]);

  const getModalContainer = () => {
    const modalElement = document.getElementById("add_assignment");
    return modalElement ? modalElement : document.body;
  };

  // Hydrate when API returns new profile after edit (Formik will already get new values on next mount due to enableReinitialize)
  useEffect(() => {
    if (success) {
      setAvatarPreviewUrl(null);
    }
  }, [success]);

  // ---------- FORM START ----------
  return (
    <>
      <Breadcrumb title="My Profile" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="mb-3">
                <h5>Settings</h5>
              </div>
              <InstructorSettingsLink />
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                enableReinitialize={true}
                onSubmit={async (values, { setSubmitting }) => {
                  if (!authUser?._id) return;
                  const payload = {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    userName: values.userName,
                    phoneNumber: values.phoneNumber,
                    bio: values.bio,
                    photo: values.avatarFile || authUser?.photo || null,
                    education: values.education.map((item: any) => ({
                      ...item,
                      fromDate: item.fromDate
                        ? dayjs.isDayjs(item.fromDate)
                          ? item.fromDate.toISOString()
                          : item.fromDate
                        : null,
                      toDate: item.toDate
                        ? dayjs.isDayjs(item.toDate)
                          ? item.toDate.toISOString()
                          : item.toDate
                        : null,
                    })),
                    experience: values.experience.map((item: any) => ({
                      ...item,
                      fromDate: item.fromDate
                        ? dayjs.isDayjs(item.fromDate)
                          ? item.fromDate.toISOString()
                          : item.fromDate
                        : null,
                      toDate: item.toDate
                        ? dayjs.isDayjs(item.toDate)
                          ? item.toDate.toISOString()
                          : item.toDate
                        : null,
                    })),
                  };

                  try {
                    const resultAction = await dispatch(
                      updateInstructorProfile({
                        id: authUser._id,
                        data: payload,
                      }) as any
                    );

                    if (updateInstructorProfile.fulfilled.match(resultAction)) {
                      toast.success("Profile updated successfully!");
                      // resetForm(); // If you want to reset after submit
                    } else {
                      toast.error(
                        resultAction.payload?.message ||
                          "Error updating profile. Please try again."
                      );
                    }
                  } catch (error: any) {
                    toast.error(
                      error?.message || "Unexpected error updating profile."
                    );
                  }
                  setSubmitting(false);
                }}
              >
                {({
                  values,
                  setFieldValue,
                  isSubmitting,
                  handleSubmit,
                }) => (
                  <Form onSubmit={handleSubmit}>
                    <div className="card">
                      <div className="card-body">
                        {success && (
                          <div className="alert alert-success">
                            Profile updated!
                          </div>
                        )}
                        {error && (
                          <div className="alert alert-danger">{error}</div>
                        )}
                        <div className="profile-upload-group">
                          <div className="d-flex align-items-center">
                            <span className="avatar flex-shrink-0 avatar-xxxl avatar-rounded border me-3">
                              {avatarPreviewUrl ? (
                                <img
                                  src={avatarPreviewUrl}
                                  alt="Img"
                                  className="img-fluid rounded-circle"
                                />
                              ) : (
                                <ImageGlobal
                                  src={authUser?.photo}
                                  alt="Img"
                                  className="img-fluid rounded-circle"
                                />
                              )}
                            </span>
                            <div className="profile-upload-head">
                              <h6>Your Avatar</h6>
                              <div className="new-employee-field">
                                <div className="d-flex flex-column align-items-start mt-2 gap-2">
                                  {/* Hidden File Input */}
                                  <input
                                    type="file"
                                    id="avatar-upload"
                                    accept="image/jpeg,image/png,image/webp"
                                    style={{ display: "none" }}
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        setFieldValue(
                                          "avatarFile",
                                          e.target.files[0]
                                        );
                                        setAvatarPreviewUrl(
                                          URL.createObjectURL(e.target.files[0])
                                        );
                                      }
                                    }}
                                  />

                                  {/* Styled Upload Button */}
                                  <label
                                    htmlFor="avatar-upload"
                                    className="btn btn-outline-primary px-3 py-2 mb-1"
                                    style={{
                                      cursor: "pointer",
                                      display: "inline-block",
                                    }}
                                  >
                                    <i className="isax isax-export fs-16 me-2" />
                                    Upload Photo
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="edit-profile-info mb-3">
                            <h5 className="mb-1 fs-18">Personal Details</h5>
                            <p>Edit your personal information</p>
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  First Name{" "}
                                  <span className="text-danger"> *</span>
                                </label>
                                <Field
                                  type="text"
                                  name="firstName"
                                  className="form-control"
                                />
                                <ErrorMessage
                                  name="firstName"
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  Last Name{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <Field
                                  type="text"
                                  name="lastName"
                                  className="form-control"
                                />
                                <ErrorMessage
                                  name="lastName"
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  User Name{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <Field
                                  type="text"
                                  name="userName"
                                  className="form-control"
                                  disabled
                                />
                                <ErrorMessage
                                  name="userName"
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  Phone Number{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <Field
                                  type="text"
                                  name="phoneNumber"
                                  className="form-control"
                                />
                                <ErrorMessage
                                  name="phoneNumber"
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="mb-4">
                                <label className="form-label">
                                  Bio <span className="text-danger">*</span>
                                </label>
                                <Field
                                  as="textarea"
                                  name="bio"
                                  rows={4}
                                  className="form-control"
                                />
                                <ErrorMessage
                                  name="bio"
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="mt-3 mb-3">
                              <h5 className="mb-1 fs-18">
                                Educational Details
                              </h5>
                              <p>Edit your Educational information</p>
                            </div>
                            <div className="col-md-12">
                              <FieldArray name="education">
                                {({ push, remove }) => (
                                  <div className="row">
                                    {values.education.map(
                                      (edu: any, idx: any) => (
                                        <React.Fragment key={idx}>
                                          <div className="col-xl-7">
                                            <div className="row">
                                              <div className="col-md-6">
                                                <div className="mb-3">
                                                  <label className="form-label">
                                                    Degree{" "}
                                                    <span className="text-danger">
                                                      *
                                                    </span>
                                                  </label>
                                                  <Field
                                                    name={`education.${idx}.degree`}
                                                    className="form-control"
                                                  />
                                                  <ErrorMessage
                                                    name={`education.${idx}.degree`}
                                                    component="div"
                                                    className="text-danger"
                                                  />
                                                </div>
                                              </div>
                                              <div className="col-md-6">
                                                <div className="mb-3">
                                                  <label className="form-label">
                                                    Institute{" "}
                                                    <span className="text-danger">
                                                      *
                                                    </span>
                                                  </label>
                                                  <Field
                                                    name={`education.${idx}.university`}
                                                    className="form-control"
                                                  />
                                                  <ErrorMessage
                                                    name={`education.${idx}.university`}
                                                    component="div"
                                                    className="text-danger"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="col-xl-5">
                                            <div className="row">
                                              <div className="col-md-6">
                                                <div className="mb-3">
                                                  <label className="form-label">
                                                    From Date{" "}
                                                    <span className="text-danger">
                                                      *
                                                    </span>
                                                  </label>
                                                  <DatePicker
                                                    className="form-control datetimepicker"
                                                    getPopupContainer={
                                                      getModalContainer
                                                    }
                                                    value={
                                                      edu.fromDate
                                                        ? dayjs(edu.fromDate)
                                                        : undefined
                                                    }
                                                    onChange={(date) =>
                                                      setFieldValue(
                                                        `education.${idx}.fromDate`,
                                                        date
                                                      )
                                                    }
                                                    placeholder="dd/mm/yyyy"
                                                  />
                                                  <ErrorMessage
                                                    name={`education.${idx}.fromDate`}
                                                    component="div"
                                                    className="text-danger"
                                                  />
                                                </div>
                                              </div>
                                              <div className="col-md-6">
                                                <div className="mb-3">
                                                  <label className="form-label">
                                                    To Date{" "}
                                                    <span className="text-danger">
                                                      *
                                                    </span>
                                                  </label>
                                                  <DatePicker
                                                    className="form-control datetimepicker"
                                                    getPopupContainer={
                                                      getModalContainer
                                                    }
                                                    value={
                                                      edu.toDate
                                                        ? dayjs(edu.toDate)
                                                        : undefined
                                                    }
                                                    onChange={(date) =>
                                                      setFieldValue(
                                                        `education.${idx}.toDate`,
                                                        date
                                                      )
                                                    }
                                                    placeholder="dd/mm/yyyy"
                                                  />
                                                  <ErrorMessage
                                                    name={`education.${idx}.toDate`}
                                                    component="div"
                                                    className="text-danger"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="col-12 mb-2">
                                            {values.education.length > 1 && (
                                              <button
                                                type="button"
                                                className="btn  text-danger"
                                                onClick={() => remove(idx)}
                                              >
                                                <i className="isax isax-trash" />{" "}
                                                Remove
                                              </button>
                                            )}
                                          </div>
                                        </React.Fragment>
                                      )
                                    )}
                                    <div className="col-12">
                                      <button
                                        type="button"
                                        className="d-inline-flex align-items-center text-secondary fw-medium mb-3 btn "
                                        onClick={() =>
                                          push({
                                            degree: "",
                                            university: "",
                                            fromDate: null,
                                            toDate: null,
                                          })
                                        }
                                      >
                                        <i className="isax isax-add me-1" /> Add
                                        New
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </FieldArray>
                            </div>
                            <div className="mt-3 mb-3">
                              <h5 className="mb-1 fs-18">Experience</h5>
                              <p>Edit your Experience</p>
                            </div>
                            <div className="col-md-12">
                              <FieldArray name="experience">
                                {({ push, remove }) => (
                                  <div className="row">
                                    {values.experience.map(
                                      (exp: any, idx: any) => (
                                        <React.Fragment key={idx}>
                                          <div className="col-xl-7">
                                            <div className="row">
                                              <div className="col-md-6">
                                                <div className="mb-3">
                                                  <label className="form-label">
                                                    Company{" "}
                                                    <span className="text-danger">
                                                      *
                                                    </span>
                                                  </label>
                                                  <Field
                                                    name={`experience.${idx}.company`}
                                                    className="form-control"
                                                  />
                                                  <ErrorMessage
                                                    name={`experience.${idx}.company`}
                                                    component="div"
                                                    className="text-danger"
                                                  />
                                                </div>
                                              </div>
                                              <div className="col-md-6">
                                                <div className="mb-3">
                                                  <label className="form-label">
                                                    Position{" "}
                                                    <span className="text-danger">
                                                      *
                                                    </span>
                                                  </label>
                                                  <Field
                                                    name={`experience.${idx}.position`}
                                                    className="form-control"
                                                  />
                                                  <ErrorMessage
                                                    name={`experience.${idx}.position`}
                                                    component="div"
                                                    className="text-danger"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="col-xl-5">
                                            <div className="row">
                                              <div className="col-md-6">
                                                <div className="mb-3">
                                                  <label className="form-label">
                                                    From Date{" "}
                                                    <span className="text-danger">
                                                      *
                                                    </span>
                                                  </label>
                                                  <DatePicker
                                                    className="form-control datetimepicker"
                                                    getPopupContainer={
                                                      getModalContainer
                                                    }
                                                    value={
                                                      exp.fromDate
                                                        ? dayjs(exp.fromDate)
                                                        : undefined
                                                    }
                                                    onChange={(date) =>
                                                      setFieldValue(
                                                        `experience.${idx}.fromDate`,
                                                        date
                                                      )
                                                    }
                                                    placeholder="dd/mm/yyyy"
                                                  />
                                                  <ErrorMessage
                                                    name={`experience.${idx}.fromDate`}
                                                    component="div"
                                                    className="text-danger"
                                                  />
                                                </div>
                                              </div>
                                              <div className="col-md-6">
                                                <div className="mb-3">
                                                  <label className="form-label">
                                                    To Date{" "}
                                                    <span className="text-danger">
                                                      *
                                                    </span>
                                                  </label>
                                                  <DatePicker
                                                    className="form-control datetimepicker"
                                                    getPopupContainer={
                                                      getModalContainer
                                                    }
                                                    value={
                                                      exp.toDate
                                                        ? dayjs(exp.toDate)
                                                        : undefined
                                                    }
                                                    onChange={(date) =>
                                                      setFieldValue(
                                                        `experience.${idx}.toDate`,
                                                        date
                                                      )
                                                    }
                                                    placeholder="dd/mm/yyyy"
                                                  />
                                                  <ErrorMessage
                                                    name={`experience.${idx}.toDate`}
                                                    component="div"
                                                    className="text-danger"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="col-12 mb-2">
                                            {values.experience.length > 1 && (
                                              <button
                                                type="button"
                                                className="btn  text-danger"
                                                onClick={() => remove(idx)}
                                              >
                                                <i className="isax isax-trash" />{" "}
                                                Remove
                                              </button>
                                            )}
                                          </div>
                                        </React.Fragment>
                                      )
                                    )}
                                    <div className="col-12">
                                      <button
                                        type="button"
                                        className="d-inline-flex align-items-center text-secondary fw-medium mb-3 btn "
                                        onClick={() =>
                                          push({
                                            company: "",
                                            position: "",
                                            fromDate: null,
                                            toDate: null,
                                          })
                                        }
                                      >
                                        <i className="isax isax-add me-1" /> Add
                                        New
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </FieldArray>
                            </div>
                            <div className="col-md-12">
                              <button
                                className="btn btn-secondary rounded-pill"
                                type="submit"
                                disabled={loading || isSubmitting}
                              >
                                {loading ? "Updating..." : "Update Profile"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorProfileSettings;
