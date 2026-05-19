import React from "react";
import { Formik, Field, Form as FormikForm, FieldArray } from "formik";
import * as Yup from "yup";
import { Modal, Button, Form } from "react-bootstrap";
import CustomSelect from "../../../core/common/commonSelect";

export type Choice = { label: string; isCorrect: boolean };

const questionTypeOptions = [
  { label: "Multiple choice", value: "1" },
  { label: "True or False", value: "2" },
];

const defaultChoice: Choice = { label: "", isCorrect: false };

const questionSchema = Yup.object().shape({
  question: Yup.string().required("Question is required"),
  questionType: Yup.object({
    label: Yup.string().required("Question type required"),
    value: Yup.string().required("Question type required"),
  }),
  choices: Yup.array()
    .of(
      Yup.object({
        label: Yup.string().required("Choice label is required"),
        isCorrect: Yup.boolean(),
      })
    )
    .min(2, "At least 2 choices required")
    .test(
      "at-least-one-correct",
      "At least one correct answer required",
      (choices) => Array.isArray(choices) && choices.some((c) => c.isCorrect)
    ),
});

export interface AddQuestionModalProps {
  show: boolean;
  mode: "create" | "edit";
  initialValues?: {
    question: string;
    questionType: { label: string; value: string };
    choices: Choice[];
  };
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: {
    question: string;
    questionType: { label: string; value: string };
    choices: Choice[];
  }) => Promise<boolean>; // parent returns true if operation is successful
}

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  show,
  mode,
  initialValues,
  loading,
  onClose,
  onSubmit,
}) => {
  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Formik
        initialValues={
          initialValues
            ? initialValues
            : {
                question: "",
                questionType: { label: "", value: "" },
                choices: [defaultChoice, defaultChoice],
              }
        }
        validationSchema={questionSchema}
        enableReinitialize={true}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          const success = await onSubmit(values);
          setSubmitting(false);
          if (success) {
            resetForm();
            onClose();
          }
        }}
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <FormikForm>
            <Modal.Header closeButton>
              <Modal.Title>
                {mode === "edit" ? "Edit Question" : "Add New Question"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {/* Question */}
              <Form.Group className="mb-3">
                <Form.Label>
                  Question <span className="text-danger">*</span>
                </Form.Label>
                <Field
                  name="question"
                  className="form-control"
                  placeholder="Enter question"
                />
                {touched.question && errors.question && (
                  <div className="text-danger">{errors.question}</div>
                )}
              </Form.Group>

              {/* Question Type */}
              <Form.Group className="mb-3">
                <Form.Label>
                  Question Type <span className="text-danger">*</span>
                </Form.Label>
                <CustomSelect
                  className="select"
                  options={questionTypeOptions}
                  value={
                    values.questionType.value
                      ? questionTypeOptions.find(
                          (o) => o.value === values.questionType.value
                        )
                      : null
                  }
                  onChange={(opt) => setFieldValue("questionType", opt)}
                />
                {touched.questionType?.value && errors.questionType && (
                  <div className="text-danger">
                    {(errors.questionType as any).value}
                  </div>
                )}
              </Form.Group>

              {/* Choices */}
              <h6 className="mb-3">Answer</h6>
              <FieldArray name="choices">
                {({ push, remove }) => (
                  <>
                    {values.choices.map((_, idx) => (
                      <div key={idx} className="mb-3 extra-choice-row">
                        <div className="d-flex align-items-end justify-content-between">
                          <div className="flex-fill">
                            <div className="d-flex align-items-center justify-content-between">
                              <Form.Label>
                                Choice {idx + 1}{" "}
                                <span className="text-danger">*</span>
                              </Form.Label>
                              <div className="form-check form-switch form-switch-end">
                                <label
                                  className="form-check-label"
                                  htmlFor={`switch-sm-choice-${idx}`}
                                >
                                  Correct Answer
                                </label>
                                <Field
                                  name={`choices.${idx}.isCorrect`}
                                  type="checkbox"
                                  className="form-check-input"
                                  id={`switch-sm-choice-${idx}`}
                                />
                              </div>
                            </div>
                            <Field
                              name={`choices.${idx}.label`}
                              className="form-control"
                              placeholder={`Choice ${idx + 1}`}
                            />
                            {/* Field-level error */}
                            {Array.isArray(errors.choices) &&
                              errors.choices[idx] &&
                              typeof errors.choices[idx] === "object" &&
                              (errors.choices[idx] as any).label && (
                                <div className="text-danger">
                                  {(errors.choices[idx] as any).label}
                                </div>
                              )}
                          </div>
                          {values.choices.length > 2 && (
                            <Button
                              variant="link"
                              className="delete-item ms-3"
                              onClick={() => remove(idx)}
                              style={{ color: "red" }}
                            >
                              <i className="isax isax-trash" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="link"
                      className="text-secondary d-inline-flex align-items-center fw-medium add-choice"
                      onClick={() => push({ label: "", isCorrect: false })}
                    >
                      + Add New
                    </Button>
                  </>
                )}
              </FieldArray>
              {/* Array-level error */}
              {typeof errors.choices === "string" && (
                <div className="alert alert-danger py-2">{errors.choices}</div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="outline-secondary"
                type="button"
                onClick={onClose}
                disabled={isSubmitting || loading}
                className="me-3"
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                type="submit"
                disabled={isSubmitting || loading}
              >
                {loading || isSubmitting
                  ? mode === "edit"
                    ? "Saving..."
                    : "Adding..."
                  : mode === "edit"
                  ? "Save Changes"
                  : "Add Question"}
              </Button>
            </Modal.Footer>
          </FormikForm>
        )}
      </Formik>
    </Modal>
  );
};

export default AddQuestionModal;
