export default function StoryTransition() {
  return <div className="story-transition" data-story-transition>
    <div className="story-transition__circle" data-story-circle aria-hidden="true"/>
    <h2 id="story-title" className="display story-transition__title">
      <span className="story-transition__line" data-story-line>
        <span>KEEP LEARNING.</span>
        <span className="story-transition__inverse" data-story-inverse aria-hidden="true">KEEP LEARNING.</span>
      </span>
      <span className="story-transition__line" data-story-line>
        <span>KEEP CREATING.</span>
        <span className="story-transition__inverse" data-story-inverse aria-hidden="true">KEEP CREATING.</span>
      </span>
    </h2>
  </div>;
}
