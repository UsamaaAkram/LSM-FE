import dayjs from "dayjs";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DefaultEditor from "react-simple-wysiwyg";

import { toast } from "react-toastify";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import CustomSelect from "../../../core/common/commonSelect";
import {
  CourseLevel,
  CourseVideo,
} from "../../../core/common/selectOption/json/selectOption";
import { createCourse } from "../../../core/redux/courses"; // <- adjust path as needed
import { all_routes } from "../../router/all_routes";

import { TimePicker } from "antd";
import { useNavigate } from "react-router-dom";
// Helper type for errors
type ErrorState = { [key: string]: string };

const AddNewCourse: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const currentUser = useSelector((state: any) => state.auth.user);

  // Form state
  const [courseTitle, setCourseTitle] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [courseLevel, setCourseLevel] = useState<string | number>("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseThumbnail, setCourseThumbnail] = useState<File | null>(null);
  const [courseThumbnailUrl, setCourseThumbnailUrl] = useState("");
  const [courseVideoProvider, setCourseVideoProvider] = useState<
    string | number
  >("");
  const [courseVideoUrl, setCourseVideoUrl] = useState("");
  const [curriculum, setCurriculum] = useState<
    {
      topic: string;
      lessons: { name: string; videoUrl: string; description: string }[];
    }[]
  >([]);
  const [currentTopic, setCurrentTopic] = useState("");
  const [currentLesson, setCurrentLesson] = useState({
    name: "",
    videoUrl: "",
    description: "",
  });
  const [editTopicIdx, setEditTopicIdx] = useState<number | null>(null);
  const [editLessonIdx, setEditLessonIdx] = useState<{
    ti: number;
    li: number;
  } | null>(null);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<ErrorState>({});
  const route = all_routes;

  // Modal state
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(
    null
  );

  const [duration, setDuration] = useState<string>("");

  // Navigation
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };
  const handlePrev = () => setCurrentStep(currentStep - 1);

  // Validation logic
  const validateStep = (step: number): boolean => {
    let stepErrors: ErrorState = {};
    if (step === 1) {
      if (!courseTitle.trim())
        stepErrors.courseTitle = "Course Title is required";
      if (!courseCategory.trim())
        stepErrors.courseCategory = "Course Category is required";
      if (!duration) stepErrors.duration = "Course Duration is required";
      if (!courseLevel) stepErrors.courseLevel = "Course Level is required";
      if (!courseDescription.trim())
        stepErrors.courseDescription = "Course Description is required";
    } else if (step === 2) {
      if (!courseThumbnail && !courseThumbnailUrl)
        stepErrors.courseThumbnail = "Course Thumbnail is required";
      if (!courseVideoProvider)
        stepErrors.courseVideoProvider = "Course Video Provider is required";
      if (!courseVideoUrl.trim())
        stepErrors.courseVideoUrl = "Course Video URL is required";
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Helper: clear error for a key when input changes
  const handleChangeWithClearError =
    (key: keyof ErrorState, setter: (v: any) => void) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
      setter(e.target.value);
    };

  // Thumbnail file handler
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (errors.courseThumbnail)
      setErrors((prev) => ({ ...prev, courseThumbnail: "" }));
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCourseThumbnail(file);
      setCourseThumbnailUrl(URL.createObjectURL(file));
    }
  };

  // Curriculum topic modal handler
  const openTopicModalForEdit = (idx: number) => {
    setEditTopicIdx(idx);
    setCurrentTopic(curriculum[idx].topic);
    setShowTopicModal(true);
  };
  const handleAddTopic = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentTopic.trim()) return;
    // Edit topic
    if (editTopicIdx !== null) {
      const newCurriculum = curriculum.map((item, idx) =>
        idx === editTopicIdx ? { ...item, topic: currentTopic.trim() } : item
      );
      setCurriculum(newCurriculum);
      setEditTopicIdx(null);
    }
    // Add new topic
    else {
      setCurriculum([
        ...curriculum,
        { topic: currentTopic.trim(), lessons: [] },
      ]);
    }
    setCurrentTopic("");
    setShowTopicModal(false);
  };
  const handleDeleteTopic = (idx: number) => {
    setCurriculum(curriculum.filter((_, tIdx) => tIdx !== idx));
  };

  // Curriculum lesson modal handler
  const openLessonModalForEdit = (ti: number, li: number) => {
    setSelectedTopicIndex(ti);
    setEditLessonIdx({ ti, li });
    setCurrentLesson({ ...curriculum[ti].lessons[li] });
    setShowLessonModal(true);
  };
  const handleAddLesson = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentLesson.name.trim() || !currentLesson.videoUrl.trim()) return;
    if (selectedTopicIndex === null) return;
    // Edit lesson
    if (editLessonIdx) {
      const { ti, li } = editLessonIdx;
      const newCurriculum = curriculum.map((item, idx) => {
        if (idx === ti) {
          let updatedLessons = item.lessons.map((ell, ellIdx) =>
            ellIdx === li ? { ...currentLesson } : ell
          );
          return { ...item, lessons: updatedLessons };
        }
        return item;
      });
      setCurriculum(newCurriculum);
      setEditLessonIdx(null);
    }
    // Add new lesson
    else {
      const newCurriculum = curriculum.map((item, idx) =>
        idx === selectedTopicIndex
          ? { ...item, lessons: [...item.lessons, currentLesson] }
          : item
      );
      setCurriculum(newCurriculum);
    }
    setCurrentLesson({ name: "", videoUrl: "", description: "" });
    setShowLessonModal(false);
  };
  const handleDeleteLesson = (ti: number, li: number) => {
    setCurriculum(
      curriculum.map((item, idx) =>
        idx === ti
          ? { ...item, lessons: item.lessons.filter((_, lIdx) => lIdx !== li) }
          : item
      )
    );
  };
  const navigate = useNavigate();

  // Final submit handler
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: any) => state.courses);

  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    const courseObject = {
      courseTitle,
      courseCategory,
      courseLevel,
      courseDescription,
      courseThumbnail,
      courseThumbnailUrl: "",
      courseVideoProvider,
      courseVideoUrl,
      curriculum,
      notes,
      studentCount: 0,
      quizzesCount: 0,
      status: "pending",
      duration,
      createdBy: currentUser.userName,
    };

    // Call the thunk; returns a promise
    const resultAction = await dispatch(createCourse(courseObject) as any);
    if (createCourse.fulfilled.match(resultAction)) {
      // Success: show modal, navigate, reset, etc.
      toast.success("Course created successfully!");
      navigate(all_routes.instructorCourse);
    } else {
      // Show error: error state is already set in redux
      toast.error(resultAction.payload || error || "Failed to create course.");
    }
  };

  // WYSIWYG handlers
  function onDescriptionChange(e: any) {
    if (errors.courseDescription)
      setErrors((prev) => ({ ...prev, courseDescription: "" }));
    setCourseDescription(e.target.value);
  }
  function onNotesChange(e: any) {
    setNotes(e.target.value);
  }

  
  return (
    <>
      <Breadcrumb title="Add New Course" />
      <form onSubmit={handleSubmitCourse}>
        <div className="content">
          <div className="container mb-10">
            <div className="mb-4">
              <Link to={all_routes.instructorCourse} className="back-to-course">
                <i className="isax isax-arrow-left me-1" />
                Back to Courses
              </Link>
            </div>
            <div className="row">
              <div className="col-lg-10 mx-auto">
                <div className="add-course-item">
                  <div className="wizard">
                    <ul className="form-wizard-steps" id="progressbar2">
                      {[1, 2, 3, 4].map((step) => (
                        <li
                          key={step}
                          className={
                            currentStep === step
                              ? "progress-active"
                              : currentStep > step
                              ? "progress-activated"
                              : ""
                          }
                        >
                          <div className="profile-step">
                            <span className="dot-active mb-2">
                              <span className="number">0{step}</span>
                              <span className="tickmark">
                                <i className="fa-solid fa-check" />
                              </span>
                            </span>
                            <div className="step-section">
                              <p>
                                {step === 1
                                  ? "Course Information"
                                  : step === 2
                                  ? "Course Media"
                                  : step === 3
                                  ? "Curriculam"
                                  : "Additional information"}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="initialization-form-set">
                    {currentStep === 1 && (
                      <fieldset
                        className="form-inner wizard-form-card"
                        id="first"
                      >
                        <div className="title">
                          <h5>Basic Information</h5>
                        </div>
                        <div className="row">
                          <div className="col-md-12">
                            <div className="input-block">
                              <label className="form-label">
                                Course Title{" "}
                                <span className="text-danger ms-1">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={courseTitle}
                                onChange={handleChangeWithClearError(
                                  "courseTitle",
                                  setCourseTitle
                                )}
                              />
                              {errors.courseTitle && (
                                <div className="text-danger">
                                  {errors.courseTitle}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="input-block">
                              <label className="form-label">
                                Course Category{" "}
                                <span className="text-danger ms-1">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={courseCategory}
                                onChange={handleChangeWithClearError(
                                  "courseCategory",
                                  setCourseCategory
                                )}
                              />
                              {errors.courseCategory && (
                                <div className="text-danger">
                                  {errors.courseCategory}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="col-md-4">
                            <div className="input-block">
                              <label className="form-label">
                                Course Level{" "}
                                <span className="text-danger ms-1">*</span>
                              </label>
                              <CustomSelect
                                options={CourseLevel}
                                value={CourseLevel.find(
                                  (opt) => opt.value === courseLevel
                                )}
                                onChange={(selected) => {
                                  if (errors.courseLevel)
                                    setErrors((prev) => ({
                                      ...prev,
                                      courseLevel: "",
                                    }));
                                  setCourseLevel(String(selected.value));
                                }}
                              />
                              {errors.courseLevel && (
                                <div className="text-danger">
                                  {errors.courseLevel}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="input-block">
                              <label className="form-label">
                                Course Duration{" "}
                                <span className="text-danger ms-1">*</span>
                              </label>
                              <TimePicker
                                className="form-control timepicker"
                                value={
                                  duration ? dayjs(duration, "HH:mm:ss") : null
                                }
                                onChange={(val) => {
                                  if (errors.duration)
                                    setErrors((prev) => ({
                                      ...prev,
                                      duration: "",
                                    }));
                                  setDuration(
                                    val ? val.format("HH:mm:ss") : ""
                                  );
                                }}
                                format="HH:mm:ss"
                                placeholder="hh:mm:ss"
                              />
                              {errors.duration && (
                                <div className="text-danger">
                                  {errors.duration}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="col-md-12">
                            <div className="input-block">
                              <label className="form-label">
                                Course Description{" "}
                                <span className="text-danger ms-1">*</span>
                              </label>
                              <div className="summernote">
                                <DefaultEditor
                                  value={courseDescription}
                                  onChange={onDescriptionChange}
                                />
                                {errors.courseDescription && (
                                  <div className="text-danger">
                                    {errors.courseDescription}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="add-form-btn widget-next-btn submit-btn d-flex justify-content-end">
                          <div className="btn-left">
                            <Link
                              to="#"
                              className="btn main-btn next_btns"
                              onClick={(e) => {
                                e.preventDefault();
                                handleNext();
                              }}
                            >
                              Next{" "}
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </fieldset>
                    )}
                    {currentStep === 2 && (
                      <fieldset
                        className="form-inner wizard-form-card"
                        style={{ display: "block" }}
                      >
                        <div className="title">
                          <h5>Course Media</h5>
                          <p>
                            Intro Course overview provider type. (.mp4, YouTube,
                            Vimeo etc.)
                          </p>
                        </div>
                        <div className="row">
                          <div className="col-md-12">
                            <div className="input-block">
                              <div className="d-flex align-items-center gap-3 mb-3">
                                <label className="form-label">
                                  Course Thumbnail{" "}
                                  <span className="text-danger ms-1">*</span>
                                </label>
                                <div className="col-md-2 d-grid">
                                  <label
                                    htmlFor="file-upload"
                                    className="file-upload-btn text-center"
                                  >
                                    Upload File
                                  </label>
                                  <input
                                    type="file"
                                    id="file-upload"
                                    name="file"
                                    accept="image/jpeg, image/png, image/gif, image/webp"
                                    className="form-control"
                                    onChange={handleThumbnailChange}
                                  />
                                </div>
                              </div>
                              {courseThumbnailUrl && (
                                <img
                                  src={courseThumbnailUrl}
                                  alt="thumbnail"
                                  className="mt-2"
                                  style={{ height: "250px", width: "auto" }}
                                />
                              )}
                              {errors.courseThumbnail && (
                                <div className="text-danger">
                                  {errors.courseThumbnail}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="input-block-link">
                              <label className="form-label">
                                Course Video{" "}
                                <span className="text-danger ms-1">*</span>
                              </label>
                              <CustomSelect
                                options={CourseVideo}
                                className="select"
                                placeholder="Select"
                                value={CourseVideo.find(
                                  (opt) => opt.value === courseVideoProvider
                                )}
                                onChange={(selected) => {
                                  if (errors.courseVideoProvider)
                                    setErrors((prev) => ({
                                      ...prev,
                                      courseVideoProvider: "",
                                    }));
                                  setCourseVideoProvider(
                                    String(selected?.value ?? "")
                                  );
                                }}
                              />
                              {errors.courseVideoProvider && (
                                <div className="text-danger">
                                  {errors.courseVideoProvider}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-md-8">
                            <div className="input-block-link">
                              <label className="form-label">&nbsp;</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="External URL Link"
                                value={courseVideoUrl}
                                onChange={handleChangeWithClearError(
                                  "courseVideoUrl",
                                  setCourseVideoUrl
                                )}
                              />
                              {errors.courseVideoUrl && (
                                <div className="text-danger">
                                  {errors.courseVideoUrl}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="add-form-btn widget-next-btn submit-btn">
                          <div className="btn-left">
                            <Link
                              to="#"
                              className="btn btn-light main-btn prev_btns d-flex align-items-center"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePrev();
                              }}
                            >
                              <i className="isax isax-arrow-left-2 me-1" /> Prev
                            </Link>
                          </div>
                          <div className="btn-left">
                            <Link
                              to="#"
                              className="btn btn-secondary main-btn next_btns d-flex align-items-center"
                              onClick={(e) => {
                                e.preventDefault();
                                handleNext();
                              }}
                            >
                              Next{" "}
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </fieldset>
                    )}
                    {currentStep === 3 && (
                      <fieldset
                        className="form-inner wizard-form-card"
                        style={{ display: "block" }}
                      >
                        <div className="title">
                          <div className="row align-items-center row-gap-2">
                            <div className="col-md-6">
                              <h5 className="mb-0">Curriculum</h5>
                            </div>
                            <div className="col-md-6 text-md-end">
                              <button
                                type="button"
                                className="btn add-edit-btn d-inline-flex align-items-center"
                                onClick={() => {
                                  setEditTopicIdx(null);
                                  setCurrentTopic("");
                                  setShowTopicModal(true);
                                }}
                              >
                                <i className="isax isax-add-circle5 me-1" /> Add
                                New Topic
                              </button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div
                            className="accordions-items-seperate"
                            id="accordionSpacingExample"
                          >
                            {curriculum.length ? (
                              curriculum.map((topic, tIdx) => (
                                <div key={tIdx} className="accordion-item">
                                  <h2
                                    className="accordion-header"
                                    id={`headingSpacing${tIdx}`}
                                  >
                                    <button
                                      type="button"
                                      className="accordion-button collapsed"
                                      data-bs-toggle="collapse"
                                      data-bs-target={`#Spacing${tIdx}`}
                                      aria-expanded="false"
                                      aria-controls={`Spacing${tIdx}`}
                                    >
                                      <span className="d-flex align-items-center mb-0">
                                        <i className="isax isax-menu-15 me-2" />
                                        {topic.topic}
                                      </span>
                                    </button>
                                  </h2>
                                  <div
                                    id={`Spacing${tIdx}`}
                                    className="accordion-collapse collapse show"
                                    aria-labelledby={`headingSpacing${tIdx}`}
                                    data-bs-parent="#accordionSpacingExample"
                                  >
                                    <div className="accordion-body">
                                      {topic.lessons.map((lesson, lIdx) => (
                                        <div
                                          key={lIdx}
                                          className="bg-white p-2 border rounded-3 mb-3"
                                        >
                                          <div className="d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center">
                                              <span>
                                                <i className="isax isax-play-circle5 text-success fs-24 me-1" />
                                              </span>
                                              <p className="fw-medium text-gray-5 mb-0">
                                                {lesson.name}
                                              </p>
                                            </div>
                                            <div className="d-flex align-items-center">
                                              <Link
                                                to="#"
                                                className="edit-btn1"
                                                onClick={() =>
                                                  openLessonModalForEdit(
                                                    tIdx,
                                                    lIdx
                                                  )
                                                }
                                              >
                                                <i className="isax isax-edit-25 fs-16" />
                                              </Link>
                                              <Link
                                                to="#"
                                                className="delete-btn1"
                                                onClick={() =>
                                                  handleDeleteLesson(tIdx, lIdx)
                                                }
                                              >
                                                <i className="isax isax-trash fs-16" />
                                              </Link>
                                            </div>
                                          </div>
                                          {/* Show description at the bottom */}
                                          {lesson.description && (
                                            <div
                                              className="mt-2 ps-5 text-muted"
                                              style={{ fontSize: "14px" }}
                                            >
                                              {lesson.description}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                      <div className="d-flex align-items-center justify-content-between mt-2">
                                        <div className="d-flex align-items-center gap-2 flex-wrap w-100">
                                          <button
                                            type="button"
                                            className="btn add-edit-btn d-inline-flex btn-sm  align-items-center"
                                            onClick={() => {
                                              setSelectedTopicIndex(tIdx);
                                              setEditLessonIdx(null);
                                              setCurrentLesson({
                                                name: "",
                                                videoUrl: "",
                                                description: "",
                                              });
                                              setShowLessonModal(true);
                                            }}
                                          >
                                            <i className="isax isax-add-circle5 me-2" />
                                            Add Lesson
                                          </button>
                                          <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm ms-2"
                                            onClick={() =>
                                              handleDeleteTopic(tIdx)
                                            }
                                          >
                                            Delete Topic
                                          </button>
                                          <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() =>
                                              openTopicModalForEdit(tIdx)
                                            }
                                          >
                                            Edit Topic
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-danger py-3">
                                Add at least one topic
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="add-form-btn widget-next-btn submit-btn">
                          <div className="btn-left">
                            <Link
                              to="#"
                              className="btn btn-light main-btn prev_btns"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePrev();
                              }}
                            >
                              <i className="isax isax-arrow-left-2 me-1" /> Prev
                            </Link>
                          </div>
                          <div className="btn-left">
                            <Link
                              to="#"
                              className="btn btn-secondary main-btn next_btns"
                              onClick={(e) => {
                                e.preventDefault();
                                handleNext();
                              }}
                            >
                              Next{" "}
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </fieldset>
                    )}
                    {currentStep === 4 && (
                      <fieldset
                        className="form-inner wizard-form-card"
                        style={{ display: "block" }}
                      >
                        <div className="title">
                          <div className="row align-items-center row-gap-3">
                            <div className="col-md-9">
                              <h5 className="mb-0">Notes</h5>
                            </div>
                          </div>
                        </div>
                        <div className="pb-3 border-bottom mb-3">
                          <div className="summernote">
                            <DefaultEditor
                              value={notes}
                              onChange={onNotesChange}
                            />
                          </div>
                        </div>
                        <div className="add-form-btn widget-next-btn submit-btn">
                          <div className="btn-left">
                            <Link
                              to="#"
                              className="btn btn-light main-btn prev_btns"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePrev();
                              }}
                            >
                              <i className="isax isax-arrow-left-2 me-1" /> Prev
                            </Link>
                          </div>
                          <div className="btn-left">
                            <button
                              type="submit"
                              className="btn btn-secondary main-btn next_btns"
                              // data-bs-toggle="modal"
                              // data-bs-target="#success"
                              disabled={loading}
                            >
                              {loading ? "Submitting..." : "Submit Course"}
                            </button>
                          </div>
                        </div>
                      </fieldset>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Add/Edit topic modal */}
      <div
        className={`modal fade${showTopicModal ? " show d-block" : ""}`}
        style={showTopicModal ? { background: "rgba(0,0,0,0.2)" } : {}}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5>
                {editTopicIdx !== null ? "Edit Topic Name" : "Topic Name"}
              </h5>
              <button
                type="button"
                className="btn-close custom-btn-close"
                aria-label="Close"
                onClick={() => {
                  setShowTopicModal(false);
                  setEditTopicIdx(null);
                }}
              >
                <i className="isax isax-close-circle5" />
              </button>
            </div>
            <form onSubmit={handleAddTopic}>
              <div className="modal-body">
                <div className="input-block">
                  <label className="form-label">
                    Add Name<span className="text-danger ms-1">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentTopic}
                    onChange={(e) => setCurrentTopic(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn me-2 btn-light"
                  onClick={() => {
                    setShowTopicModal(false);
                    setEditTopicIdx(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-secondary">
                  {editTopicIdx !== null ? "Save Changes" : "Add New"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Add/Edit lesson modal */}
      <div
        className={`modal fade${showLessonModal ? " show d-block" : ""}`}
        style={showLessonModal ? { background: "rgba(0,0,0,0.2)" } : {}}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5>{editLessonIdx ? "Edit Lesson" : "New Lesson"}</h5>
              <button
                type="button"
                className="btn-close custom-btn-close"
                aria-label="Close"
                onClick={() => {
                  setShowLessonModal(false);
                  setEditLessonIdx(null);
                }}
              >
                <i className="isax isax-close-circle5" />
              </button>
            </div>
            <form onSubmit={handleAddLesson}>
              <div className="modal-body">
                <div className="input-block mb-4">
                  <label className="form-label">
                    Add Lesson<span className="text-danger ms-1">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentLesson.name}
                    onChange={(e) =>
                      setCurrentLesson({
                        ...currentLesson,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="input-block mb-4">
                  <label className="form-label">
                    Video link<span className="text-danger ms-1">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentLesson.videoUrl}
                    onChange={(e) =>
                      setCurrentLesson({
                        ...currentLesson,
                        videoUrl: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="input-block mb-4">
                  <label className="form-label">Course Description</label>
                  <textarea
                    className="form-control"
                    value={currentLesson.description}
                    onChange={(e) =>
                      setCurrentLesson({
                        ...currentLesson,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn me-2 btn-light"
                  onClick={() => {
                    setShowLessonModal(false);
                    setEditLessonIdx(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-secondary">
                  {editLessonIdx ? "Save Changes" : "Add New"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Success modal */}
      <div className="modal fade modal-default" id="success">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body p-4">
              <div className="text-center">
                <div className="text-success h1 mb-2">
                  <i className="isax isax-tick-circle5" />
                </div>
                <h5 className="mb-2">Congratulations! Course Submitted</h5>
                <p className="mb-3">
                  You’ve successfully Submitted the Course &amp; its under the
                  review, Once the course is reviewed by the reviewer it will go
                  live.
                </p>
                <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                  <Link
                    to={route.instructorCourse}
                    className="btn btn-secondary"
                  >
                    <i className="isax isax-arrow-left-2 me-1" />
                    Back to Dashboard
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

export default AddNewCourse;
