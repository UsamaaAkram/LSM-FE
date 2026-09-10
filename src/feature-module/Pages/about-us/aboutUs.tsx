import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb'
import AboutSection from './section/aboutSection'
import Counter from './section/counter'
import Benefits from './section/benefits'
import Offerings from './section/offerings'
import Mission from './section/mission'
import Faq from './section/faq'

// Section order per #46: Hero -> What You'll Learn (Benefits) -> Offerings
// cards -> Mission. Counter sits with the hero as the animated statistics row.
const AboutUs = () => {
  return (
    <>
         <Breadcrumb title="About Us" />
         <AboutSection />
         <Counter />
         <Benefits />
         <Offerings />
         <Mission />
         <Faq />
    </>
  )
}

export default AboutUs