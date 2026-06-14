import { Link } from "react-router-dom";
import ImageWithBasePath from "../../../../core/common/imageWithBasePath";
import { all_routes } from "../../../router/all_routes";

const BvBanner = () => {
  const route = all_routes;

  return (
    <>
      {/* Home Banner */}
      <section className="banner-five">
        <div className="container">
          <div className="row align-items-center">
            <div
              className="col-xl-6 col-lg-7 col-md-12 d-flex col-12"
              data-aos="fade-down"
            >
              <div className="home-five-slide-face flex-fill">
                <div className="home-five-slide-text">
                  <span className="text-white d-inline-block bg-secondary small rounded-pill px-3 py-2 mb-3 mb-sm-4">
                    <span className="badge bg-white text-secondary rounded-pill me-1">
                      New
                    </span>
                    Generating 1 Billion+ Views Across Social Platforms Every
                    Month
                  </span>
                  <h1>
                    Pakistan&rsquo;s Leading Content Creation{" "}
                    <span>&amp;</span> Digital Skills Institute
                  </h1>
                  <p>
                    We empower youth to master modern skills, build digital
                    careers, and create real income opportunities. From content
                    creation to brand building and automation, Bluverse helps
                    you turn your potential into profit.
                  </p>
                  <p className="fw-semibold">
                    Master the Skills. Monetize the Future. Join the Bluverse
                    &mdash; Learn. Earn. Dominate.
                  </p>
                  <div className="d-flex flex-wrap gap-3 mt-4">
                    <Link to={route.register} className="btn btn-primary">
                      Start Learning Now
                    </Link>
                    <Link to={route.courseGrid} className="btn btn-secondary">
                      Explore Courses
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="offset-lg-1 col-lg-5 col-12 text-center"
              data-aos="fade-up"
            >
              <div className="banner-slide-img flex-fill aos">
                <ImageWithBasePath
                  className="img-fluid ps-lg-5"
                  src="assets/img/hero/hero-6.png"
                  alt="Img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /Home Banner */}
    </>
  );
};

export default BvBanner;
