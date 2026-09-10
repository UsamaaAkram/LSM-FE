import React from "react";

// #33 — LMS Guide configuration, shared by Add Course and Edit Course so the
// two wizards can never drift apart.
//
// The Guide is deliberately NOT a module or lesson: it renders above the
// curriculum on the Course Watch page and is excluded from progress, lesson
// count, quiz count and assignment count. Leaving the video ID blank hides
// the whole section for that course.
export interface LmsGuideValues {
  lmsGuideTitle: string;
  lmsGuideDescription: string;
  lmsGuideVdoId: string;
}

interface Props {
  values: LmsGuideValues;
  onChange: (patch: Partial<LmsGuideValues>) => void;
}

const LmsGuideFields: React.FC<Props> = ({ values, onChange }) => (
  <div className="border rounded p-3 mt-4">
    <div className="mb-3">
      <h6 className="mb-1">LMS Guide (optional)</h6>
      <p className="text-muted mb-0" style={{ fontSize: 13 }}>
        A short onboarding video shown above the curriculum — how to use the
        LMS, how progress is tracked, community rules and copyright policy. It
        is not a lesson: it never affects course progress or lesson counts.
        Leave the video ID empty to hide it.
      </p>
    </div>
    <div className="row">
      <div className="col-md-6">
        <div className="input-block">
          <label className="form-label">Guide Title</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Welcome to Bluverse Digital Hub LMS"
            value={values.lmsGuideTitle}
            onChange={(e) => onChange({ lmsGuideTitle: e.target.value })}
          />
        </div>
      </div>
      <div className="col-md-6">
        <div className="input-block">
          <label className="form-label">Guide Video ID (VdoCipher)</label>
          <input
            type="text"
            className="form-control"
            placeholder="Paste the video ID from your VdoCipher dashboard"
            value={values.lmsGuideVdoId}
            onChange={(e) => onChange({ lmsGuideVdoId: e.target.value })}
          />
        </div>
      </div>
      <div className="col-md-12">
        <div className="input-block mb-0">
          <label className="form-label">Guide Description</label>
          <textarea
            className="form-control"
            rows={2}
            placeholder="What students should know before starting the course"
            value={values.lmsGuideDescription}
            onChange={(e) => onChange({ lmsGuideDescription: e.target.value })}
          />
        </div>
      </div>
    </div>
  </div>
);

export default LmsGuideFields;
