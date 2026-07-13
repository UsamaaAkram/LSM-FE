import { Link } from "react-router-dom";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { WHATSAPP_ENROLL } from "../../../core/common/bluverseLinks";
import { all_routes } from "../../router/all_routes";

const services = [
  {
    icon: "isax isax-video-play",
    title: "Content Creation",
    text: "Learn to plan, shoot, and edit scroll-stopping content that grows your audience across every platform.",
  },
  {
    icon: "isax isax-trend-up",
    title: "Social Media Growth",
    text: "Proven strategies to grow real, engaged followers — no guesswork, just systems that work.",
  },
  {
    icon: "isax isax-dollar-circle",
    title: "Content Monetization",
    text: "Turn your content into a sustainable income stream with brand deals, automation, and digital products.",
  },
  {
    icon: "isax isax-cpu",
    title: "AI Tools & Automation",
    text: "Master the AI tools and workflows that let you create faster and scale your online business.",
  },
  {
    icon: "isax isax-briefcase",
    title: "Personal Brand Building",
    text: "Build an authentic personal brand that attracts opportunities, clients, and long-term growth.",
  },
  {
    icon: "isax isax-teacher",
    title: "1-on-1 Mentorship",
    text: "Get guided support from our team and community as you go from beginner to confident creator.",
  },
];

const Services = () => {
  const route = all_routes;
  return (
    <>
      <Breadcrumb title="Services" />

      <section className="course-content">
        <div className="container">
          <div className="text-center mx-auto mb-4" style={{ maxWidth: 640 }}>
            <h2 className="mb-2">What We Offer</h2>
            <p className="text-muted mb-0">
              From content creation to monetization, Bluverse Digital Hub helps
              you turn your potential into a scalable online business.
            </p>
          </div>

          <div className="row row-gap-4">
            {services.map((s) => (
              <div className="col-lg-4 col-md-6" key={s.title}>
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body p-4">
                    <div className="p-3 rounded-circle bg-primary-transparent d-inline-flex mb-3">
                      <i className={`${s.icon} fs-24 text-primary`} />
                    </div>
                    <h5 className="mb-2">{s.title}</h5>
                    <p className="text-muted mb-0">{s.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-5">
            <a
              href={WHATSAPP_ENROLL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary me-2"
            >
              Get Started on WhatsApp
            </a>
            <Link to={route.courseGrid} className="btn btn-outline-secondary">
              Explore Courses
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;
