import ImageWithBasePath from "../../../../core/common/imageWithBasePath";

// #45 — career-path comparison. The client supplied custom artwork for each
// column heading and each career row (Drive), which is wired in below.
// The comparison values themselves are the client's own positioning copy.
const columns = [
  { key: "path", label: "Career Path", icon: "career-col-career-path" },
  { key: "investment", label: "Investment", icon: "career-col-investment" },
  { key: "time", label: "Time Required", icon: "career-col-time-required" },
  { key: "risk", label: "Risk", icon: "career-col-risk" },
  {
    key: "growth",
    label: "Growth Potential",
    icon: "career-col-growth-potential",
  },
  { key: "freedom", label: "Freedom", icon: "career-col-freedom" },
] as const;

type Row = {
  path: string;
  icon: string;
  investment: string;
  time: string;
  risk: string;
  growth: string;
  freedom: string;
  highlight?: boolean;
};

const rows: Row[] = [
  {
    path: "Freelancing",
    icon: "career-row-freelancing",
    investment: "Very Low",
    time: "High",
    risk: "Low",
    growth: "Moderate",
    freedom: "Limited",
  },
  {
    path: "E-commerce",
    icon: "career-row-ecommerce",
    investment: "High",
    time: "Medium",
    risk: "High",
    growth: "High",
    freedom: "Yes",
  },
  {
    path: "Trading",
    icon: "career-row-trading",
    investment: "High",
    time: "Low",
    risk: "Very High",
    growth: "Uncertain",
    freedom: "Partial",
  },
  {
    path: "Traditional Job",
    icon: "career-row-traditional-job",
    investment: "None",
    time: "High",
    risk: "Very Low",
    growth: "Slow",
    freedom: "No",
  },
  {
    path: "Content Creation",
    icon: "career-row-content-creation",
    investment: "Very Low",
    time: "Medium",
    risk: "Low",
    growth: "High & Scalable",
    freedom: "Yes",
    highlight: true,
  },
];

const iconPath = (name: string) => `assets/img/bluverse/${name}.png`;

const BvCompare = () => {
  return (
    <>
      {/* Why choose content creation */}
      <section className="master-skill-three pt-0">
        <div className="container">
          <div className="home-five-head text-center mx-auto" data-aos="fade-up">
            <h2>Why You Choose Content Creation?</h2>
            <p className="mt-2">
              Compare content creation with other popular career paths and see
              why millions of creators are building scalable online businesses.
            </p>
          </div>
          <div
            className="table-responsive mt-4 rounded border"
            data-aos="fade-up"
          >
            <table className="table table-bordered align-middle text-center mb-0 bv-compare-table">
              <thead className="table-light">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} scope="col">
                      <span className="d-inline-flex flex-column align-items-center gap-1">
                        <ImageWithBasePath
                          src={iconPath(col.icon)}
                          // Decorative: the visible label already names the
                          // column, so an alt here would just be read twice.
                          alt=""
                          aria-hidden="true"
                          className="img-fluid"
                          style={{ height: 34, width: "auto" }}
                        />
                        <span>{col.label}</span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.path}
                    className={r.highlight ? "table-primary fw-semibold" : ""}
                  >
                    <th scope="row" className="fw-semibold">
                      <span className="d-inline-flex align-items-center gap-2 justify-content-center">
                        <ImageWithBasePath
                          src={iconPath(r.icon)}
                          alt=""
                          aria-hidden="true"
                          className="img-fluid"
                          style={{ height: 30, width: "auto" }}
                        />
                        <span>{r.path}</span>
                      </span>
                    </th>
                    <td>{r.investment}</td>
                    <td>{r.time}</td>
                    <td>{r.risk}</td>
                    <td>{r.growth}</td>
                    <td>{r.freedom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {/* /Why choose content creation */}
    </>
  );
};

export default BvCompare;
