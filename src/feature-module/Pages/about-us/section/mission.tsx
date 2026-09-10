import { Link } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";

const Mission = () => {
  const route = all_routes;

  return (
    <>
      {/* Our Mission */}
      <section className="pt-0">
        <div className="container">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 p-md-5 text-center">
              <span className="fw-medium text-secondary text-decoration-underline mb-2 d-inline-block">
                Our Mission
              </span>
              <h2 className="mb-3">Master the Skills. Monetize the Future.</h2>
              <p className="mb-4 mx-auto" style={{ maxWidth: 640 }}>
                We empower youth to master modern skills, build digital
                careers, and create real income opportunities — helping
                creators turn their potential into profit, one step-by-step
                system at a time.
              </p>
              <Link to={route.register} className="btn btn-secondary">
                Join Bluverse Now
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* /Our Mission */}
    </>
  );
};

export default Mission;
