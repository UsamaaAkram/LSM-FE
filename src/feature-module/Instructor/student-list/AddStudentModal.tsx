import React, { useState } from "react";
import { Formik, Field, Form as FormikForm } from "formik";
import { Modal, Button, Form } from "react-bootstrap";
import * as Yup from "yup";

// Password visibility helpers
const EyeIcon = ({ onClick, show }: { onClick: () => void; show: boolean }) => (
  <span
    onClick={onClick}
    style={{
      cursor: "pointer",
      position: "absolute",
      right: 10,
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: 20,
      color: "#888",
    }}
  >
    {show ? (
      <i className="isax isax-eye-slash" />
    ) : (
      <i className="isax isax-eye" />
    )}
  </span>
);

const validationSchema = Yup.object().shape({
  userName: Yup.string().required("User Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Minimum 8 characters")
    .required("Password is required"),
  role: Yup.string().required("Required"),
});

export interface AddStudentModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
  loading?: boolean;
}
const AddStudentModal: React.FC<AddStudentModalProps> = ({
  show,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [eye, setEye] = useState(true);

  return (
    <Modal show={show} onHide={onClose} centered>
      <Formik
        initialValues={{
          userName: "",
          email: "",
          role: "student",
          password: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
        await onSubmit(values);
        }}
      >
        {({ errors, touched }) => (
          <FormikForm>
            <Modal.Header closeButton>
              <Modal.Title>Add Student</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3 position-relative">
                <Form.Label>
                  User Name <span className="text-danger">*</span>
                </Form.Label>
                <Field
                  name="userName"
                  className="form-control"
                  placeholder="Enter user name"
                />
                {touched.userName && errors.userName && (
                  <div className="text-danger">{errors.userName}</div>
                )}
              </Form.Group>
              <Form.Group className="mb-3 position-relative">
                <Form.Label>
                  Email <span className="text-danger">*</span>
                </Form.Label>
                <Field
                  name="email"
                  className="form-control"
                  type="email"
                  placeholder="Enter email"
                />
                {touched.email && errors.email && (
                  <div className="text-danger">{errors.email}</div>
                )}
              </Form.Group>
              <Form.Group className="mb-3 position-relative">
                <Form.Label>
                  New Password <span className="text-danger">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Field
                    name="password"
                    className="form-control"
                    type={eye ? "password" : "text"}
                    placeholder="Enter password"
                  />
                  <EyeIcon onClick={() => setEye((e) => !e)} show={eye} />
                </div>
                {touched.password && errors.password && (
                  <div className="text-danger">{errors.password}</div>
                )}
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
              <Button variant="outline-secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="secondary" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Student"}
              </Button>
            </Modal.Footer>
          </FormikForm>
        )}
      </Formik>
    </Modal>
  );
};

export default AddStudentModal;
