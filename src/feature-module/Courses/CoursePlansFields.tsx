import React from "react";

// #47 — access plans for a course, editable by an admin. Shared by Add Course
// and Edit Course.
//
// The doc is explicit that plans must NOT be hard-coded into the frontend, so
// the enrollment wizard reads whatever is configured here. accessDays empty
// means lifetime access; a number is the access window in days.
export interface CoursePlan {
  name: string;
  price: string;
  accessDays: number | null;
  description: string;
  isActive: boolean;
}

export const emptyPlan = (): CoursePlan => ({
  name: "",
  price: "",
  accessDays: null,
  description: "",
  isActive: true,
});

interface Props {
  plans: CoursePlan[];
  onChange: (plans: CoursePlan[]) => void;
}

const CoursePlansFields: React.FC<Props> = ({ plans, onChange }) => {
  const patch = (i: number, p: Partial<CoursePlan>) => {
    const next = [...plans];
    next[i] = { ...next[i], ...p };
    onChange(next);
  };

  return (
    <div className="border rounded p-3 mt-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h6 className="mb-1">Access Plans (optional)</h6>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>
            What students can choose when enrolling. Leave the duration blank for
            lifetime access. With no plans configured, students enroll without
            picking one.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-light text-nowrap"
          onClick={() => onChange([...plans, emptyPlan()])}
        >
          <i className="isax isax-add me-1" />
          Add Plan
        </button>
      </div>

      {plans.length === 0 && (
        <p className="text-muted mb-0" style={{ fontSize: 13 }}>
          No plans yet.
        </p>
      )}

      {plans.map((plan, i) => (
        <div className="border rounded p-2 mb-2" key={i}>
          <div className="row g-2">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Plan name, e.g. Lifetime Access"
                value={plan.name}
                onChange={(e) => patch(i, { name: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Price, e.g. Rs. 25,000"
                value={plan.price}
                onChange={(e) => patch(i, { price: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <input
                type="number"
                min={1}
                className="form-control form-control-sm"
                placeholder="Days (blank = lifetime)"
                value={plan.accessDays ?? ""}
                onChange={(e) =>
                  patch(i, {
                    accessDays:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="col-md-2 d-flex align-items-center justify-content-between">
              <div className="form-check form-switch mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={plan.isActive}
                  onChange={(e) => patch(i, { isActive: e.target.checked })}
                  title={plan.isActive ? "Active" : "Hidden from students"}
                />
              </div>
              <button
                type="button"
                className="btn btn-sm text-danger"
                onClick={() => onChange(plans.filter((_, idx) => idx !== i))}
                aria-label={`Remove ${plan.name || "plan"}`}
              >
                <i className="isax isax-trash" />
              </button>
            </div>
            <div className="col-12">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Short description (optional)"
                value={plan.description}
                onChange={(e) => patch(i, { description: e.target.value })}
              />
            </div>
          </div>
          {!plan.isActive && (
            <small className="text-muted">
              Hidden — existing students keep their access, new students can't
              pick it.
            </small>
          )}
        </div>
      ))}
    </div>
  );
};

export default CoursePlansFields;
