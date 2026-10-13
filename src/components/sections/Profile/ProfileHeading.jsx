const letters = text => [...text].map((character, index) => character === ' '
  ? ' '
  : <span className="profile__letter" data-profile-letter key={index}>{character}</span>);

export default function ProfileHeading() {
  return <p className="profile__word display" data-profile-heading>
    <span className="profile__heading-source">READY <em>TO</em><br/>CONTRIBUTE<span className="profile__punctuation">.</span></span>
    <span className="profile__heading-motion" aria-hidden="true">
      {letters('READY ')}<em>{letters('TO')}</em><br/>{letters('CONTRIBUTE')}<span className="profile__letter profile__punctuation" data-profile-letter>.</span>
    </span>
  </p>;
}
