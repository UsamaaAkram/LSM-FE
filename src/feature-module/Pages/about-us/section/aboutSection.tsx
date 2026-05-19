const AboutSection = () => {
  return (
    <>
      {/* about */}
      <section className="about-section-two pb-0">
        <div className="container">
          <div className="row align-items-center">
            {/* <div className="col-lg-6">
                <div className="p-3 p-sm-4 position-relative">
                  <div className="position-absolute top-0 start-0 z-n1">
                    <ImageWithBasePath src="assets/img/shapes/shape-1.svg" alt="img" />
                  </div>
                  <div className="position-absolute bottom-0 end-0 z-n1">
                    <ImageWithBasePath src="assets/img/shapes/shape-2.svg" alt="img" />
                  </div>
                  <div className="position-absolute bottom-0 start-0 mb-md-5 ms-md-n5">
                    <ImageWithBasePath src="assets/img/icons/icon-1.svg" alt="img" />
                  </div>
                  <ImageWithBasePath
                    className="img-fluid img-radius"
                    src="./assets/img/about/about-2.svg"
                    alt="img"
                  />
                </div>
              </div> */}

            <div className="col-lg-12">
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
