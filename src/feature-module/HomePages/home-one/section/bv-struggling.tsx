import ImageWithBasePath from "../../../../core/common/imageWithBasePath";

const points = [
  {
    text: "Posting content but no growth?",
    icon: "assets/img/struggle-growth.png",
  },
  {
    text: "Don’t know how to monetize?",
    icon: "assets/img/struggle-monetise.png",
  },
  {
    text: "Confused about AI tools & strategies?",
    icon: "assets/img/struggle-ai.png",
  },
  {
    text: "No clear roadmap to success?",
    icon: "assets/img/struggle-roadmap.png",
  },
];

const BvStruggling = () => {
  return (
    <>
      {/* Struggling */}
      <section className="master-skill-three">
        <div className="container">
          <div className="home-five-head text-center mx-auto" data-aos="fade-up">
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
