import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { ErrorMessage, Field, Form, Formik, type FormikHelpers } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import CustomSelect from "../../../core/common/commonSelect";
import Table from "../../../core/common/dataTable/index";
import InstructorSidebar from "../common/instructorSidebar";
import ProfileCard from "../common/profileCard";

// Redux imports
import { toast } from "react-toastify";
import {
  createAssignment,
  deleteAssignment,
  fetchAssignmentById,
  fetchAssignments,
  searchAssignments,
  updateAssignment,
} from "../../../core/redux/assignmentSlice";
import { fetchCourses } from "../../../core/redux/courses";
import StudentSubmissionModule from "./StudentSubmissionModule";

// Constants
const Status = [
  { label: "Published", value: "Published" },
  { label: "Draft", value: "Draft" },
];

const initialForm: {
  courseID: string;
  title: string;
  description: string;
  instructions: string;
  lastDate: Dayjs | null;
  status: string;
} = {
  courseID: "",
  title: "",
  description: "",
  instructions: "",
  lastDate: null,
  status: "",
};

const assignmentSchema = Yup.object().shape({
  courseID: Yup.string().required("Course is required"),
  title: Yup.string().required("Title is required"),
  instructions: Yup.string().required("Instructions are required"),
  status: Yup.string().required("Status is required"),
  lastDate: Yup.date().nullable().required("Due date is required"),
  description: Yup.string().required("Description is required"),
});

// Component
const InstructorAssignment = () => {
  const dispatch = useDispatch();

  // Redux state selectors
  const assignments =
    useSelector((state: any) => state.assignment.assignments) || [];
  const assignmentByID =
    useSelector((state: any) => state.assignment.assignment) || {};
  const courses = useSelector((state: any) => state.courses.courses) || [];
  const error = useSelector((state: any) => state.assignment.error);
  const loading = useSelector((state: any) => state.assignment.loading);

  // Form/UI state
  const [form, setForm] = useState(initialForm);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Memoized Course dropdown options
  const Course = useMemo(
    () =>
      courses.map((item: any) => ({
        label: item.courseTitle,
        value: item._id,
      })),
    [courses]
  );

  useEffect(() => {
    dispatch(fetchAssignments() as any);
    dispatch(fetchCourses({}) as any);
  }, [dispatch]);

  useEffect(() => {
    if (search || filterStatus) {
      const query: { search?: string; status?: string } = {};
      if (search) query.search = search;
      if (filterStatus) query.status = filterStatus;
      dispatch(searchAssignments(query) as any);
    } else {
      dispatch(fetchAssignments() as any);
    }
    dispatch(fetchCourses({}) as any);
  }, [search, filterStatus, dispatch]);

  // Get initial values for form (formik)
  const getInitialValues = () => ({
    courseID: form.courseID,
    title: form.title,
    description: form.description,
    instructions: form.instructions,
    lastDate: form.lastDate ?? null,
    status: form.status,
  });

  // Formik form submit handler
  const handleFormikSubmit = async (
    values: typeof initialForm,
    helpers: FormikHelpers<typeof initialForm>
  ) => {
    const { setSubmitting, resetForm } = helpers;
    const payload = {
      ...values,
      lastDate: values.lastDate
        ? dayjs(values.lastDate).toISOString()
        : undefined,
    };

    const action: any =
      isEditMode && currentId
        ? updateAssignment({ id: currentId, data: payload })
        : createAssignment(payload);

    try {
      const result = await dispatch(action);
      if (result.type && result.type.endsWith("/rejected")) {
        toast.error(
          error ||
            `Error ${
              isEditMode ? "updating" : "creating"
            } assignment. Please try again.`
        );
      } else {
        toast.success(
          `Assignment ${isEditMode ? "updated" : "created"} successfully!`
        );
        dispatch(fetchAssignments() as any);
        resetForm();
        setCurrentId(null);
        setIsEditMode(false);
        (window as any).bootstrap?.Modal.getOrCreateInstance(
          document.getElementById(
            isEditMode ? "edit_assignment" : "add_assignment"
          )
        )?.hide();
      }
    } catch (err) {
      toast.error(
        `Unexpected error ${isEditMode ? "updating" : "creating"} assignment.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Helpers
  const findCourse = (val: string) =>
    Course.find((opt: any) => opt.value === val);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value);
 
  const getModalContainer = () =>
    document.getElementById(
      isEditMode ? "edit_assignment" : "add_assignment"
    ) || document.body;

  // Open Edit Modal
  const handleEditOpen = (record: any) => {
    setCurrentId(record._id);
    setIsEditMode(true);
    setForm({
      courseID: record.courseID || "",
      title: record.title || "",
      description: record.description || "",
      instructions: record.instructions || "",
      lastDate: record.lastDate ? dayjs(record.lastDate) : null,
      status: record.status || "",
    });
  };

  // Delete Handler
  const handleDelete = () => {
    if (!deleteId) return;
    dispatch(deleteAssignment(deleteId) as any).then(() => {
      setDeleteId(null);
      (window as any).bootstrap?.Modal.getOrCreateInstance(
        document.getElementById("delete_modal")
      )?.hide();
      toast.success("Assignment deleted successfully!");
      dispatch(fetchAssignments() as any);
    });
  };

  // Table columns
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      render: (text: string, record: any) => (
        <div style={{ maxWidth: "200px" }}>
          <h6 className="mb-1 text-truncate">
            <Link
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#view_assignment"
              onClick={() => dispatch(fetchAssignmentById(record._id) as any)}
            >
              {text}
            </Link>
          </h6>
        </div>
      ),
      sorter: (a: any, b: any) => a.title.length - b.title.length,
    },
    {
      title: "Course Name",
      dataIndex: "courseID",
      render: (courseID: string) => {
        const found = findCourse(courseID);
        return found ? found.label : "";
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: string) => (
        <span
          className={`badge badge-sm ${
            text === "Draft"
              ? "bg-skyblue"
              : text === "Pending"
              ? "bg-info"
              : "bg-success"
          } d-inline-flex align-items-center me-1`}
        >
          <i className="fa-solid fa-circle fs-5 me-1" />
          {text}
        </span>
      ),
      sorter: (a: any, b: any) => a.status.length - b.status.length,
    },
    {
      title: "Due",
      dataIndex: "lastDate",
      render: (value: string) =>
        value ? dayjs(value).format("YYYY-MM-DD") : "",
      sorter: (a: any, b: any) =>
        dayjs(a.lastDate).unix() - dayjs(b.lastDate).unix(),
    },
    {
      title: "Action",
      dataIndex: "",
      render: (_: any, record: any) => (
        <div className="d-flex align-items-center">
          <Link
            to="#"
            className="d-inline-flex fs-14 me-1 action-icon"
            data-bs-toggle="modal"
            data-bs-target="#edit_assignment"
            onClick={() => handleEditOpen(record)}
          >
            <i className="isax isax-edit-2"></i>
          </Link>
          <Link
            to="#"
            className="d-inline-flex fs-14 action-icon"
            data-bs-toggle="modal"
            data-bs-target="#delete_modal"
            onClick={() => setDeleteId(record._id)}
          >
            <i className="isax isax-trash"></i>
          </Link>
        </div>
      ),
    },
  ];

  // Formik Modal
  const renderAssignmentModal = (modalId: string, modalTitle: string) => (
    <div className="modal fade" id={modalId}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="fw-bold">{modalTitle}</h5>
            <button
              type="button"
              className="btn-close custom-btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={() => {
                setCurrentId(null);
                setIsEditMode(false);
              }}
            >
              <i className="isax isax-close-circle5" />
            </button>
          </div>
          <Formik
            enableReinitialize
            initialValues={getInitialValues()}
            validationSchema={assignmentSchema}
            onSubmit={handleFormikSubmit}
          >
            {({ isSubmitting, setFieldValue, values, resetForm }) => (
              <Form>
                <div className="modal-body pb-0">
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <label className="form-label">
                        Course <span className="text-danger">*</span>
                      </label>
                      <CustomSelect
                        className="select"
                        options={Course}
                        modal={true}
                        value={Course.find(
                          (opt: any) => opt.value === values.courseID
                        )}
                        onChange={(val) => setFieldValue("courseID", val.value)}
                      />
                      <ErrorMessage
                        name="courseID"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">
                        Assignment Title <span className="text-danger">*</span>
                      </label>
                      <Field
                        type="text"
                        name="title"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="title"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Description</label>
                      <Field
                        as="textarea"
                        name="description"
                        className="form-control"
                        placeholder="Enter Description"
                      />
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">
                        Instructions <span className="text-danger">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="instructions"
                        rows={4}
                        className="form-control"
                      />
                      <ErrorMessage
                        name="instructions"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Last Date <span className="text-danger">*</span>
                      </label>
                      <DatePicker
                        className="form-control datetimepicker"
                        getPopupContainer={getModalContainer}
                        value={values.lastDate}
                        onChange={(date) =>
                          setFieldValue(
                            "lastDate",
                            date && typeof date !== "string" ? date : null
                          )
                        }
                        placeholder="dd/mm/yyyy"
                      />
                      <ErrorMessage
                        name="lastDate"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Status <span className="text-danger">*</span>
                      </label>
                      <CustomSelect
                        className="select"
                        options={Status}
                        modal={true}
                        value={Status.find(
                          (opt) => opt.value === values.status
                        )}
                        onChange={(val) => setFieldValue("status", val.value)}
                      />
                      <ErrorMessage
                        name="status"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn bg-gray-100 rounded-pill me-2"
                    type="button"
                    data-bs-dismiss="modal"
                    onClick={() => {
                      resetForm();
                      setCurrentId(null);
                      setIsEditMode(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-secondary rounded-pill"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );

  // Optimization: Use assignmentByID for view_assignment modal (fetched by clicking title link)
  return (
    <>
      <Breadcrumb title="Assignments" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9 course-watch-section">
              <div className="course-watch-content px-0">
                <ul
                  className="nav-tabs mb-4 nav-justified border-0 nav-style-1 d-sm-flex d-block"
                  role="tablist"
                >
                  <li className="nav-item active">
                    <Link
                      className="btn nav-link active"
                      data-bs-toggle="tab"
                      role="tab"
                      to="#assignment"
                      aria-selected="false"
                      style={{
                        width: "160px",
                      }}
                    >
                      My Assignments
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="btn nav-link"
                      data-bs-toggle="tab"
                      role="tab"
                      to="#assignments"
                      aria-selected="true"
                      style={{
                        width: "190px",
                      }}
                    >
                      Student Submissions
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="tab-content">
                <div
                  className="tab-pane active show"
                  id="assignment"
                  role="tabpanel"
                >
                  <div className="row">
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by title"
                        value={search}
                        onChange={handleSearch}
                      />
                    </div>
                    <div className="col-md-8 mb-3 d-flex justify-content-end gap-3 align-items-center">
                      <select
                        value={filterStatus || ""}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="form-select w-auto"
                      >
                        <option value="">All</option>
                        {Status?.map((c: any) => (
                          <option value={c.value} key={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>

                      <Link
                        to="#"
                        className="btn btn-secondary"
                        data-bs-toggle="modal"
                        data-bs-target="#add_assignment"
                        onClick={() => {
                          setForm(initialForm);
                          setIsEditMode(false);
                          setCurrentId(null);
                        }}
                      >
                        <i className="isax isax-add-circle me-1" />
                        Add
                      </Link>
                    </div>
                  </div>
                  {loading ? (
                    <div className="text-center py-5">
                      <span className="spinner-border"></span>
                    </div>
                  ) : (
                    <Table
                      dataSource={assignments}
                      columns={columns}
                      Search={false}
                    />
                  )}
                </div>

                <div className="tab-pane" id="assignments" role="tabpanel">
                  <StudentSubmissionModule />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {renderAssignmentModal("add_assignment", "Add New Assignment")}
      {renderAssignmentModal("edit_assignment", "Edit Assignment")}
      {/* View assignments */}
      <div className="modal fade" id="view_assignment">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="fw-bold">Assignment Details</h5>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="isax isax-close-circle5" />
              </button>
            </div>
            <div className="modal-body">
              {loading ? (
                <div className="text-center py-5">
                  <span className="spinner-border"></span>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h6 className="mb-1">Course</h6>
                    <p>
                      {findCourse(assignmentByID.courseID)
                        ? findCourse(assignmentByID.courseID)?.label
                        : assignmentByID.courseID || ""}
                    </p>
                  </div>
                  <div className="mb-4">
                    <h6 className="mb-1">Title</h6>
                    <p>{assignmentByID.title || ""}</p>
                  </div>
                  <div className="mb-4">
                    <h6 className="mb-1">Description</h6>
                    <p>{assignmentByID.description || ""}</p>
                  </div>
                  <div className="mb-4">
                    <h6 className="mb-1">Instructions</h6>
                    <p>{assignmentByID.instructions || ""}</p>
                  </div>
                  <div className="mb-4">
                    <h6 className="mb-1">Last Date</h6>
                    <p>
                      {assignmentByID.lastDate
                        ? dayjs(assignmentByID.lastDate).format("DD MMM YYYY")
                        : ""}
                    </p>
                  </div>
                  <div className="mb-3">
                    <h6 className="mb-1">Status</h6>
                    <span
                      className={`badge badge-sm ${
                        assignmentByID.status === "Draft"
                          ? "bg-skyblue"
                          : assignmentByID.status === "Pending"
                          ? "bg-info"
                          : "bg-success"
                      } d-inline-flex align-items-center me-1`}
                    >
                      <i className="fa-solid fa-circle fs-5 me-1" />
                      {assignmentByID.status}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Delete Modal */}
      <div className="modal fade" id="delete_modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center custom-modal-body">
              <span className="avatar avatar-lg bg-danger-transparent rounded-circle mb-2">
                <i className="isax isax-trash fs-24 text-danger" />
              </span>
              <div>
                <h4 className="mb-2">Delete Assignment</h4>
                <p className="mb-3">
                  Are you sure you want to delete this assignment?
                </p>
                <div className="d-flex align-items-center justify-content-center">
                  <Link
                    to="#"
                    className="btn bg-gray-100 rounded-pill me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <Link
                    to="#"
                    className="btn btn-secondary rounded-pill"
                    onClick={handleDelete}
                  >
                    Yes, Delete
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorAssignment;
