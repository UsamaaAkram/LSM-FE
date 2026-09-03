import { Link } from "react-router-dom";
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
                  <span
                    className="text-white d-inline-block small rounded-pill px-3 py-2 mb-3 mb-sm-4"
                    style={{
                      background: "linear-gradient(90deg, #2563EB, #22D3EE)",
                    }}
                  >
                    Generating 1 Billion+ Views Across Social Platforms Every
                    Month
                  </span>
                  <h1>
                    Pakistan&rsquo;s Leading Institute Of{" "}
                    <span>Content Creation &amp;</span> Digital Skills
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
                {/* Client-supplied hero artwork. WebP first with a JPEG
                    fallback — the source was a 2MB PNG of a photograph, which
                    is the wrong format for this content (207KB / 160KB now). */}
                <picture>
                  <source
                    srcSet="assets/img/bluverse/home-hero-main.webp"
                    type="image/webp"
                  />
                  <img
                    className="img-fluid ps-lg-5 rounded-3"
                    src="assets/img/bluverse/home-hero-main.jpg"
                    alt="Bluverse students filming and growing their content together"
                    loading="eager"
                    decoding="async"
                  />
                </picture>
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
