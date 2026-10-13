/* 학생의 실제 정보로 바꿀 수 있는 설정 파일. API 키는 필요하지 않습니다. */
const PORTFOLIO_DATA = {
  name: '전지현', email: '', resume: '', github: '',
  role: '메인 콘텐츠 배치, 상품 카드 UI 디자인, 담당 구간 구현과 공통 스타일 정리.',
  intro: '안녕하세요! 전지현의 포트폴리오 안내 챗봇입니다.\n회사원에서 웹디자이너로 전환한 이야기와 작업을 안내할게요. 아래 질문을 선택하거나 궁금한 내용을 입력해주세요.',
  topics: [
    {id:'intro', label:'자기소개', keys:['자기소개','누구','어떤 사람','이름','전지현','소개'], answer:'사무·운영 업무 경험을 UI/UX 디자인과 웹 퍼블리싱으로 연결하는 전지현입니다. 정보를 정리하고, 화면의 흐름과 디테일을 다듬는 일을 중요하게 생각합니다.', links:[['프로필 보기','#story']]},
    {id:'career', label:'회사원 경험', keys:['회사원','이전','전환','진로','시작','왜','경력'], answer:'자료와 일정, 여러 사람의 요청을 정리했던 경험에서 정보 전달에 관심을 가졌습니다. 같은 정보도 순서와 표현에 따라 이해하기 쉬워진다는 점을 웹 화면으로 확장하고 싶어 디자인과 구현을 배우기 시작했습니다.', links:[['MY STORY','#story']]},
    {id:'projects', label:'작업 보기', keys:['프로젝트 바로','작업','포트폴리오','몇 개','프로젝트','바로가기'], answer:'자라 팀 프로젝트 1개, 개인 메인 페이지 2개, BYREDO 영상 3편, 메인 페이지 구현 연습 3개가 있습니다. 아래에서 선택해주세요.', links:[['자라 팀 프로젝트','#zara'],['개인 작업 2개','#personal'],['클론 코딩 3개','#clone']]},
    {id:'zara', label:'자라 프로젝트', keys:['자라','zara','대표','팀프로젝트','팀 프로젝트'], answer:'대표 작업은 자라 웹사이트 리뉴얼 팀 프로젝트입니다. 메인의 컬렉션 비주얼, 추천 상품, 에디토리얼 콘텐츠와 커뮤니티 안내를 중심으로 구성과 표현 방식을 소개합니다.', links:[['상세 소개','#zara'],['결과 사이트','https://zara-renewal.vercel.app/']]},
    {id:'role', label:'담당 역할', keys:['담당','역할','기여','내가','맡았','기여도'], answer:'', links:[['담당 역할 보기','#zara']]},
    {id:'personal', label:'개인 작업', keys:['개인','엘랑','élan','elan','온다','onda'], answer:'개인 작업 2개는 메인 페이지만 제작했습니다. ÉLAN은 이미지와 여백 중심의 향수 브랜드, ONDA는 정보의 순서와 콘텐츠 구성을 보여주는 차 브랜드 데모입니다.', links:[['개인 작업 보기','#personal'],['ÉLAN 메인','pages/personal-01.html'],['ONDA 메인','pages/personal-02.html']]},
    {id:'clone', label:'클론 코딩', keys:['클론','clone','복제','따라'], answer:'클론 코딩 소개는 메인 페이지 3개 범위입니다. 실제 원본 사이트와 작업 링크가 아직 없어서 기업형·스튜디오형·브랜드형 학습 데모를 넣었습니다.', links:[['클론 코딩 보기','#clone']]},
    {id:'skills', label:'사용 기술', keys:['기술','스킬','skill','도구','툴','html','css','javascript','figma','react','퍼블리싱','gsap','scrolltrigger'], answer:"DESIGN: Figma, Photoshop, Illustrator\nFRONTEND: HTML, CSS, SCSS, JavaScript, React\nWORKFLOW: Git, GitHub, Vercel\nINTERACTION: GSAP, ScrollTrigger, Scrolla.js\nAI TOOLS: ChatGPT, Gemini, Claude\nVIDEO: Premiere Pro, After Effects, CapCut", links:[['SKILL 보기','#skill']]},
    {id:'attitude', label:'협업과 강점', keys:['협업','강점','장점','소통','디자인 철학','태도','가치'], answer:'정리·디테일·소통을 중요하게 생각합니다. 요청의 목적을 확인하고 해야 할 일을 구분하며, 글자·간격·버튼 같은 공통 기준을 팀과 맞추려 노력합니다.', links:[['ABOUT 보기','#about']]},
    {id:'scope', label:'제작 범위', keys:['앱','app','전체','범위','메인','ai','인공지능'], answer:'소개하는 작업은 웹사이트입니다. 자라는 팀 프로젝트이고, 개인 작업 2개와 클론 코딩 3개는 메인 페이지 범위입니다. 별도 앱이나 AI 서비스 작품은 포함하지 않습니다. 안내 챗봇은 준비된 답변과 키워드를 사용하며 외부 AI API를 호출하지 않습니다.', links:[['작업 목록','#work']]},
    {id:'film', label:'숏폼 영상', keys:['영상','숏폼','byredo','바이레도','film','video'], answer:'BYREDO 콘셉트 영상 THE QUIET EDIT, AFTER LIGHT, WEBSITE HERO를 소개합니다. AI 이미지에 카메라 움직임과 타이포그래피를 더한 각 16초 영상입니다.', links:[['숏폼 영상 보기','#shortForm']]},
    {id:'contact', label:'연락처', keys:['연락','이메일','메일','이력서','github','깃허브','채용','면접'], answer:'', links:[['CONTACT 보기','#contact']]}
  ]
};
function portfolioAnswer(input, data = PORTFOLIO_DATA) {
  const query = String(input).trim().toLowerCase().replace(/\s+/g,' ');
  if (!query) return null;
  // 담당 역할·제작 범위처럼 구체적인 질문을 먼저 확인합니다.
  const priority = ['role','contact','film','scope','clone','personal','skills','attitude','career','zara','projects','intro'];
  let topic = data.topics.find(t=>t.id===query);
  if (!topic) topic = priority.map(id=>data.topics.find(t=>t.id===id)).find(t=>t.keys.some(k=>query.includes(k.toLowerCase())));
  if (!topic) return {answer:'현재는 전지현의 소개와 등록된 작업을 안내하고 있어요. 아래에서 궁금한 항목을 선택해주세요.',links:[['자기소개','#story'],['작업 보기','#work'],['사용 기술','#skill']]};
  if(topic.id==='role') return {...topic,answer:data.role};
  if(topic.id==='contact') return {...topic,answer:data.email?`이메일 ${data.email}로 연락하실 수 있습니다. 등록된 이력서와 작업 링크는 CONTACT에서 확인해주세요.`:'연락처는 아직 등록되지 않았습니다. 실제 이메일과 이력서·GitHub 링크를 설정하면 CONTACT에서 확인하실 수 있어요.'};
  return topic;
}
if(typeof module !== 'undefined') module.exports={PORTFOLIO_DATA,portfolioAnswer};
