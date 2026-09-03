import ImageWithBasePath from "../../../../core/common/imageWithBasePath";

// Custom artwork supplied by the client (Drive), replacing the earlier opaque
// 1.3MB-per-icon exports. These are transparent and ~30x smaller — see
// public/assets/img/bluverse/README.md.
const points = [
  {
    text: "Posting content but no growth?",
    icon: "assets/img/bluverse/problem-no-growth.png",
  },
  {
    text: "Don’t know how to monetize?",
    icon: "assets/img/bluverse/problem-no-monetization.png",
  },
  {
    text: "Confused about AI tools & strategies?",
    icon: "assets/img/bluverse/problem-ai-confusion.png",
  },
  {
    text: "No clear roadmap to success?",
    icon: "assets/img/bluverse/problem-no-roadmap.png",
  },
];

const BvStruggling = () => {
  return (
    <>
      {/* Struggling */}
      <section className="master-skill-three">
        <div className="container">
          <div className="home-five-head text-center mx-auto" data-aos="fade-up">
            <span className="text-secondary fw-semibold text-uppercase d-inline-block mb-2" style={{ letterSpacing: 1 }}>
              The Problem
            </span>
            <div
              className="text-secondary mx-auto mb-3"
              style={{ width: 48, height: 3, backgroundColor: "currentColor" }}
            />
            <h2>Struggling to Grow Online or Earn from Content?</h2>
          </div>
          <div className="skils-group mt-4">
            <div className="row row-gap-4 justify-content-center">
              {points.map((point, index) => (
                <div
                  className="col-lg-3 col-sm-6 col-12"
                  data-aos="fade-up"
                  key={index}
                >
                  <div className="skils-icon-item h-100 text-center">
                    <div className="skils-icon mb-2">
                      <ImageWithBasePath
                        src={point.icon}
                        alt={point.text}
                        className="img-fluid"
                        style={{ height: 64, width: "auto" }}
                      />
                    </div>
                    <div className="skils-content">
                      <p className="mb-0">{point.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="home-five-content text-center mt-4" data-aos="fade-up">
            <p className="mb-0">
              You&rsquo;re not alone &mdash; most creators fail because they
              lack the right system.
            </p>
          </div>
        </div>
      </section>
      {/* /Struggling */}
    </>
  );
};

export default BvStruggling;
