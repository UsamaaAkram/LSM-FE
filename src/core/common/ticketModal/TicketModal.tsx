import React, { useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import CustomSelect from "../commonSelect";
import DefaultEditor from "react-simple-wysiwyg";

import {
  Category,
  Priority,
} from "../selectOption/json/selectOption";
import ImageGlobal from "../ImageGlobal/ImageGlobal";

type OptionType = { label: string; value: string | number };

const statusOptions: OptionType[] = [
  { label: "Opened", value: "Opened" },
  { label: "Closed", value: "Closed" },
  { label: "Inprogress", value: "Inprogress" },
];

interface TicketFormValues {
  Subject: string;
  Category: OptionType | null;
  Priority: OptionType | null;
  Status: OptionType | null;
  Description: string;
  Attachments: File[] | null | string;
}

const TicketSchema = Yup.object().shape({
  Subject: Yup.string().required("Subject is required"),
  Category: Yup.object().nullable().required("Category is required"),
  Priority: Yup.object().nullable().required("Priority is required"),
  Status: Yup.object().nullable().required("Status is required"),
  Description: Yup.string().required("Description is required"),
});

interface TicketModalProps {
  show: boolean;
  mode: "add" | "edit";
  initialValues?: TicketFormValues;
  loading: boolean;
  attachmentPreviews?: string[];
  onClose: () => void;
  onSubmit: (values: TicketFormValues, resetForm: () => void) => Promise<void>;
  onAttachmentChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: any
  ) => void;
}

const TicketModal: React.FC<TicketModalProps> = ({
  show,
  loading,
  mode,
  initialValues,
  attachmentPreviews = [],
  onClose,
  onSubmit,
  onAttachmentChange,
}) => {
  // Reset file input when modal closes (Formik controlled)
  useEffect(() => {
    if (!show) {
      const input = document.getElementById(
        "ticket-file-input"
      ) as HTMLInputElement | null;
      if (input) input.value = "";
    }
  }, [show]);

  return (
    <div
      className={`modal fade${show ? " show d-block" : ""}`}
      tabIndex={-1}
      style={show ? { background: "rgba(0,0,0,0.18)" } : {}}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <Formik
            initialValues={
              initialValues ?? {
                Subject: "",
                Category: null,
                Priority: null,
                Status: statusOptions[0],
                Description: "",
                Attachments: null,
              }
            }
            validationSchema={TicketSchema}
            enableReinitialize={true}
            onSubmit={async (values, { resetForm }) => {
              // If new file was picked, remove string Attachments
              if (
                Array.isArray(values.Attachments) &&
                values.Attachments.length > 0
              ) {
                // will submit file(s)
              } else if (
                typeof values.Attachments === "string" &&
                values.Attachments.startsWith("http")
              ) {
                // will submit the URL
              } else {
                // No attachment
                values.Attachments = null;
              }
              await onSubmit(values, resetForm);
            }}
          >
            {({ values, errors, touched, setFieldValue, isSubmitting }) => (
              <Form>
                <div className="modal-header">
                  <h5 className="fw-bold">
                    {mode === "edit" ? "Edit Ticket" : "Add Ticket"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close custom-btn-close"
                    aria-label="Close"
                    onClick={onClose}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <label className="form-label">
                        Ticket Title <span className="text-danger">*</span>
                      </label>
                      <Field
                        name="Subject"
                        className="form-control"
                        placeholder="Enter subject"
                      />
                      {touched.Subject && errors.Subject && (
                        <div className="text-danger">{errors.Subject}</div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Category <span className="text-danger">*</span>
                      </label>
                      <CustomSelect
                        options={Category}
                        className="select"
                        value={values.Category}
                        onChange={(opt) => setFieldValue("Category", opt)}
                        placeholder="Select"
                      />
                      {touched.Category && errors.Category && (
                        <div className="text-danger">
                          {errors.Category as string}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Priority <span className="text-danger">*</span>
                      </label>
                      <CustomSelect
                        options={Priority}
                        className="select"
                        value={values.Priority}
                        onChange={(opt) => setFieldValue("Priority", opt)}
                        placeholder="Select"
                      />
                      {touched.Priority && errors.Priority && (
                        <div className="text-danger">
                          {errors.Priority as string}
                        </div>
                      )}
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">
                        Status <span className="text-danger">*</span>
                      </label>
                      <CustomSelect
                        options={statusOptions}
                        className="select"
                        value={values.Status}
                        onChange={(opt) => setFieldValue("Status", opt)}
                        placeholder="Select"
                      />
                      {touched.Status && errors.Status && (
                        <div className="text-danger">
                          {errors.Status as string}
                        </div>
                      )}
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">
                        Description <span className="text-danger">*</span>
                      </label>
                      <DefaultEditor
                        value={values.Description}
                        onChange={(e) =>
                          setFieldValue("Description", e.target.value)
                        }
                        placeholder="Enter ticket details"
                      />
                      {touched.Description && errors.Description && (
                        <div className="text-danger">{errors.Description}</div>
                      )}
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label mb-2">
                        {mode === "edit"
                          ? "Uploaded Attachment"
                          : "Add Attachment"}{" "}
                      </label>
                      <p>{!values.Attachments && "No attachment uploaded."}</p>
                      <div className="d-flex flex-column align-items-start gap-3">
                        {mode === "edit" &&
                          typeof initialValues?.Attachments === "string" &&
                          initialValues.Attachments.startsWith("http") &&
                          (!Array.isArray(values.Attachments) ||
                            values.Attachments.length === 0) && (
                            <ImageGlobal
                              src={initialValues.Attachments}
                              alt="Attachment"
                              height={150}
                              className="mb-3"
                            />
                          )}

                        {/* Upload Preview (if a new file has been selected) */}
                        {Array.isArray(attachmentPreviews) &&
                          attachmentPreviews.length > 0 && (
                            <div
                              className="thumbnail-preview-box"
                              style={{
                                border: "1px solid #eee",
                                borderRadius: 8,
                                height: 250,
                                background: "#f5f5f5",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {attachmentPreviews[0] && (
                                <img
                                  src={attachmentPreviews[0]}
                                  alt="Preview"
                                  style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    borderRadius: 8,
                                  }}
                                />
                              )}
                            </div>
                          )}

                        {/* File Upload input */}
                        {mode !== "edit" && (
                          <div>
                            <input
                              type="file"
                              id="ticket-file-input"
                              name="Attachments"
                              accept="image/jpeg, image/png, image/gif, image/webp"
                              className="form-control visually-hidden"
                              onChange={(e) => {
                                // When user uploads file, always overwrite Attachments with File[]
                                onAttachmentChange(e, setFieldValue);
                              }}
                            />
                            <label
                              htmlFor="ticket-file-input"
                              className="btn btn-outline-primary px-3 py-2"
                              style={{
                                display: "inline-block",
                                cursor: "pointer",
                              }}
                            >
                              <i className="isax isax-export fs-16 me-2" />{" "}
                              Upload File
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn bg-gray-100 rounded-pill me-2"
                    type="button"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-secondary rounded-pill"
                    type="submit"
                    disabled={isSubmitting || loading}
                  >
                    {loading || isSubmitting
                      ? "Saving..."
                      : mode === "edit"
                      ? "Save Changes"
                      : "Add Ticket"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
