import BvBanner from "./section/bv-banner";
import BvStruggling from "./section/bv-struggling";
import BvSystem from "./section/bv-system";
import BvCta from "./section/bv-cta";
import Footer from "./footer";

const HomeOne = () => {
  return (
    <div>
      <BvBanner />
      <BvStruggling />
      <BvSystem />
      <BvCta />
      <Footer />
    </div>
  );
};

export default HomeOne;
