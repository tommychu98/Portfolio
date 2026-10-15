import ScrollProvider from './components/layout/ScrollProvider';
import Header from './components/layout/Header';
import Intro from './components/sections/Intro/Intro';
import Preloader from './components/Preloader/Preloader';
import { introObjects } from './components/sections/Intro/Intro.objects';
import Story from './components/sections/Story/Story';
import WorkValues from './components/sections/WorkValues/WorkValues';
import BoundaryBounce from './components/transitions/BoundaryBounce/BoundaryBounce';
import Profile from './components/sections/Profile/Profile';
import WorksIntro from './components/sections/WorksIntro/WorksIntro';
import ZaraOverview from './components/sections/ZaraOverview/ZaraOverview';
import ZaraDetails from './components/sections/ZaraDetails/ZaraDetails';
import ZaraProcess from './components/sections/ZaraProcess/ZaraProcess';
import PersonalWorks from './components/sections/PersonalWorks/PersonalWorks';
import Film from './components/sections/Film/Film';
import CloneCoding from './components/sections/CloneCoding/CloneCoding';
import Skills from './components/sections/Skills/Skills';
import About from './components/sections/About/About';
import Closing from './components/sections/Closing/Closing';
import Contact from './components/sections/Contact/Contact';

const introSources = introObjects.map(object=>object.src);

export default function App() {
  return <ScrollProvider>
    <Header />
    <main id="main">
      <Preloader sources={introSources}>{ready=><Intro ready={ready}/>}</Preloader>
      <Story />
      <BoundaryBounce id="story-values" from="#194e73" to="var(--paper)" />
      <WorkValues />
      <BoundaryBounce id="values-profile" from="var(--paper)" to="#CBD5D8" />
      <Profile />
      <WorksIntro />
      <ZaraOverview />
      <ZaraDetails />
      <ZaraProcess />
      <PersonalWorks />
      <Film />
      <CloneCoding />
      <Skills />
      <About />
      <Closing />
      <Contact />
    </main>
  </ScrollProvider>;
}
