export function VesselListSVG({ background, isTitle }) {
  return (
    <svg
      height="23.707"
      style={isTitle ? { verticalAlign: 'text-bottom' } : {}}
      viewBox="0 0 24.707 23.707"
      width="24.707"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g data-name="Groupe 223" id="Groupe_223" transform="translate(-1876 -76)">
        <line
          data-name="Ligne 854"
          fill="none"
          id="Ligne_854"
          stroke="#E5E5EB"
          strokeWidth="2"
          transform="translate(1876 82)"
          x2="24"
        />
        <line
          data-name="Ligne 851"
          fill="none"
          id="Ligne_851"
          stroke="#E5E5EB"
          strokeWidth="2"
          transform="translate(1876 87)"
          x2="24"
        />
        <line
          data-name="Ligne 852"
          fill="none"
          id="Ligne_852"
          stroke="#E5E5EB"
          strokeWidth="2"
          transform="translate(1876 92)"
          x2="12"
        />
        <line
          data-name="Ligne 855"
          fill="none"
          id="Ligne_855"
          stroke="#E5E5EB"
          strokeWidth="2"
          transform="translate(1876 77)"
          x2="24"
        />
        <g data-name="Loupe 24 px" id="Loupe_24_px" transform="translate(1881 81)">
          <g id="Loupe" transform="translate(1)">
            <line
              data-name="Ligne 1"
              fill="none"
              id="Ligne_1"
              stroke="#E5E5EB"
              strokeWidth="2"
              transform="translate(12 12)"
              x2="6"
              y2="6"
            />
            <circle
              cx="7"
              cy="7"
              data-name="Ellipse 1"
              fill={background}
              id="Ellipse_1"
              r="7"
              stroke="#E5E5EB"
              strokeWidth="2"
            />
          </g>
        </g>
      </g>
    </svg>
  )
}
