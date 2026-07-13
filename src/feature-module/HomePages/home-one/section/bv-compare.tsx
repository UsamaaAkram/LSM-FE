const rows = [
  {
    path: "Freelancing",
    investment: "Very Low",
    time: "High",
    risk: "Low",
    growth: "Moderate",
    freedom: "Limited",
  },
  {
    path: "E-commerce",
    investment: "High",
    time: "Medium",
    risk: "High",
    growth: "High",
    freedom: "Yes",
  },
  {
    path: "Trading",
    investment: "High",
    time: "Low",
    risk: "Very High",
    growth: "Uncertain",
    freedom: "Partial",
  },
  {
    path: "Traditional Job",
    investment: "None",
    time: "High",
    risk: "Very Low",
    growth: "Slow",
    freedom: "No",
  },
  {
    path: "Content Creation",
    investment: "Very Low",
    time: "Medium",
    risk: "Low",
    growth: "High & Scalable",
    freedom: "Yes",
    highlight: true,
  },
];

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
            <table className="table table-bordered align-middle text-center mb-0">
              <thead className="table-light">
                <tr>
                  <th>Career Path</th>
                  <th>Investment</th>
                  <th>Time Required</th>
                  <th>Risk</th>
                  <th>Growth Potential</th>
                  <th>Freedom</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.path}
                    className={r.highlight ? "table-primary fw-semibold" : ""}
                  >
                    <td className="fw-semibold">{r.path}</td>
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
