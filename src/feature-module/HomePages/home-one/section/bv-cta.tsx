import { Link } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";

const BvCta = () => {
  const route = all_routes;

  return (
    <>
      {/* Final CTA */}
      <section className="home-five-transform">
        <div className="container" data-aos="fade-up">
          <div className="row align-items-center row-gap-4">
            <div className="col-lg-9 col-md-8 col-sm-12">
              <div className="cta-content">
                <h2>Master the Skills. Monetize the Future.</h2>
                <p>
                  Join the Bluverse community of creators who are learning,
                  growing, and earning together.
                </p>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-sm-12">
              <div className="transform-button-three">
                <Link to={route.register} className="btn btn-secondary">
                  Join Bluverse Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /Final CTA */}
    </>
  );
};

export default BvCta;
