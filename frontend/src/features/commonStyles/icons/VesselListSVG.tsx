export const VesselListSVG = ({ background, isTitle }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24.707" height="23.707" viewBox="0 0 24.707 23.707"
         style={ isTitle ? { verticalAlign: 'text-bottom' } : null }>
      <g id="Groupe_223" data-name="Groupe 223" transform="translate(-1876 -76)">
        <line id="Ligne_854" data-name="Ligne 854" x2="24" transform="translate(1876 82)" fill="none" stroke="#E5E5EB"
              strokeWidth="2"/>
        <line id="Ligne_851" data-name="Ligne 851" x2="24" transform="translate(1876 87)" fill="none" stroke="#E5E5EB"
              strokeWidth="2"/>
        <line id="Ligne_852" data-name="Ligne 852" x2="12" transform="translate(1876 92)" fill="none" stroke="#E5E5EB"
              strokeWidth="2"/>
        <line id="Ligne_855" data-name="Ligne 855" x2="24" transform="translate(1876 77)" fill="none" stroke="#E5E5EB"
              strokeWidth="2"/>
        <g id="Loupe_24_px" data-name="Loupe 24 px" transform="translate(1881 81)">
          <g id="Loupe" transform="translate(1)">
            <line id="Ligne_1" data-name="Ligne 1" x2="6" y2="6" transform="translate(12 12)" fill="none"
                  stroke="#E5E5EB" strokeWidth="2"/>
            <circle id="Ellipse_1" data-name="Ellipse 1" cx="7" cy="7" r="7" fill={background} stroke="#E5E5EB"
                    strokeWidth="2"/>
          </g>
        </g>
      </g>
    </svg>
  )
}
