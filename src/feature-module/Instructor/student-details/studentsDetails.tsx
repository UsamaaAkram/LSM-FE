import { Select, Switch, DatePicker } from "antd";
import dayjs from "dayjs";
import { Field, Form, Formik } from "formik";
import type { FormikHelpers } from "formik";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { all_routes } from "../../router/all_routes";
import ProfileCard from "../common/profileCard";
import { useDispatch, useSelector } from "react-redux";
// import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../core/redux/store"; // <-- path to your store

import {
  getStudentById,
  updateStudentProfile,
} from "../../../core/redux/studentSlice";
import { fetchCourses } from "../../../core/redux/courses";
import moment from "moment";
import { toast } from "react-toastify";
import {
  batchOptions,
  branchOptions,
  genderOptions,
  shiftOptions,
  studentTypeOptions,
} from "../../../core/common/common-list";

// Helper

const guardianRelationOptions = ["Father", "Mother", "Other"];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// --- Types ---
type StudentFormType = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: string;
  dob: string;
  age: string | number;
  photo: File | null;
  isDisable: boolean;
  batch: string;
  enrolledBy: string;
  enrolledBranch: string;
  enrollmentDate: string;
  studentType: string;
  shift: string;
  enrolledCourses: string[];
  isGuardian: boolean;
  guardian_relation: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_occupation: string;
  guardian_address: string;
};

const StudentsDetails = () => {
  const dispatch = useDispatch<AppDispatch>();
  const query = useQuery();
  const studentId = query.get("id");

  // Redux Selectors
  const { profile, loading } = useSelector((state: any) => state.student);
  const { courses } = useSelector((state: any) => state.courses);
  const user = useSelector((state: any) => state.auth.user);

  // Simulate logged in instructor's email
  // Local State
  const [initialDate] = useState(dayjs().format("YYYY-MM-DD"));

  // Load student details (edit) and course list
  useEffect(() => {
    if (studentId) dispatch(getStudentById(studentId));
    dispatch(fetchCourses({}));
  }, [dispatch, studentId]);

  // Form validation
  const validationSchema = Yup.object().shape({
    firstName: Yup.string(),
    lastName: Yup.string(),
    email: Yup.string().email("Invalid email"),
    phoneNumber: Yup.string(),
    address: Yup.string(),
    gender: Yup.string(),
    dob: Yup.string(),
    enrolledCourses: Yup.array()
      .of(Yup.string())
      .min(1, "Select at least one course!")
      .required("Select at least one course!"),
    batch: Yup.string().required("Batch is required"),
    enrolledBranch: Yup.string().required("Branch is required"),
    studentType: Yup.string().required("Student type is required"),
    shift: Yup.string().required("Shift is required"),
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
  });

  function calculateAge(dob?: string): number | "" {
    if (!dob) return "";
    const birth = dayjs(dob);
    const today = dayjs();
    let age = today.year() - birth.year();
    if (
      today.month() < birth.month() ||
      (today.month() === birth.month() && today.date() < birth.date())
    ) {
      age--;
    }
    return age >= 0 ? age : "";
  }

  const navigate = useNavigate();

  function submitStudentForm(
    values: StudentFormType,
    { setSubmitting }: FormikHelpers<StudentFormType>
  ) {
    try {
      const payload = {
        student: {
          firstName: values.firstName,
          lastName: values.lastName,
          userName: profile?.student?.userName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          address: values.address,
          gender: values.gender,
          dob: values.dob,
          age: values.age,
          photo: values.photo,
          isDisable: values.isDisable,
          bio: profile?.student?.bio || "",
          cnic: profile?.student?.cnic || "",
          current_logged_in_locations:
            profile?.student?.current_logged_in_locations || [],
          isDeactivated: profile?.student?.isDeactivated || false,
        },
        administrative: {
          batch: values.batch,
          enrolledBy: values.enrolledBy,
          enrolledBranch: values.enrolledBranch,
          enrollmentDate: values.enrollmentDate,
          studentType: values.studentType,
          shift: values.shift,
        },
        guardian: {
          isGuardian: values.isGuardian,
          relation: values.guardian_relation,
          name: values.guardian_name,
          phone: values.guardian_phone,
          occupation: values.guardian_occupation,
          address: values.guardian_address,
        },
        enrolledCourses: values.enrolledCourses,
      };

      // Dispatch create/update thunk from Redux
      if (studentId) {
        dispatch(
          updateStudentProfile({
            id: studentId,
            data: payload,
            isAdminUpdate: true,
          })
        )
          .unwrap()
          .then(() => {
            navigate(all_routes.studentsList);

            toast.success("Student updated successfully!");
          })
          .catch((err: any) => toast.error(err?.message || "Update failed"));
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  // Fill initial values for edit mode
  const initialValues: StudentFormType = {
    firstName: profile?.student?.firstName || "",
    lastName: profile?.student?.lastName || "",
    email: profile?.student?.email || "",
    phoneNumber: profile?.student?.phoneNumber || "",
    address: profile?.student?.address || "",
    gender: profile?.student?.gender || "",
    dob: profile?.student?.dob || "",
    age: profile?.student?.age || "",
    photo: profile?.student?.photo || null,
    isDisable: profile?.student?.isDisable || false,
    batch: profile?.administrative?.batch || "",
    enrolledBy: user?.email || "",
    enrolledBranch: profile?.administrative?.enrolledBranch || "",
    enrollmentDate:
      profile?.administrative?.enrollmentDate ||
      moment(profile?.createdAt).format("YYYY-MM-DD HH:mm A") ||
      initialDate,
    studentType: profile?.administrative?.studentType || "",
    shift: profile?.administrative?.shift || "",
    enrolledCourses: profile?.enrolledCourses || [],
    isGuardian: profile?.guardian?.isGuardian || false,
    guardian_relation: profile?.guardian?.relation || "",
    guardian_name: profile?.guardian?.name || "",
    guardian_phone: profile?.guardian?.phone || "",
    guardian_occupation: profile?.guardian?.occupation || "",
    guardian_address: profile?.guardian?.address || "",
  };

  return (
    <>
      <Breadcrumb title="Students Details" />
      <div className="content instructor-detail-content">
        <div className="container">
          <ProfileCard />
          <Link
            to={all_routes.studentsList}
            className="d-flex align-items-center mb-3"
          >
            <i className="isax isax-arrow-left me-1 fw-bold" />
            Back to List
          </Link>
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={submitStudentForm}
          >
            {({ values, setFieldValue, errors, touched, isSubmitting }) => {
              return (
                <Form encType="multipart/form-data">
                  {/* Basic Details */}
                  <div className="card mb-3">
                    <div className="card-header fw-bold fs-16 d-flex justify-content-between align-items-center">
                      Student Details
                      <div>
                        <label className="form-label mb-1 me-2">
                          Account is {!values.isDisable ? "active" : "inactive"}
                        </label>
                        <Switch
                          checked={values.isDisable}
                          onChange={(checked) =>
                            setFieldValue("isDisable", checked)
                          }
                        />
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row mb-2">
                        <div className="col-md-3 mb-3">
                          <label className="form-label">First Name</label>
                          <Field
                            name="firstName"
                            type="text"
                            className="form-control"
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">Last Name</label>
                          <Field
                            name="lastName"
                            type="text"
                            className="form-control"
                          />
                        </div>

                        <div className="col-md-3 mb-3">
                          <label className="form-label">Email</label>
                          <Field
                            name="email"
                            type="email"
                            className="form-control"
                            disabled
                          />
                        </div>

                        <div className="col-md-3 mb-3">
                          <label className="form-label">Gender</label>
                          <Field
                            as="select"
                            name="gender"
                            className="form-select"
                          >
                            <option value="">Select</option>
                            {genderOptions.map((opt) => (
                              <option value={opt} key={opt}>
                                {opt}
                              </option>
                            ))}
                          </Field>
                          {touched.gender && errors.gender && (
                            <div className="text-danger">{errors.gender}</div>
                          )}
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">Date of Birth</label>
                          <DatePicker
                            value={values.dob ? dayjs(values.dob) : null}
                            onChange={(dateString: any) => {
                              setFieldValue("dob", dateString);
                              setFieldValue("age", calculateAge(dateString));
                            }}
                            format="YYYY-MM-DD"
                            style={{ width: "100%", height: "40px" }}
                          />
                          {touched.dob && errors.dob && (
                            <div className="text-danger">{errors.dob}</div>
                          )}
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">Mobile Number</label>
                          <Field
                            name="phoneNumber"
                            type="text"
                            className="form-control"
                          />
                          {touched.phoneNumber && errors.phoneNumber && (
                            <div className="text-danger">
                              {errors.phoneNumber}
                            </div>
                          )}
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">Address</label>
                          <Field
                            name="address"
                            type="text"
                            className="form-control"
                          />
                          {touched.address && errors.address && (
                            <div className="text-danger">{errors.address}</div>
                          )}
                        </div>

                        <div className="col-md-3 mb-2">
                          <label className="form-label">Age</label>
                          <Field
                            name="age"
                            type="number"
                            className="form-control"
                            disabled
                            value={values.age}
                          />
                        </div>
                        <div className="col-md-4 mb-2">
                          <label className="form-label">Student Photo</label>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="form-control"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setFieldValue("photo", file);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Administrative Details */}
                  <div className="card mb-3">
                    <div className="card-header fw-bold fs-16">
                      Administrative Details
                    </div>
                    <div className="card-body">
                      <div className="row mb-2">
                        <div className="col-md-3 mb-3">
                          <label className="form-label">Branch *</label>
                          <Field
                            as="select"
                            name="enrolledBranch"
                            className="form-select"
                          >
                            <option value="">Select</option>
                            {branchOptions.map((opt) => (
                              <option value={opt} key={opt}>
                                {opt}
                              </option>
                            ))}
                          </Field>
                          {touched.enrolledBranch && errors.enrolledBranch && (
                            <div className="text-danger">
                              {errors.enrolledBranch}
                            </div>
                          )}
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">Student Type *</label>
                          <Field
                            as="select"
                            name="studentType"
                            className="form-select"
                          >
                            <option value="">Select</option>
                            {studentTypeOptions.map((opt) => (
                              <option value={opt} key={opt}>
                                {opt}
                              </option>
                            ))}
                          </Field>
                          {touched.studentType && errors.studentType && (
                            <div className="text-danger">
                              {errors.studentType}
                            </div>
                          )}
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">Shift *</label>
                          <Field
                            as="select"
                            name="shift"
                            className="form-select"
                          >
                            <option value="">Select</option>
                            {shiftOptions.map((opt) => (
                              <option value={opt} key={opt}>
                                {opt}
                              </option>
                            ))}
                          </Field>
                          {touched.shift && errors.shift && (
                            <div className="text-danger">{errors.shift}</div>
                          )}
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">Enrolled By</label>
                          <Field
                            name="enrolledBy"
                            type="text"
                            className="form-control"
                            disabled
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">Enrollment Date</label>
                          <Field
                            name="enrollmentDate"
                            type="text"
                            className="form-control"
                            disabled
                          />
                        </div>

                        <div className="col-md-3 mb-3">
                          <label className="form-label">Batch *</label>
                          <Field
                            as="select"
                            name="batch"
                            className="form-select"
                          >
                            <option value="">Select</option>
                            {batchOptions.map((opt) => (
                              <option value={opt} key={opt}>
                                {opt}
                              </option>
                            ))}
                          </Field>
                          {touched.batch && errors.batch && (
                            <div className="text-danger">{errors.batch}</div>
                          )}
                        </div>
                      </div>
                      {/* Courses */}
                      <div className="row mb-2">
                        <div className="col-md-12 mb-3">
                          <label className="form-label">
                            Enrolled Courses *
                          </label>
                          <Select
                            mode="multiple"
                            className="course-select"
                            style={{ width: "100%" }}
                            value={values.enrolledCourses}
                            placeholder="Select courses"
                            onChange={(list: string[]) =>
                              setFieldValue("enrolledCourses", list)
                            }
                            optionLabelProp="label"
                            filterOption={(input, option) =>
                              ((option?.label as string) || "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                          >
                            {courses
                              ?.filter(
                                (course: any) => course.status === "published"
                              )
                              .map(
                                (course: {
                                  _id: string;
                                  courseTitle: string;
                                  courseThumbnailUrl?: string;
                                }) => (
                                  <Select.Option
                                    value={course._id}
                                    key={course._id}
                                    label={course.courseTitle}
                                  >
                                    <span>{course.courseTitle}</span>
                                  </Select.Option>
                                )
                              )}
                          </Select>
                          {touched.enrolledCourses &&
                            errors.enrolledCourses && (
                              <div className="text-danger">
                                {errors.enrolledCourses as string}
                              </div>
                            )}
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
                      <div className="row mb-2 align-items-center">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">If Guardian Is *</label>
                          <div>
                            {guardianRelationOptions.map((opt) => (
                              <label key={opt} style={{ marginRight: "1.5em" }}>
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
                            errors.guardian_relation && (
                              <div className="text-danger">
                                {errors.guardian_relation}
                              </div>
                            )}
                        </div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-md-3 mb-3">
                          <label className="form-label">Guardian Name *</label>
                          <Field
                            name="guardian_name"
                            type="text"
                            className="form-control"
                          />
                          {touched.guardian_name && errors.guardian_name && (
                            <div className="text-danger">
                              {errors.guardian_name}
                            </div>
                          )}
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">Guardian Phone *</label>
                          <Field
                            name="guardian_phone"
                            type="text"
                            className="form-control"
                          />
                          {touched.guardian_phone && errors.guardian_phone && (
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
                          <label className="form-label">Guardian Address</label>
                          <Field
                            name="guardian_address"
                            type="text"
                            className="form-control"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      className="btn btn-secondary px-5 py-2"
                      disabled={isSubmitting || loading}
                    >
                      {isSubmitting || loading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default StudentsDetails;
