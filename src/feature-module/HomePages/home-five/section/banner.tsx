import ImageWithBasePath from "../../../../core/common/imageWithBasePath";

const Banner = () => {
 
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
                    The Leader in Online Learning
                  </span>
                  <h1>
                    Engaging <span>&amp;</span> Accessible Online Courses For
                    All
                  </h1>
                  <p>
                    Our specialized online courses are designed to bring the
                    classroom experience to you, no matter where you are.
                  </p>
                </div>
                {/* <div className="banner-three-content">
                  <form className="form" onSubmit={handleSubmit}>
                    <div className="form-inner-three">
                      <div className="input-group justify-content-between">
                        <div className="d-flex flex-wrap gap-3">
                          <div className="drop-detail-three">
                            <CustomSelect
                              options={BannerSelect}
                              className="select d-flex"
                              placeholder="Select"
                            />
                          </div>
                          <div className="d-flex align-items-center banner-search5">
                            <div className="search-icon5">
                              <i className="fa-regular fa-building" />
                            </div>
                            <input
                              type="email"
                              className="form-control"
                              placeholder="Search for Courses, Instructors"
                            />
                          </div>
                        </div>
                        <button
                          className="btn btn-primary sub-btn"
                          type="submit"
                        >
                          <i className="fas fa-arrow-right" />
                        </button>
                      </div>
                    </div>
                  </form>
                </div> */}
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

export default Banner;
