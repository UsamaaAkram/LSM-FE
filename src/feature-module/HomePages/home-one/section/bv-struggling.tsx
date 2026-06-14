const points = [
  "Posting content but no growth?",
  "Don’t know how to monetize?",
  "Confused about AI tools & strategies?",
  "No clear roadmap to success?",
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
                  <div className="skils-icon-item h-100">
                    <div className="skils-icon">
                      <i className="isax isax-warning-2 text-secondary fs-24" />
                    </div>
                    <div className="skils-content">
                      <p className="mb-0">{point}</p>
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
