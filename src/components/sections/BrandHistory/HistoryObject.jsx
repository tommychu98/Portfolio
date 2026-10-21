export default function HistoryObject({ item, index, chapterId }) {
  const id = `history-object-${chapterId}-${index}`;
  return <figure className={`history-object history-object--${item.layout || item.motion || 'still'}`} data-history-thumb>
    <button type="button" aria-label={`${String(index + 1).padStart(2, '0')} ${item.label}`} aria-describedby={id}>
      <span className="history-object__visual">
        <span className="history-object__art">
          {item.motion === 'quote-frame' && <span className="history-object__framed-copy" aria-hidden="true"><strong>A SENSE OF<br/>DISCOVERY</strong><span>무엇을 발견하게 될지<br/>알 수 없는 경험.<br/><br/>아름답다고 느끼는 것은<br/>무엇이든 이곳으로.</span></span>}
          {item.layout === 'typography' ? [1, 2, 3].map(glyph => <span key={glyph} className={`history-object__glyph history-object__glyph--${glyph}`}><img src={item.src} alt="" loading="lazy" decoding="async" /></span>) : <img src={item.src} alt="" loading="lazy" decoding="async" />}
          {item.motion === 'plant' && <img className="history-object__leaves" src="/media/diptyque-history/fabric/floating-botanical-leaves.png" alt="" loading="lazy" decoding="async" />}
          {item.motion === 'clock' && <>
            <img className="history-object__hour" src="/media/diptyque-history/objects/objects-detail-visual-03.png" alt="" />
            <img className="history-object__minute" src="/media/diptyque-history/objects/objects-detail-visual-02.png" alt="" />
            <img className="history-object__cap" src={item.src} alt="" />
          </>}
          {['flame', 'candlestick'].includes(item.motion) && <span className="history-object__flame" />}
        </span>
      </span>
      <span className="history-object__number">{String(index + 1).padStart(2, '0')} <small>{item.kind}</small></span>
    </button>
    <figcaption id={id} className="history-object__tooltip" role="tooltip"><strong>{item.label}</strong><span>{item.description}</span></figcaption>
  </figure>;
}
