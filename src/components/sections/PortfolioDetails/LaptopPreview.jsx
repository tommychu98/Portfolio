import './LaptopPreview.css';

export default function LaptopPreview() {
  return <div className="diptyque-laptop-preview">
    {/* Keep the GIF's native aspect ratio; compose the bezel and keyboard separately. */}
    <svg className="diptyque-laptop-preview__frame" viewBox="0 0 1536 982" aria-hidden="true">
      <svg x="0" y="0" width="1536" height="790" viewBox="0 0 1536 675" preserveAspectRatio="none" overflow="hidden">
        <image href="/media/images/diptyque/vintage-laptop.png" width="1536" height="1024"/>
      </svg>
      <svg x="0" y="790" width="1536" height="192" viewBox="0 675 1536 349" preserveAspectRatio="none" overflow="hidden">
        <image href="/media/images/diptyque/vintage-laptop.png" width="1536" height="1024"/>
      </svg>
    </svg>
    <img className="diptyque-laptop-preview__screen" src="/media/images/diptyque/brand-experience.gif" alt="빈티지 노트북 화면에서 재생되는 딥디크 브랜드 경험 웹사이트" width="720" height="454" loading="lazy"/>
  </div>;
}
