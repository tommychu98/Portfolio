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
import PortfolioOverview from './components/sections/PortfolioOverview/PortfolioOverview';
import PortfolioDetails from './components/sections/PortfolioDetails/PortfolioDetails';
import PortfolioProcess from './components/sections/PortfolioProcess/PortfolioProcess';
import BrandHistory from './components/sections/BrandHistory/BrandHistory';
import PersonalWorks from './components/sections/PersonalWorks/PersonalWorks';
import Film from './components/sections/Film/Film';
import FilmArchive from './components/sections/FilmArchive';
import CloneCoding from './components/sections/CloneCoding/CloneCoding';
import Skills from './components/sections/Skills/Skills';
import About from './components/sections/About/About';
import MemoryWall from './components/sections/About/MemoryWall';
import Contact from './components/sections/Contact/Contact';
import PortfolioTextMotion from './components/ui/PortfolioTextMotion';
import SectionStack from './components/transitions/SectionStack';

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
      <SectionStack>
        <WorksIntro />
        <PortfolioOverview />
      </SectionStack>
      <PortfolioDetails />
      <PortfolioProcess />
      <BrandHistory />
      <PersonalWorks />
      <Film />
      <SectionStack>
        <FilmArchive />
        <CloneCoding />
        <Skills />
        <About />
      </SectionStack>
      <MemoryWall />
      <Contact />
      <PortfolioTextMotion />
    </main>
  </ScrollProvider>;
}
