import { useState } from "react";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";

const faqs = [
  {
    q: "Will I receive a certificate after completing the course?",
    a: "Absolutely, every student who successfully completes the course will receive an official Bluverse Digital Hub Certificate of Completion, recognizing their skills and achievements.",
  },
  {
    q: "Is there a 14-days trial?",
    a: "No, we currently do not offer a 14-day trial. However, you can explore our platform through free demo courses or contact our team for a personalized walkthrough of the features.",
  },
  {
    q: "How much time will I need to learn?",
    a: "It depends on the course and your pace. Our step-by-step roadmap is designed so beginners can start seeing results within a few weeks of consistent practice.",
  },
  {
    q: "Is there a month-to-month payment option?",
    a: "Enrollment is handled directly with our team. Reach out on WhatsApp and we'll guide you through the available options.",
  },
  {
    q: "What are the benefits of enrolling?",
    a: "You get lifetime access to the course content, hands-on assignments, community support, and an official certificate on completion.",
  },
  {
    q: "Are there any free tutorials available?",
    a: "Yes, we regularly share free content on our social channels. Follow us to get started before enrolling in a full course.",
  },
  {
    q: "How can I get support?",
    a: "Our support team is available on WhatsApp and through the in-app community. We're happy to help you get started and answer any questions.",
  },
];

const Faq = () => {
  const route = all_routes;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <>
      <Breadcrumb title="FAQ" />

      <div className="content">
        <div className="container">
          <h2 className="main-title mb-1">Most frequently asked questions</h2>
          <p className="mb-4">
            Here are the most frequently asked questions you may check before
            getting started
          </p>

          <div className="row">
            <div className="col-lg-9 mx-auto">
              {faqs.map((item, i) => {
                const isOpen = openIndex === i;
                return (
                  <div className="faq-card border rounded mb-3" key={i}>
                    <h6 className="faq-title mb-0">
                      <button
                        type="button"
                        className="btn w-100 text-start d-flex align-items-center justify-content-between fw-semibold p-3"
                        aria-expanded={isOpen}
                        onClick={() => toggle(i)}
                      >
                        <span>{item.q}</span>
                        <i
                          className={`isax ${
                            isOpen ? "isax-minus" : "isax-add"
                          } ms-2`}
                        />
                      </button>
                    </h6>
                    {isOpen && (
                      <div className="faq-detail px-3 pb-3">
                        <p className="mb-0">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-light border rounded p-4 p-sm-5 mt-4">
            <div className="row">
              <div className="col-lg-7 text-center mx-auto">
                <h4 className="mb-2">Still have a question?</h4>
                <p className="mb-4">
                  We'd be happy to help you with any questions you have! Please
                  let us know what you're looking for, and we'll do our best to
                  assist you.
                </p>
                <Link to={route.contactUs} className="btn btn-lg btn-dark mb-0">
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Faq;
