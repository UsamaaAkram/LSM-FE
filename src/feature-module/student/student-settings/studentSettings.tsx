// import { DatePicker } from "antd";
// import dayjs from "dayjs";
// import { ErrorMessage, Field, Form, Formik } from "formik";
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import * as Yup from "yup";
// import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
// import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
// import CustomSelect from "../../../core/common/commonSelect";
// import ImageWithBasePath from "../../../core/common/imageWithBasePath";
// import { Gender } from "../../../core/common/selectOption/json/selectOption";
// import ProfileCard from "../common/profileCard";
// import StudentSidebar from "../common/studentSidebar";
// import SettingsLinks from "./settingsLinks/settingsLinks";
// import SettingsModal from "./settingsModal/settingsModal";

// import type { AppDispatch, RootState } from "../../../core/redux/store";
// import {
//   clearStudentState,
//   getStudentById,
//   updateStudentProfile,
// } from "../../../core/redux/studentSlice";

// // ------ Validation Schema ------
// const validationSchema = Yup.object({
//   firstName: Yup.string().required("First name required"),
//   lastName: Yup.string().required("Last name required"),
//   userName: Yup.string().required("User name required"),
//   email: Yup.string().required("Email required").email("Invalid email"),
//   phoneNumber: Yup.string().required("Phone number required"),
//   address: Yup.string().required("Address required"),
//   gender: Yup.object().nullable().required("Gender required"),
//   cnic: Yup.string().required("CNIC required"),
//   dob: Yup.mixed().required("Date of birth required"),
//   age: Yup.number().nullable().min(0, "Age must be positive"),
//   bio: Yup.string().required("Bio required"),
//   // password: Yup.string(), // (Omit from UI unless changing password)
// });

// const StudentSettings = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const authUser: any = useSelector<RootState>((state: any) => state.auth.user);
//   const student: any = useSelector<RootState>(
//     (state: any) => state.auth.user.student
//   );
//   const dataa: any = useSelector<RootState>((state: any) => state.student);

//   // Hydrate initial values
//   const initialValues = {
//     firstName: dataa?.profile?.student?.firstName || student?.firstName || "",
//     lastName: dataa?.profile?.student?.lastName || student?.lastName || "",
//     userName: dataa?.profile?.student?.userName || student?.userName || "",
//     email: dataa?.profile?.student?.email || student?.email || "",
//     phoneNumber:
//       dataa?.profile?.student?.phoneNumber || student?.phoneNumber || "",
//     address: dataa?.profile?.student?.address || student?.address || "",
//     gender:
//       Gender.find(
//         (g) => g.value === (dataa?.profile?.student?.gender || student?.gender)
//       ) || null,
//     cnic: dataa?.profile?.student?.cnic || student?.cnic || "",
//     dob: dataa?.profile?.student?.dob
//       ? dayjs(dataa?.profile.student.dob)
//       : student?.dob
//       ? dayjs(student.dob)
//       : null,
//     age: dataa?.profile?.student?.age ?? student?.age ?? "",
//     bio: dataa?.profile?.student?.bio || student?.bio || "",
//     avatarFile: null as File | null,
//     photo: dataa?.profile?.student?.photo || student?.photo || "",
//   };
//   const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

//   useEffect(() => {
//     if (!dataa?.profile && authUser?._id) {
//       dispatch(getStudentById(authUser._id));
//     }
//   }, [dataa?.profile, authUser, dispatch]);

//   useEffect(() => {
//     if (dataa?.success) {
//       setTimeout(() => {
//         dispatch(clearStudentState());
//       }, 2500);
//       setAvatarPreviewUrl(null);
//       dispatch(getStudentById(authUser._id));
//     }
//   }, [dataa?.success, dispatch, authUser]);

//   const getModalContainer = () => {
//     const modalElement = document.getElementById("add_assignment");
//     return modalElement ? modalElement : document.body;
//   };

//   const handleSubmit = async (values: any, { setSubmitting }: any) => {
//     if (!authUser?._id) return;
//     const payload: any = {
//       student: {
//         firstName: values.firstName,
//         lastName: values.lastName,
//         userName: values.userName,
//         email: values.email,
//         phoneNumber: values.phoneNumber,
//         address: values.address,
//         gender: values.gender?.value || "",
//         cnic: values.cnic,
//         dob: values.dob
//           ? dayjs.isDayjs(values.dob)
//             ? values.dob.toISOString()
//             : values.dob
//           : "",
//         age: values.age ? Number(values.age) : null,
//         bio: values.bio,
//         photo: values.avatarFile || values.photo || "", // file or string or empty
//       },
//     };

//     try {
//       const resultAction = await dispatch(
//         updateStudentProfile({ id: authUser._id, data: payload }) as any
//       );
//       if (updateStudentProfile.fulfilled.match(resultAction)) {
//         toast.success("Profile updated successfully!");
//       } else {
//         toast.error(
//           resultAction.payload?.message ||
//             "Error updating profile. Please try again."
//         );
//       }
//     } catch (err: any) {
//       toast.error(err?.message || "Unexpected error updating profile.");
//     }
//     setSubmitting(false);
//   };

//   return (
//     <>
//       <Breadcrumb title="Settings" />
//       <div className="content">
//         <div className="container">
//           {/* profile box */}
//           <ProfileCard />
//           <div className="row">
//             {/* sidebar */}
//             <StudentSidebar />
//             <div className="col-lg-9">
//               <div className="mb-3">
//                 <h5>Settings</h5>
//               </div>
//               <SettingsLinks />
//               <div className="card">
//                 <div className="card-body">
//                   <Formik
//                     initialValues={initialValues}
//                     validationSchema={validationSchema}
//                     enableReinitialize={true}
//                     onSubmit={handleSubmit}
//                   >
//                     {({
//                       values,
//                       setFieldValue,
//                       isSubmitting,
//                       handleSubmit,
//                     }) => (
//                       <Form onSubmit={handleSubmit}>
//                         <div className="profile-upload-group">
//                           <div className="d-flex align-items-center">
//                             <span className="avatar flex-shrink-0 avatar-xxxl avatar-rounded border me-3">
//                               {avatarPreviewUrl ? (
//                                 <img
//                                   src={avatarPreviewUrl}
//                                   alt="Img"
//                                   className="img-fluid rounded-circle"
//                                 />
//                               ) : values.photo ? (
//                                 <ImageGlobal
//                                   src={values.photo}
//                                   alt="Img"
//                                   className="img-fluid rounded-circle"
//                                 />
//                               ) : (
//                                 <ImageWithBasePath
//                                   src="assets/img/user/user-02.jpg"
//                                   alt="Img"
//                                   className="img-fluid rounded-circle"
//                                 />
//                               )}
//                             </span>
//                             <div className="profile-upload-head">
//                               <h6>Profile Photo</h6>
//                               <p className="fs-14 mb-0">
//                                 PNG or JPG no bigger than 800px width and height
//                               </p>
//                               <div className="new-employee-field">
//                                 <div className="d-flex align-items-center mt-2">
//                                   <div className="image-upload position-relative mb-0 me-2">
//                                     <input
//                                       type="file"
//                                       id="avatar-upload"
//                                       accept="image/jpeg,image/png,image/webp"
//                                       style={{ display: "none" }}
//                                       onChange={(e) => {
//                                         if (
//                                           e.target.files &&
//                                           e.target.files[0]
//                                         ) {
//                                           setFieldValue(
//                                             "avatarFile",
//                                             e.target.files[0]
//                                           );
//                                           setAvatarPreviewUrl(
//                                             URL.createObjectURL(
//                                               e.target.files[0]
//                                             )
//                                           );
//                                         }
//                                       }}
//                                     />
//                                     <label
//                                       htmlFor="avatar-upload"
//                                       className="btn btn-outline-primary px-3 py-2 mb-1"
//                                       style={{
//                                         cursor: "pointer",
//                                         display: "inline-block",
//                                       }}
//                                     >
//                                       <i className="isax isax-export fs-16 me-2" />
//                                       Upload Photo
//                                     </label>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                         <div>
//                           <div className="edit-profile-info mb-3">
//                             <h5 className="mb-1">Personal Details</h5>
//                             <p>Edit your personal information</p>
//                           </div>
//                           <div className="row">
//                             <div className="col-md-6">
//                               <div className="mb-3">
//                                 <label className="form-label">
//                                   First Name
//                                   <span className="text-danger"> *</span>
//                                 </label>
//                                 <Field
//                                   type="text"
//                                   name="firstName"
//                                   className="form-control"
//                                 />
//                                 <ErrorMessage
//                                   name="firstName"
//                                   component="div"
//                                   className="text-danger"
//                                 />
//                               </div>
//                             </div>
//                             <div className="col-md-6">
//                               <div className="mb-3">
//                                 <label className="form-label">
//                                   Last Name
//                                   <span className="text-danger"> *</span>
//                                 </label>
//                                 <Field
//                                   type="text"
//                                   name="lastName"
//                                   className="form-control"
//                                 />
//                                 <ErrorMessage
//                                   name="lastName"
//                                   component="div"
//                                   className="text-danger"
//                                 />
//                               </div>
//                             </div>
//                             <div className="col-md-6">
//                               <div className="mb-3">
//                                 <label className="form-label">
//                                   User Name{" "}
//                                   <span className="text-danger"> *</span>
//                                 </label>
//                                 <Field
//                                   type="text"
//                                   name="userName"
//                                   className="form-control"
//                                   disabled
//                                 />
//                                 <ErrorMessage
//                                   name="userName"
//                                   component="div"
//                                   className="text-danger"
//                                 />
//                               </div>
//                             </div>
//                             <div className="col-md-6">
//                               <div className="mb-3">
//                                 <label className="form-label">
//                                   Email <span className="text-danger"> *</span>
//                                 </label>
//                                 <Field
//                                   type="email"
//                                   name="email"
//                                   className="form-control"
//                                   disabled
//                                 />
//                                 <ErrorMessage
//                                   name="email"
//                                   component="div"
//                                   className="text-danger"
//                                 />
//                               </div>
//                             </div>
//                             <div className="col-md-6">
//                               <div className="mb-3">
//                                 <label className="form-label">
//                                   Phone Number{" "}
//                                   <span className="text-danger"> *</span>
//                                 </label>
//                                 <Field
//                                   type="text"
//                                   name="phoneNumber"
//                                   className="form-control"
//                                 />
//                                 <ErrorMessage
//                                   name="phoneNumber"
//                                   component="div"
//                                   className="text-danger"
//                                 />
//                               </div>
//                             </div>
//                             <div className="col-md-6">
//                               <div className="mb-3">
//                                 <label className="form-label">
//                                   Address{" "}
//                                   <span className="text-danger"> *</span>
//                                 </label>
//                                 <Field
//                                   type="text"
//                                   name="address"
//                                   className="form-control"
//                                 />
//                                 <ErrorMessage
//                                   name="address"
//                                   component="div"
//                                   className="text-danger"
//                                 />
//                               </div>
//                             </div>
//                             <div className="col-md-6">
//                               <div className="mb-3">
//                                 <label className="form-label">
//                                   Gender <span className="text-danger"> *</span>
//                                 </label>
//                                 <CustomSelect
//                                   options={Gender}
//                                   className="select"
//                                   value={values.gender}
//                                   onChange={(option: any) =>
//                                     setFieldValue("gender", option)
//                                   }
//                                   placeholder="Select"
//                                 />
//                                 <ErrorMessage
//                                   name="gender"
//                                   component="div"
//                                   className="text-danger"
//                                 />
//                               </div>
//                             </div>
//                             <div className="col-md-6">
//                               <div className="mb-3">
//                                 <label className="form-label">
//                                   CNIC <span className="text-danger"> *</span>
//                                 </label>
//                                 <Field
//                                   type="text"
//                                   name="cnic"
//                                   className="form-control"
//                                 />
//                                 <ErrorMessage
//                                   name="cnic"
//                                   component="div"
//                                   className="text-danger"
//                                 />
//                               </div>
//                             </div>
//                             <div className="col-md-6">
//                               <div className="mb-3">
//                                 <label className="form-label">
//                                   DOB <span className="text-danger"> *</span>
//                                 </label>
//                                 <div className="input-icon-end position-relative">
//                                   <DatePicker
//                                     className="form-control datetimepicker"
//                                     getPopupContainer={getModalContainer}
//                                     value={
//                                       values.dob ? dayjs(values.dob) : undefined
//                                     }
//                                     onChange={(date) =>
//                                       setFieldValue("dob", date)
//                                     }
//                                     placeholder="dd/mm/yyyy"
//                                   />
//                                   <span className="input-icon-addon">
//                                     <i className="isax isax-calendar" />
//                                   </span>
//                                   <ErrorMessage
//                                     name="dob"
//                                     component="div"
//                                     className="text-danger"
//                                   />
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="col-md-6">
//                               <div className="mb-3">
//                                 <label className="form-label">
//                                   Age <span className="text-danger"> *</span>
//                                 </label>
//                                 <Field
//                                   type="number"
//                                   name="age"
//                                   className="form-control"
//                                 />
//                                 <ErrorMessage
//                                   name="age"
//                                   component="div"
//                                   className="text-danger"
//                                 />
//                               </div>
//                             </div>
//                             <div className="col-md-12">
//                               <div className="mb-3">
//                                 <label className="form-label">
//                                   Bio <span className="text-danger"> *</span>
//                                 </label>
//                                 <Field
//                                   as="textarea"
//                                   name="bio"
//                                   rows={4}
//                                   className="form-control"
//                                 />
//                                 <ErrorMessage
//                                   name="bio"
//                                   component="div"
//                                   className="text-danger"
//                                 />
//                               </div>
//                             </div>
//                             <div className="col-md-12">
//                               <button
//                                 className="btn btn-secondary rounded-pill"
//                                 type="submit"
//                                 disabled={dataa?.loading || isSubmitting}
//                               >
//                                 {dataa?.loading
//                                   ? "Updating..."
//                                   : "Update Profile"}
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       </Form>
//                     )}
//                   </Formik>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <SettingsModal />
//     </>
//   );
// };

// export default StudentSettings;

import { DatePicker, Switch } from "antd";
import dayjs from "dayjs";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import CustomSelect from "../../../core/common/commonSelect";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Gender } from "../../../core/common/selectOption/json/selectOption";
import ProfileCard from "../common/profileCard";
import StudentSidebar from "../common/studentSidebar";
import SettingsLinks from "./settingsLinks/settingsLinks";
import SettingsModal from "./settingsModal/settingsModal";

import type { AppDispatch, RootState } from "../../../core/redux/store";
import {
  clearStudentState,
  getStudentById,
  updateStudentProfile,
} from "../../../core/redux/studentSlice";

const guardianRelationOptions = ["Father", "Mother", "Other"];

// ------ Validation Schema ------
const validationSchema = Yup.object({
  firstName: Yup.string().required("First name required"),
  lastName: Yup.string().required("Last name required"),
  userName: Yup.string().required("User name required"),
  email: Yup.string().required("Email required").email("Invalid email"),
  phoneNumber: Yup.string().required("Phone number required"),
  address: Yup.string().required("Address required"),
  gender: Yup.object().nullable().required("Gender required"),
  cnic: Yup.string().required("CNIC required"),
  dob: Yup.mixed().required("Date of birth required"),
  age: Yup.number().nullable().min(0, "Age must be positive"),
  bio: Yup.string().required("Bio required"),
  isGuardian: Yup.boolean(),
  guardian_relation: Yup.string().when("isGuardian", {
    is: (val: boolean) => val === true,
    then: (schema) => schema.required("Guardian relation is required"),
    otherwise: (schema) => schema,
  }),
  guardian_name: Yup.string().when("isGuardian", {
    is: (val: boolean) => val === true,
    then: (schema) => schema.required("Guardian name is required"),
    otherwise: (schema) => schema,
  }),
  guardian_phone: Yup.string().when("isGuardian", {
    is: (val: boolean) => val === true,
    then: (schema) => schema.required("Guardian phone is required"),
    otherwise: (schema) => schema,
  }),
  guardian_occupation: Yup.string(),
  guardian_address: Yup.string(),
});

const StudentSettings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser: any = useSelector<RootState>((state: any) => state.auth.user);
  const student: any = useSelector<RootState>(
    (state: any) => state.auth.user.student
  );
  const dataa: any = useSelector<RootState>((state: any) => state.student);

  // Hydrate initial values
  const initialValues = {
    firstName: dataa?.profile?.student?.firstName || student?.firstName || "",
    lastName: dataa?.profile?.student?.lastName || student?.lastName || "",
    userName: dataa?.profile?.student?.userName || student?.userName || "",
    email: dataa?.profile?.student?.email || student?.email || "",
    phoneNumber:
      dataa?.profile?.student?.phoneNumber || student?.phoneNumber || "",
    address: dataa?.profile?.student?.address || student?.address || "",
    gender:
      Gender.find(
        (g) => g.value === (dataa?.profile?.student?.gender || student?.gender)
      ) || null,
    cnic: dataa?.profile?.student?.cnic || student?.cnic || "",
    dob: dataa?.profile?.student?.dob
      ? dayjs(dataa?.profile.student.dob)
      : student?.dob
      ? dayjs(student.dob)
      : null,
    age: dataa?.profile?.student?.age ?? student?.age ?? "",
    bio: dataa?.profile?.student?.bio || student?.bio || "",
    avatarFile: null as File | null,
    photo: dataa?.profile?.student?.photo || student?.photo || "",

    // Guardian fields:
    isGuardian:
      dataa?.profile?.guardian?.isGuardian ??
      student?.guardian?.isGuardian ??
      false,
    guardian_relation:
      dataa?.profile?.guardian?.relation ?? student?.guardian?.relation ?? "",
    guardian_name:
      dataa?.profile?.guardian?.name ?? student?.guardian?.name ?? "",
    guardian_phone:
      dataa?.profile?.guardian?.phone ?? student?.guardian?.phone ?? "",
    guardian_occupation:
      dataa?.profile?.guardian?.occupation ??
      student?.guardian?.occupation ??
      "",
    guardian_address:
      dataa?.profile?.guardian?.address ?? student?.guardian?.address ?? "",
  };
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!dataa?.profile && authUser?._id) {
      dispatch(getStudentById(authUser._id));
    }
  }, [dataa?.profile, authUser, dispatch]);

  useEffect(() => {
    if (dataa?.success) {
      setTimeout(() => {
        dispatch(clearStudentState());
      }, 2500);
      setAvatarPreviewUrl(null);
      dispatch(getStudentById(authUser._id));
    }
  }, [dataa?.success, dispatch, authUser]);

  const getModalContainer = () => {
    const modalElement = document.getElementById("add_assignment");
    return modalElement ? modalElement : document.body;
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    if (!authUser?._id) return;
    const payload: any = {
      student: {
        firstName: values.firstName,
        lastName: values.lastName,
        userName: values.userName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        address: values.address,
        gender: values.gender?.value || "",
        cnic: values.cnic,
        dob: values.dob
          ? dayjs.isDayjs(values.dob)
            ? values.dob.toISOString()
            : values.dob
          : "",
        age: values.age ? Number(values.age) : null,
        bio: values.bio,
        photo: values.avatarFile || values.photo || "", // file or string or empty
      },
      guardian: {
        isGuardian: values.isGuardian,
        relation: values.guardian_relation,
        name: values.guardian_name,
        phone: values.guardian_phone,
        occupation: values.guardian_occupation,
        address: values.guardian_address,
      },
    };

    try {
      const resultAction = await dispatch(
        updateStudentProfile({ id: authUser._id, data: payload }) as any
      );
      if (updateStudentProfile.fulfilled.match(resultAction)) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(
          resultAction.payload?.message ||
            "Error updating profile. Please try again."
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Unexpected error updating profile.");
    }
    setSubmitting(false);
  };

  return (
    <>
      <Breadcrumb title="Settings" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="mb-3">
                <h5>Settings</h5>
              </div>
              <SettingsLinks />
              <div className="card">
                <div className="card-body">
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    enableReinitialize={true}
                    onSubmit={handleSubmit}
                  >
                    {({
                      values,
                      touched,
                      errors,
                      setFieldValue,
                      isSubmitting,
                      handleSubmit,
                    }) => (
                      <Form onSubmit={handleSubmit}>
                        {/* Avatar */}
                        <div className="profile-upload-group">
                          <div className="d-flex align-items-center">
                            <span className="avatar flex-shrink-0 avatar-xxxl avatar-rounded border me-3">
                              {avatarPreviewUrl ? (
                                <img
                                  src={avatarPreviewUrl}
                                  alt="Img"
                                  className="img-fluid rounded-circle"
                                />
                              ) : values.photo ? (
                                <ImageGlobal
                                  src={values.photo}
                                  alt="Img"
                                  className="img-fluid rounded-circle"
                                />
                              ) : (
                                <ImageWithBasePath
                                  src="assets/img/user/user-02.jpg"
                                  alt="Img"
                                  className="img-fluid rounded-circle"
                                />
                              )}
                            </span>
                            <div className="profile-upload-head">
                              <h6>Profile Photo</h6>
                              <p className="fs-14 mb-0">
                                PNG or JPG no bigger than 800px width and height
                              </p>
                              <div className="new-employee-field">
                                <div className="d-flex align-items-center mt-2">
                                  <div className="image-upload position-relative mb-0 me-2">
                                    <input
                                      type="file"
                                      id="avatar-upload"
                                      accept="image/jpeg,image/png,image/webp"
                                      style={{ display: "none" }}
                                      onChange={(e) => {
                                        if (
                                          e.target.files &&
                                          e.target.files[0]
                                        ) {
                                          setFieldValue(
                                            "avatarFile",
                                            e.target.files[0]
                                          );
                                          setAvatarPreviewUrl(
                                            URL.createObjectURL(
                                              e.target.files[0]
                                            )
                                          );
                                        }
                                      }}
                                    />
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
                        </div>
                        {/* Personal Details */}
                        <div>
                          <div className="edit-profile-info mb-3">
                            <h5 className="mb-1">Personal Details</h5>
                            <p>Edit your personal information</p>
                          </div>
                          <div className="row">
                            {/* ... all your current fields from initialValues ... */}
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  First Name
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
                                  Last Name
                                  <span className="text-danger"> *</span>
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
                                  <span className="text-danger"> *</span>
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
                                  Email <span className="text-danger"> *</span>
                                </label>
                                <Field
                                  type="email"
                                  name="email"
                                  className="form-control"
                                  disabled
                                />
                                <ErrorMessage
                                  name="email"
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  Phone Number{" "}
                                  <span className="text-danger"> *</span>
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
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  Address{" "}
                                  <span className="text-danger"> *</span>
                                </label>
                                <Field
                                  type="text"
                                  name="address"
                                  className="form-control"
                                />
                                <ErrorMessage
                                  name="address"
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  Gender <span className="text-danger"> *</span>
                                </label>
                                <CustomSelect
                                  options={Gender}
                                  className="select"
                                  value={values.gender}
                                  onChange={(option: any) =>
                                    setFieldValue("gender", option)
                                  }
                                  placeholder="Select"
                                />
                                <ErrorMessage
                                  name="gender"
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  CNIC <span className="text-danger"> *</span>
                                </label>
                                <Field
                                  type="text"
                                  name="cnic"
                                  className="form-control"
                                />
                                <ErrorMessage
                                  name="cnic"
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  DOB <span className="text-danger"> *</span>
                                </label>
                                <div className="input-icon-end position-relative">
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    getPopupContainer={getModalContainer}
                                    value={
                                      values.dob ? dayjs(values.dob) : undefined
                                    }
                                    onChange={(date) =>
                                      setFieldValue("dob", date)
                                    }
                                    placeholder="dd/mm/yyyy"
                                  />
                                  <span className="input-icon-addon">
                                    <i className="isax isax-calendar" />
                                  </span>
                                  <ErrorMessage
                                    name="dob"
                                    component="div"
                                    className="text-danger"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  Age <span className="text-danger"> *</span>
                                </label>
                                <Field
                                  type="number"
                                  name="age"
                                  className="form-control"
                                />
                                <ErrorMessage
                                  name="age"
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="mb-3">
                                <label className="form-label">
                                  Bio <span className="text-danger"> *</span>
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
                          </div>
                        </div>
                        {/* Guardian Details */}
                        <div className="card mb-3">
                          <div className="card-header fw-bold fs-16 d-flex justify-content-between align-items-center">
                            Guardian Details
                            <div>
                              <label className="form-label mb-1 me-2">
                                Has Guardian
                              </label>
                              <Switch
                                checked={values.isGuardian}
                                onChange={(checked) =>
                                  setFieldValue("isGuardian", checked)
                                }
                              />
                            </div>
                          </div>
                          <div className="card-body">
                            {values.isGuardian && (
                              <>
                                <div className="row mb-2 align-items-center">
                                  <div className="col-md-4 mb-3">
                                    <label className="form-label">
                                      If Guardian Is *
                                    </label>
                                    <div>
                                      {guardianRelationOptions.map((opt) => (
                                        <label
                                          key={opt}
                                          style={{ marginRight: "1.5em" }}
                                        >
                                          <Field
                                            type="radio"
                                            name="guardian_relation"
                                            value={opt}
                                          />{" "}
                                          {opt}
                                        </label>
                                      ))}
                                    </div>
                                    {touched.guardian_relation &&
                                      typeof errors.guardian_relation ===
                                        "string" && (
                                        <div className="text-danger">
                                          {errors.guardian_relation}
                                        </div>
                                      )}
                                  </div>
                                </div>
                                <div className="row mb-2">
                                  <div className="col-md-3 mb-3">
                                    <label className="form-label">
                                      Guardian Name *
                                    </label>
                                    <Field
                                      name="guardian_name"
                                      type="text"
                                      className="form-control"
                                    />
                                    {touched.guardian_name &&
                                      typeof errors.guardian_name ===
                                        "string" && (
                                        <div className="text-danger">
                                          {errors.guardian_name}
                                        </div>
                                      )}
                                  </div>
                                  <div className="col-md-3 mb-3">
                                    <label className="form-label">
                                      Guardian Phone *
                                    </label>
                                    <Field
                                      name="guardian_phone"
                                      type="text"
                                      className="form-control"
                                    />
                                    {touched.guardian_phone &&
                                      typeof errors.guardian_phone ===
                                        "string" && (
                                        <div className="text-danger">
                                          {errors.guardian_phone}
                                        </div>
                                      )}
                                  </div>
                                  <div className="col-md-3 mb-3">
                                    <label className="form-label">
                                      Guardian Occupation
                                    </label>
                                    <Field
                                      name="guardian_occupation"
                                      type="text"
                                      className="form-control"
                                    />
                                  </div>
                                  <div className="col-md-3 mb-3">
                                    <label className="form-label">
                                      Guardian Address
                                    </label>
                                    <Field
                                      name="guardian_address"
                                      type="text"
                                      className="form-control"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        {/* Save */}
                        <div className="col-md-12">
                          <button
                            className="btn btn-secondary rounded-pill"
                            type="submit"
                            disabled={dataa?.loading || isSubmitting}
                          >
                            {dataa?.loading ? "Updating..." : "Update Profile"}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SettingsModal />
    </>
  );
};

export default StudentSettings;
