import { Link } from "react-router-dom";

const Faq = () => {
  return (
    <>
      {/* faq */}
      <section className="faq-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-12">
              <div className="section-header">
                <span className="fw-medium text-secondary text-decoration-underline mb-2 d-inline-block">
                  FAQs
                </span>
                <h2>Frequently Asked Questions</h2>
                <p>
                  Got questions? We've got answers. Here are the most common
                  things people ask before joining Bluverse Digital Hub.
                </p>
              </div>
              <div className="faq-content">
                <div
                  className="accordion accordion-customicon1 accordions-items-seperate"
                  id="accordioncustomicon1Example"
                >
                  {/* FAQ 1 */}
                  <div className="accordion-item" data-aos="fade-up">
                    <h2 className="accordion-header" id="headingcustomicon1One">
                      <Link
                        to="#"
                        className="accordion-button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapsecustomicon1One"
                        aria-expanded="true"
                        aria-controls="collapsecustomicon1One"
                      >
                        Who is M. Bilal and why should I learn from him?{" "}
                        <i className="isax isax-add fs-20 fw-semibold ms-1" />
                      </Link>
                    </h2>
                    <div
                      id="collapsecustomicon1One"
                      className="accordion-collapse collapse show"
                      aria-labelledby="headingcustomicon1One"
                      data-bs-parent="#accordioncustomicon1Example"
                    >
                      <div className="accordion-body pt-0">
                        <p>
                          M. Bilal is a content creator and the founder of
                          Bluverse Digital Hub, with 10+ years of experience in
                          building and growing digital platforms. He teaches
                          practical, step-by-step strategies to grow on social
                          media, build a personal brand, and generate income
                          using modern tools — including AI.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FAQ 2 */}
                  <div
                    className="accordion-item"
                    data-aos="fade-up"
                    data-aos-delay={250}
                  >
                    <h2 className="accordion-header" id="headingcustomicon1Two">
                      <Link
                        to="#"
                        className="accordion-button collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapsecustomicon1Two"
                        aria-expanded="false"
                        aria-controls="collapsecustomicon1Two"
                      >
                        What will I learn in this mentorship program?{" "}
                        <i className="isax isax-add fs-20 fw-semibold ms-1" />
                      </Link>
                    </h2>
                    <div
                      id="collapsecustomicon1Two"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingcustomicon1Two"
                      data-bs-parent="#accordioncustomicon1Example"
                    >
                      <div className="accordion-body pt-0">
                        <p>
                          In this mentorship, you'll learn how to become a
                          professional content creator — from scratch to
                          mastery. You'll understand how to create content, gain
                          views, grow across multiple platforms, and earn money
                          through your content. The program also covers personal
                          branding, niche and platform selection, video editing,
                          and how to leverage AI tools to create content
                          efficiently. By the end, you'll have a complete system
                          to start earning online the right way.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FAQ 3 */}
                  <div
                    className="accordion-item"
                    data-aos="fade-up"
                    data-aos-delay={250}
                  >
                    <h2
                      className="accordion-header"
                      id="headingcustomicon1Three"
                    >
                      <Link
                        to="#"
                        className="accordion-button collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapsecustomicon1Three"
                        aria-expanded="false"
                        aria-controls="collapsecustomicon1Three"
                      >
                        Do I need any prior experience or equipment?{" "}
                        <i className="isax isax-add fs-20 fw-semibold ms-1" />
                      </Link>
                    </h2>
                    <div
                      id="collapsecustomicon1Three"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingcustomicon1Three"
                      data-bs-parent="#accordioncustomicon1Example"
                    >
                      <div className="accordion-body pt-0">
                        <p>
                          No prior experience is needed. All you need is a
                          smartphone, an internet connection, and the commitment
                          to follow the process. The program is designed for
                          beginners, with clear, step-by-step training to guide
                          you from zero to progress.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FAQ 4 */}
                  <div
                    className="accordion-item"
                    data-aos="fade-up"
                    data-aos-delay={250}
                  >
                    <h2
                      className="accordion-header"
                      id="headingcustomicon1Four"
                    >
                      <Link
                        to="#"
                        className="accordion-button collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapsecustomicon1Four"
                        aria-expanded="false"
                        aria-controls="collapsecustomicon1Four"
                      >
                        How long does it take to start earning from content
                        creation?{" "}
                        <i className="isax isax-add fs-20 fw-semibold ms-1" />
                      </Link>
                    </h2>
                    <div
                      id="collapsecustomicon1Four"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingcustomicon1Four"
                      data-bs-parent="#accordioncustomicon1Example"
                    >
                      <div className="accordion-body pt-0">
                        <p>
                          Many students begin earning within a month, depending
                          on their consistency, effort, and strategy. You'll
                          learn exactly where and how to earn, with clear
                          guidance so your efforts are never wasted. If you
                          follow the system with consistency, you can start
                          seeing strong results fairly quickly.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FAQ 5 */}
                  <div
                    className="accordion-item"
                    data-aos="fade-up"
                    data-aos-delay={250}
                  >
                    <h2
                      className="accordion-header"
                      id="headingcustomicon1Five"
                    >
                      <Link
                        to="#"
                        className="accordion-button collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapsecustomicon1Five"
                        aria-expanded="false"
                        aria-controls="collapsecustomicon1Five"
                      >
                        What support do I get after joining?{" "}
                        <i className="isax isax-add fs-20 fw-semibold ms-1" />
                      </Link>
                    </h2>
                    <div
                      id="collapsecustomicon1Five"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingcustomicon1Five"
                      data-bs-parent="#accordioncustomicon1Example"
                    >
                      <div className="accordion-body pt-0">
                        <p className="mb-2">
                          You'll receive complete guidance and support
                          throughout your journey so you never feel stuck:
                        </p>
                        <ul
                          style={{ listStyleType: "disc" }}
                          className="ps-3 mb-2"
                        >
                          <li className="mb-1">
                            In-depth training inside the course
                          </li>
                          <li className="mb-1">Private support via WhatsApp</li>
                          <li className="mb-1">
                            Dedicated support through the LMS ticket system
                          </li>
                          <li className="mb-1">
                            Live sessions for active and growing students
                          </li>
                          <li>1-on-1 mentorship for top-performing students</li>
                        </ul>
                        <p className="mb-0">
                          Our goal is to guide you step by step, keep you on the
                          right path, and help you achieve results faster —
                          without confusion.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* faq */}
    </>
  );
};

export default Faq;
