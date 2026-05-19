import { DatePicker } from "antd";
import dayjs from "dayjs";
import { Field, Formik, Form as FormikForm } from "formik";
import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import * as Yup from "yup";

import {
  batchOptions,
  branchOptions,
  shiftOptions,
  studentTypeOptions,
} from "../../../core/common/common-list";

type FilterValues = {
  batch: string;
  enrolledBranch: string;
  enrolledBy: string;
  studentType: string;
  shift: string;
  enrollmentDate: string;
};

const validationSchema = Yup.object().shape({
  batch: Yup.string(),
  enrolledBranch: Yup.string(),
  enrolledBy: Yup.string(),
  studentType: Yup.string(),
  shift: Yup.string(),
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
                  <Field as="select" name="batch" className="form-select">
                    <option value="">All</option>
                    {batchOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Field>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Branch</Form.Label>
                  <Field
                    as="select"
                    name="enrolledBranch"
                    className="form-select"
                  >
                    <option value="">All</option>
                    {branchOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Field>
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
