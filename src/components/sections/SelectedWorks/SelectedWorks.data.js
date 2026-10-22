
import { medipeel, medipeelDetail } from '../../../data/medipeel';
import { t1Project } from '../../../data/t1';
import { zippoProject } from '../../../data/zippo';

// Detail copy and media are maintained in each project's own data module.
export const selectedProjects = [{
  id: 'medipeel', name: medipeel.title, titleLines: ['MEDIPEEL', 'Renewal'],
  category: medipeel.label, introduction: medipeel.introduction, tools: medipeel.tools,
  background: '#385e59', accent: '#e7d6b3', foreground: '#fffaf1',
  cards: [
    { src: '/media/images/medipeel/cinema-open.jpg', alt: '메디필 시네마 섹션이 완전히 펼쳐진 이끼와 바위 화면', position: 'center' },
    { src: '/media/images/medipeel/main.jpg', alt: '메디필 실제 구현 메인 페이지', position: 'top' },
  ],
  paragraphs: medipeel.paragraphs, images: medipeel.images,
  detail: medipeelDetail,
  links: medipeelDetail.links,
}, t1Project, zippoProject];
