import { FOUNDER_SOCIALS } from "../../../../core/common/bluverseLinks";

// #36 — set this once a photo of the founder is supplied; until then the card
// shows a neutral avatar rather than a broken image.
const FOUNDER_PHOTO = "";

const AboutSection = () => {
  return (
    <>
      {/* about */}
      <section className="about-section-two pb-0">
        <div className="container">
          <div className="row align-items-start row-gap-4">
            <div className="col-lg-4">
              {/* #36 — founder profile card. Falls back to an icon until a
                  photo of Muhammad Bilal is supplied; the social row renders
                  only the platforms that have a URL set in FOUNDER_SOCIALS. */}
              <div className="card shadow-sm border-0 h-100 founder-card">
                <div className="card-body p-4 text-center">
                  <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-secondary-transparent mb-3 overflow-hidden" style={{ width: 104, height: 104 }}>
                    {FOUNDER_PHOTO ? (
                      <img
                        src={FOUNDER_PHOTO}
                        alt="Muhammad Bilal, Founder & CEO of Bluverse Digital Hub"
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <i className="isax isax-user fs-32 text-secondary" />
                    )}
                  </span>
                  <h5 className="mb-1">Muhammad Bilal</h5>
                  <p className="text-secondary fw-medium mb-0">Founder &amp; CEO</p>
                  <p className="text-muted mb-2" style={{ fontSize: 13 }}>
                    Bluverse Digital Hub
                  </p>
                  <p className="mb-0" style={{ fontSize: 14 }}>
                    Pakistan's Leading Digital Monetization Expert — 10+ years
                    growing and monetizing content across social platforms.
                  </p>

                  {FOUNDER_SOCIALS.some((s) => s.url) && (
                    <div className="mt-3">
                      <p
                        className="text-muted text-uppercase mb-2"
                        style={{ fontSize: 11, letterSpacing: 1 }}
                      >
                        Follow the Founder
                      </p>
                      <div className="d-flex justify-content-center gap-2">
                        {FOUNDER_SOCIALS.filter((s) => s.url).map((s) => (
                          <a
                            key={s.label}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-light"
                            aria-label={`Muhammad Bilal on ${s.label}`}
                            title={s.label}
                          >
                            <i className={s.icon} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="ps-0 ps-lg-2 pt-4 pt-lg-0 ps-xl-5">
                <div className="section-header">
                  <span className="fw-medium text-secondary text-decoration-underline mb-2 d-inline-block">
                    About
                  </span>
                  <h2>Bluverse Digital Hub</h2>
                  <p className="fst-italic text-muted mb-2">
                    Led by Bilal Talks — Pakistan's Leading Digital Monetization
                    Expert
                  </p>
                  <p>
                    Learn directly from Muhammad Bilal, a pioneer in digital
                    content creation with over 10 years of experience in social
                    media growth and monetization. Generating 1B+ organic views
                    every month and an ever-growing list of success stories,
                    Bilal's proven strategies have helped creators earn real,
                    consistent income from their content.
                  </p>
                </div>
                <div className="d-flex align-items-center about-us-banner">
                  {/* <div>
        <span className="bg-primary-transparent rounded-3 p-2 about-icon d-flex justify-content-center align-items-center">
          <i className="isax isax-book-1 fs-24" />
        </span>
      </div> */}
                  <div className="">
                    <h6 className="mb-2">
                      🚀 Learn Content Creation — From Zero to Pro
                    </h6>
                    <p>
                      No experience? No problem. At Bluverse Digital Hub, we
                      take you from complete beginner to professional content
                      creator, step by step.
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center about-us-banner">
                  {/* <div>
        <span className="bg-secondary-transparent rounded-3 p-2 about-icon d-flex justify-content-center align-items-center">
          <i className="isax isax-bookmark5 fs-24" />
        </span>
      </div> */}
                  <div className="">
                    <h6 className="mb-2">✅ What You'll Learn</h6>
                    <ul
                      className="mb-0 ps-3"
                      style={{ fontSize: 14, listStyleType: "disc" }}
                    >
                      <li className="mb-1">
                        Build a strong personal brand and identify a niche
                        aligned with your strengths and long-term goals.
                      </li>
                      <li className="mb-1">
                        Plan, shoot, and structure compelling content using
                        effective storytelling that captures attention and
                        boosts audience retention.
                      </li>
                      <li className="mb-1">
                        Understand how platforms like TikTok, YouTube, and
                        Facebook work, with practical strategies for consistent
                        and sustainable growth.
                      </li>
                      <li className="mb-1">
                        Create content using AI tools and apply prompt
                        engineering to maximize efficiency and results.
                      </li>
                      <li className="mb-1">
                        Learn how to responsibly use copyrighted content, avoid
                        violations, and apply it strategically.
                      </li>
                      <li className="mb-1">
                        Develop original content that stands out and delivers
                        long-term value.
                      </li>
                      <li className="mb-1">
                        Apply proven monetization methods to generate consistent
                        income through social media platforms.
                      </li>
                      <li className="mb-1">
                        Edit videos using simple, practical, and time-efficient
                        techniques.
                      </li>
                      <li className="mb-1">
                        Use proven templates and content formats to produce
                        faster and more effective videos.
                      </li>
                      <li className="mb-1">
                        Explore high-potential and trending niches, including
                        untapped opportunities.
                      </li>
                      <li className="mb-1">
                        Plan, scale, and manage your content workflow and
                        accounts efficiently — without burnout.
                      </li>
                      <li>
                        Gain a complete understanding of the content creation
                        business, from idea generation to execution and
                        long-term growth.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* about */}
    </>
  );
};

export default AboutSection;
