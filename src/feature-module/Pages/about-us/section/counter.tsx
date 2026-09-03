import ImageWithBasePath from "../../../../core/common/imageWithBasePath";
import CountUp from "react-countup";

const Counter = () => {
  return (
    <>
      {/* counter */}
      <section className="counter-sec">
        <div className="container">
          <div className="row gy-3 justify-content-center">
            <div className="col-xl-3 col-md-4">
              <div className="card border-0 mb-0">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="counter-icon">
                      <ImageWithBasePath
                        src="./assets/img/icons/counter-icon1.svg"
                        alt="img"
                      />
                    </div>
                    <div className="count-content">
                      <h4 className="text-info">
                        <span className="count-digit"><CountUp end={10} enableScrollSpy scrollSpyOnce /></span>+
                      </h4>
                      <p>Years of Experience</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-4">
              <div className="card border-0 mb-0">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="counter-icon">
                      <ImageWithBasePath
                        src="./assets/img/icons/counter-icon2.svg"
                        alt="img"
                      />
                    </div>
                    <div className="count-content">
                      <h4 className="text-warning">
                        <span className="count-digit"><CountUp end={1} enableScrollSpy scrollSpyOnce /></span>B+
                      </h4>
                      <p>Monthly Views</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-4">
              <div className="card border-0 mb-0">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="counter-icon">
                      <ImageWithBasePath
                        src="./assets/img/icons/counter-icon3.svg"
                        alt="img"
                      />
                    </div>
                    <div className="count-content">
                      <h4 className="text-skyblue">
                        <span className="count-digit"><CountUp end={100} enableScrollSpy scrollSpyOnce /></span>+
                      </h4>
                      <p>Success Stories</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* counter */}
    </>
  );
};

export default Counter;
