import { DatePicker } from "antd";
import dayjs from "dayjs";
import { Field, Formik, Form as FormikForm } from "formik";
import React, { useEffect } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";

import {
  shiftOptions,
  studentTypeOptions,
} from "../../../core/common/common-list";
import CustomSelect from "../../../core/common/commonSelect";
import { fetchCourses } from "../../../core/redux/courses";

type FilterValues = {
  batch: string;
  enrolledBranch: string;
  enrolledBy: string;
  studentType: string;
  shift: string;
  enrollmentDate: string;
  course: string;
};

const validationSchema = Yup.object().shape({
  batch: Yup.string(),
  enrolledBranch: Yup.string(),
  enrolledBy: Yup.string(),
  studentType: Yup.string(),
  shift: Yup.string(),
  course: Yup.string(),
  //   enrollmentDate: Yup.string().nullable()
});

interface StudentFilterModalProps {
  show: boolean;
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
  onReset: () => void;
  filters: Partial<FilterValues>;
  initialValues?: Partial<FilterValues>;
}

const StudentFilterModal: React.FC<StudentFilterModalProps> = ({
  show,
  onClose,
  onApply,
  onReset,
  filters,
  initialValues = {},
}) => {
  const dispatch = useDispatch();
  const { courses } = useSelector((state: any) => state.courses || {});

  useEffect(() => {
    dispatch(fetchCourses({ status: "published" }) as any);
  }, [dispatch]);

  const courseOptions = (courses || []).map((c: any) => ({
    label: c.courseTitle,
    value: c._id,
  }));

  return (
    <Modal show={show} onHide={onClose} centered>
      <Formik
        initialValues={{
          batch: filters?.batch || "",
          enrolledBranch: filters?.enrolledBranch || "",
          enrolledBy: filters?.enrolledBy || "",
          studentType: filters?.studentType || "",
          shift: filters?.shift || "",
          enrollmentDate: filters?.enrollmentDate || "",
          course: filters?.course || "",
          ...initialValues,
        }}
        validationSchema={validationSchema}
        onSubmit={(values: any) => {
          onApply(values);
          onClose();
        }}
      >
        {({ setFieldValue, values }) => {
          return (
            <FormikForm>
              <Modal.Header closeButton>
                <Modal.Title>Filter Students</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Batch</Form.Label>
                  <Field
                    name="batch"
                    type="text"
                    className="form-control"
                    placeholder="e.g. 1, 2, 3 ... 7"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Branch</Form.Label>
                  <Field
                    name="enrolledBranch"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dunyapur, Bahawalpur"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Enrolled By</Form.Label>
                  <Field
                    name="enrolledBy"
                    type="text"
                    className="form-control"
                    placeholder="Enter email"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Enrolled Date</Form.Label>
                  <DatePicker
                    style={{ width: "100%" }}
                    value={
                      values.enrollmentDate
                        ? dayjs(values.enrollmentDate)
                        : null
                    }
                    onChange={(_date, dateString) => {
                      setFieldValue("enrollmentDate", dateString);
                    }}
                    format="YYYY-MM-DD"
                    className="form-control"
                    placeholder="Select enrollment date"
                    getPopupContainer={(trigger) =>
                      trigger.parentElement
                        ? trigger.parentElement
                        : document.body
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Course</Form.Label>
                  <CustomSelect
                    modal
                    options={courseOptions}
                    value={
                      courseOptions.find(
                        (opt: any) => opt.value === values.course
                      ) || null
                    }
                    placeholder="Search course..."
                    onChange={(selected) =>
                      setFieldValue("course", selected.value)
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Student Type</Form.Label>
                  <Field as="select" name="studentType" className="form-select">
                    <option value="">All</option>
                    {studentTypeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Field>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Shift</Form.Label>
                  <Field as="select" name="shift" className="form-select">
                    <option value="">All</option>
                    {shiftOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Field>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer className="d-flex justify-content-between">
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    onReset();
                    onClose();
                  }}
                >
                  Reset
                </Button>
                <Button variant="secondary" type="submit">
                  Filter
                </Button>
              </Modal.Footer>
            </FormikForm>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default StudentFilterModal;
