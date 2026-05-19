import Accelerate from "../home-five/section/accelerate";
import Acheivegoal from "../home-five/section/acheive-goal";
import Banner from "../home-five/section/banner";
import Callaction from "../home-five/section/call-action";
import Masterskill from "../home-five/section/master-skill";
import Onlinecourses from "../home-five/section/online-courses";
import Footer from "./footer";
import Testimonials from "./section/testimonials";

const HomeOne = () => {
  return (
    <div>
      <Banner />
      {/* <Onlinecourses /> */}
      <Masterskill />
      <Callaction />
      <Acheivegoal />
      <Accelerate />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default HomeOne;
