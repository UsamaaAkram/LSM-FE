import ImageWithBasePath from "../../../../core/common/imageWithBasePath";

// #46 — the six offerings, using the custom artwork supplied by the client
// (Drive) instead of the generic circular icons. Data-driven rather than six
// duplicated card blocks so copy and artwork stay in one place.
//
// The doc places this section on About Us, after "What You'll Learn".
const offerings = [
  {
    title: "Content Creation",
    image: "assets/img/bluverse/offer-content-creation.png",
    text: "Plan, shoot and edit content people actually watch — from hooks and scripting to pacing and retention.",
  },
  {
    title: "Social Media Growth",
    image: "assets/img/bluverse/offer-social-media-growth.png",
    text: "Grow a real audience with strategies built for how the platforms rank content today, not last year.",
  },
  {
    title: "Content Monetisation",
    image: "assets/img/bluverse/offer-content-monetisation.png",
    text: "Turn views into income through creator programmes, brand deals, digital products and services.",
  },
  {
    title: "AI Tools & Automation",
    image: "assets/img/bluverse/offer-ai-tools-automation.png",
    text: "Use AI to research, write, edit and publish faster — with the exact tools and prompts we use daily.",
  },
  {
    title: "Personal Brand Building",
    image: "assets/img/bluverse/offer-personal-brand.png",
    text: "Build a recognisable brand and a niche that fits your strengths and long-term goals.",
  },
  {
    title: "1-on-1 Mentorship",
    image: "assets/img/bluverse/offer-mentorship.png",
    text: "Direct guidance on your own account, your own content and your own numbers — not generic advice.",
  },
];

const Offerings = () => {
  return (
    <section className="offerings-section py-5">
      <div className="container">
        <div className="section-header text-center">
          <span className="fw-medium text-secondary mb-2 d-inline-block text-uppercase bv-eyebrow">
            What We Offer
          </span>
          <h2>Everything You Need to Build a Digital Career</h2>
          <p>
            Six areas of training and support, taught from real experience and
            kept current with how the platforms actually work.
          </p>
        </div>

        <div className="row row-gap-4 mt-4">
          {offerings.map((item) => (
            <div className="col-lg-4 col-md-6" key={item.title}>
              <div className="card h-100 border-0 shadow-sm offering-card">
                <div className="card-body p-4 text-center d-flex flex-column">
                  <div className="offering-card__media mb-3">
                    <ImageWithBasePath
                      src={item.image}
                      alt={`${item.title} icon`}
                      className="img-fluid"
                      style={{ height: 96, width: "auto" }}
                    />
                  </div>
                  <h5 className="mb-2">{item.title}</h5>
                  <p className="mb-0 text-muted">{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Offerings;
