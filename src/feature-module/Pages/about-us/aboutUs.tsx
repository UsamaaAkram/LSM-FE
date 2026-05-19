import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb'
import AboutSection from './section/aboutSection'
import Benefits from './section/benefits'
import Faq from './section/faq'

const AboutUs = () => {
  return (
    <>
         <Breadcrumb title="About Us" />
         <AboutSection />
         <Benefits />
         <Faq />
    </>
  )
}

export default AboutUs