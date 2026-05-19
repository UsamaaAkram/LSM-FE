import ImageWithBasePath from "../../../../core/common/imageWithBasePath";

const Benefits = () => {
  return (
    <>
      {/* benefits */}
      <section className="benefit-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="fw-medium text-secondary text-decoration-underline mb-2 d-inline-block">
              Our Benefits
            </span>
            <h2>Build a Profitable Career in Content Creation</h2>
            <p>
              Step-by-step training, real strategies, and practical skills to
              help you start earning from your content.
            </p>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-6">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <div className="position-absolute top-0 end-0 mt-n3 me-n4">
                    <ImageWithBasePath
                      src="./assets/img/shapes/bg-1.png"
                      alt="img"
                    />
                  </div>
                  <div className="p-4 rounded-pill bg-primary-transparent d-inline-flex">
                    <i className="isax isax-book-1 fs-24" />
                  </div>
                  <h5 className="mt-3 mb-1">Real Earning Methods</h5>
                  <p>
                    Learn practical, proven ways to earn through social media —
                    based on real-world experience, not guesswork.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <div className="position-absolute top-0 end-0 mt-n3 me-n4">
                    <ImageWithBasePath
                      src="assets/img/shapes/bg-2.png"
                      alt="img"
                    />
                  </div>
                  <div className="p-4 rounded-pill bg-secondary-transparent d-inline-flex">
                    <i className="isax isax-bookmark5 fs-24" />
                  </div>
                  <h5 className="mt-3 mb-1">Beginner to Pro Roadmap</h5>
                  <p>
                    A clear, step-by-step path designed to take you from
                    complete beginner to confident creator — no prior experience
                    required.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <div className="position-absolute top-0 end-0 mt-n3 me-n4">
                    <ImageWithBasePath
                      src="assets/img/shapes/bg-3.png"
                      alt="img"
                    />
                  </div>
                  <div className="p-4 rounded-pill bg-skyblue-transparent d-inline-flex">
                    <i className="isax isax-chart-26 fs-24" />
                  </div>
                  <h5 className="mt-3 mb-1">Content Monetization System</h5>
                  <p>
                    Discover how to turn your content into a sustainable income
                    stream using strategies that actually work today.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* benefits */}
    </>
  );
};

export default Benefits;
