import { sectionNumber } from '../../data/sections';

export default function SectionLabel({sectionId, children}) {
  return <div className="section-label"><span>{sectionNumber(sectionId)} /</span><span>{children}</span></div>;
}
