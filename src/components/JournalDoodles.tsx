/* Elaborate pencil-sketch scenes for the journal's left page, built like a
   real graphite drawing: a faint under-sketch, broken main contours, echo
   strokes, and massed hatching for shadow. All original artwork. */

const sw = {
  under: { stroke: 'currentColor', strokeWidth: 0.7, opacity: 0.16, fill: 'none', strokeLinecap: 'round' as const },
  main: { stroke: 'currentColor', strokeWidth: 1.5, opacity: 0.75, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const },
  echo: { stroke: 'currentColor', strokeWidth: 1, opacity: 0.3, fill: 'none', strokeLinecap: 'round' as const },
  hatch: { stroke: 'currentColor', strokeWidth: 0.8, opacity: 0.28, fill: 'none', strokeLinecap: 'round' as const },
  hatch2: { stroke: 'currentColor', strokeWidth: 0.7, opacity: 0.18, fill: 'none', strokeLinecap: 'round' as const },
  detail: { stroke: 'currentColor', strokeWidth: 1.1, opacity: 0.6, fill: 'none', strokeLinecap: 'round' as const },
};

export const DOODLES = [
  /* 1 — lone wolf on a ridge, grass, moon */
  <svg key="wolf" viewBox="0 0 200 140" className="journal-doodle-svg">
    <path {...sw.under} d="M40 96 Q80 84 120 88 Q160 92 188 86 M60 95 Q70 60 95 58 Q130 55 142 70" />
    <path {...sw.main} d="M58 94 Q62 78 72 68 Q80 60 94 58 Q102 57 108 60 L118 50 Q124 44 126 38 Q130 46 128 52 L124 58 Q136 62 140 72 Q143 80 140 88" />
    <path {...sw.main} d="M60 94 L62 112 M70 94 L70 112 M126 92 L128 112 M136 90 L134 110" />
    <path {...sw.main} d="M140 88 Q152 86 160 78 Q164 74 163 68" />
    <path {...sw.echo} d="M72 68 Q81 61 94 59 M118 50 Q124 44 126 39 M140 73 Q143 81 140 88" />
    <path {...sw.detail} d="M111 56 l2 1 M120 52 q2 -2 2 -4" />
    <path {...sw.hatch} d="M76 70 l-6 9 M82 68 l-7 10 M88 66 l-7 11 M94 65 l-7 11 M100 64 l-6 10 M106 64 l-6 10 M112 66 l-5 9 M118 70 l-5 8 M124 72 l-4 8 M130 76 l-4 7" />
    <path {...sw.hatch2} d="M64 84 l-4 7 M70 82 l-4 8 M134 82 l-3 7 M138 80 l-3 6" />
    <path {...sw.main} d="M20 100 Q60 94 100 96 Q150 98 184 92" />
    <path {...sw.detail} d="M30 100 l-2 -8 M36 99 l-1 -6 M44 98 l-2 -7 M152 96 l1 -7 M160 95 l2 -6 M172 94 l1 -5" />
    <circle cx="172" cy="28" r="11" {...sw.main} />
    <path {...sw.hatch2} d="M166 22 q-3 5 -2 11 M169 20 q-4 6 -3 13" />
    <path {...sw.hatch} d="M50 104 l88 -2 M58 108 l76 -1" opacity="0.12" />
  </svg>,

  /* 2 — campsite: tent, fire, smoke, pines, stars */
  <svg key="camp" viewBox="0 0 200 140" className="journal-doodle-svg">
    <path {...sw.under} d="M20 108 Q100 100 185 106 M30 104 L70 46 L112 104" />
    <path {...sw.main} d="M32 104 L70 48 L108 104 Z M70 48 L70 104 M58 104 L70 74 L82 104" />
    <path {...sw.echo} d="M35 101 L70 51 L104 101" />
    <path {...sw.hatch} d="M40 96 l8 -14 M44 99 l9 -16 M48 102 l10 -17 M86 88 l6 10 M91 83 l7 12 M96 79 l7 13" />
    <path {...sw.main} d="M138 96 Q134 88 140 82 Q134 82 132 76 Q140 76 142 70 Q146 76 152 76 Q148 82 154 84 Q146 88 146 96" />
    <path {...sw.detail} d="M128 102 L162 98 M132 106 L158 104 M136 97 l-5 7 M152 96 l6 7" />
    <path {...sw.hatch} d="M138 90 l6 -1 M137 86 l7 -2 M140 80 l5 -1" />
    <path {...sw.echo} d="M146 66 q-6 -8 2 -14 q8 -6 2 -14 q-4 -6 2 -10" />
    <path {...sw.main} d="M176 90 L176 104 M166 94 L176 72 L186 94 Z M168 84 L176 64 L184 84" />
    <path {...sw.hatch2} d="M172 88 l-3 5 M176 84 l-4 7 M180 88 l-3 5" />
    <path {...sw.detail} d="M26 30 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1 l3 -1 Z M50 18 l1 2 l2 1 l-2 1 l-1 2 l-1 -2 l-2 -1 l2 -1 Z M96 24 l1 2 l2 1 l-2 1 l-1 2 l-1 -2 l-2 -1 l2 -1 Z" />
    <path {...sw.main} d="M16 108 Q100 102 186 107" />
  </svg>,

  /* 3 — winding road, telephone poles, flying birds */
  <svg key="road" viewBox="0 0 200 140" className="journal-doodle-svg">
    <path {...sw.under} d="M10 120 Q80 100 120 70 Q150 48 160 30 M60 124 Q110 96 140 66" />
    <path {...sw.main} d="M14 124 Q70 108 112 76 Q144 52 156 28 M58 126 Q104 102 138 68 Q158 48 164 30" />
    <path {...sw.detail} d="M40 118 l8 -4 M62 106 l7 -5 M84 92 l6 -5 M104 78 l5 -5 M122 62 l4 -5 M138 48 l3 -4" />
    <path {...sw.main} d="M44 96 L44 60 M36 64 L52 64 M38 60 L50 60" />
    <path {...sw.echo} d="M45 95 L45 62" />
    <path {...sw.main} d="M98 74 L98 48 M92 51 L104 51" />
    <path {...sw.main} d="M136 52 L136 34 M132 36 L140 36" />
    <path {...sw.detail} d="M44 64 q27 -5 48 -13 M98 51 q20 -7 34 -15" opacity="0.35" />
    <path {...sw.hatch} d="M20 122 l10 -3 M28 124 l11 -4 M70 104 l8 -5 M78 106 l9 -6 M118 70 l6 -5 M124 72 l6 -5" />
    <path {...sw.detail} d="M150 86 q4 -4 8 0 q4 -4 8 0 M162 96 q3 -3 6 0 q3 -3 6 0" />
    <path {...sw.hatch2} d="M12 128 l40 -8 M20 132 l46 -11" />
  </svg>,

  /* 4 — mountain lake with pier and reflections */
  <svg key="lake" viewBox="0 0 200 140" className="journal-doodle-svg">
    <path {...sw.under} d="M10 70 L60 22 L95 58 L130 18 L190 70 M10 72 L190 72" />
    <path {...sw.main} d="M12 70 L60 24 L94 58 M80 44 L130 20 L188 70 M60 24 L74 38 M130 20 L118 34" />
    <path {...sw.echo} d="M16 68 L60 28 L92 60 M128 24 L184 68" />
    <path {...sw.detail} d="M52 32 L60 26 L66 34 M122 28 L130 22 L138 30" />
    <path {...sw.hatch} d="M30 56 l10 -11 M36 60 l11 -12 M42 64 l11 -12 M140 44 l10 11 M146 40 l11 12 M152 36 l11 13 M158 34 l10 11" />
    <path {...sw.main} d="M8 72 Q100 68 192 72" />
    <path {...sw.hatch2} d="M30 80 l26 0 M24 86 l38 0 M120 78 l30 0 M112 86 l44 0 M60 94 l60 0 M50 102 l80 0" />
    <path {...sw.echo} d="M48 76 l12 10 M150 76 l-14 12" />
    <path {...sw.main} d="M86 72 L84 100 M100 72 L100 102 M114 72 L116 100 M78 86 L122 88 M74 98 L126 100" />
    <path {...sw.detail} d="M170 64 q2 -8 0 -14 M176 66 q3 -7 2 -12 M26 66 q-2 -6 0 -12" />
  </svg>,

  /* 5 — freight train on rails, perspective */
  <svg key="train" viewBox="0 0 200 140" className="journal-doodle-svg">
    <path {...sw.under} d="M10 124 L150 116 M30 128 L160 118 M40 40 L150 44" />
    <path {...sw.main} d="M8 126 L188 112 M26 132 L190 118 M44 120 l0 6 M72 118 l0 6 M100 116 l0 6 M128 114 l0 6 M156 112 l0 6" />
    <path {...sw.main} d="M40 100 L40 48 L148 52 L148 98 Z" />
    <path {...sw.echo} d="M43 97 L43 51 L145 54" />
    <path {...sw.main} d="M78 98 L78 54 L112 55 L112 98 M83 60 L107 60" />
    <path {...sw.hatch} d="M46 56 l-4 8 M52 55 l-5 9 M58 55 l-5 10 M64 55 l-5 10 M120 58 l-4 9 M126 58 l-5 10 M132 59 l-5 9 M138 60 l-4 8" />
    <path {...sw.hatch2} d="M44 88 l100 -2 M44 92 l100 -1" />
    <path {...sw.main} d="M56 106 a6 6 0 1 0 0.1 0 M124 104 a6 6 0 1 0 0.1 0" />
    <path {...sw.detail} d="M148 70 l18 -2 M166 60 l0 20 M166 60 l8 -2" />
    <path {...sw.detail} d="M30 36 q6 -8 16 -8 M160 30 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1 l3 -1 Z" opacity="0.4" />
  </svg>,

  /* 6 — window with rain, mug on the sill */
  <svg key="window" viewBox="0 0 200 140" className="journal-doodle-svg">
    <path {...sw.under} d="M40 14 L160 16 L158 112 L42 110 Z" />
    <path {...sw.main} d="M42 16 L158 18 L156 110 L44 108 Z M100 17 L99 109 M43 62 L157 64" />
    <path {...sw.echo} d="M46 20 L154 22 M47 105 L153 107" />
    <path {...sw.hatch} d="M54 28 l16 22 M66 26 l14 19 M78 30 l12 16 M112 32 l15 20 M126 28 l14 19 M138 34 l11 15" opacity="0.33" />
    <path {...sw.hatch2} d="M50 70 l12 16 M60 74 l10 13 M110 72 l12 16 M124 76 l10 13 M140 70 l9 12" />
    <path {...sw.detail} d="M70 48 q3 6 0 10 M118 44 q3 6 0 11 M88 78 q2 5 0 9 M134 90 q2 4 0 8" />
    <path {...sw.main} d="M36 112 L164 114" />
    <path {...sw.main} d="M64 114 L64 128 Q64 134 72 134 L84 134 Q92 134 92 128 L92 115 M92 120 q8 -2 8 4 q0 6 -8 5" />
    <path {...sw.echo} d="M68 118 Q78 122 88 118" />
    <path {...sw.detail} d="M72 108 q-2 -6 2 -10 M80 108 q-2 -5 1 -9" opacity="0.4" />
  </svg>,

  /* 7 — skater kid, naive figure doodle */
  <svg key="skater" viewBox="0 0 200 140" className="journal-doodle-svg">
    <path {...sw.main} d="M96 20 a11 11 0 1 0 0.2 0 M86 18 Q96 10 108 16 L110 22 M86 18 L84 24" />
    <path {...sw.detail} d="M93 28 l0.2 0 M101 28 l0.2 0 M95 34 q3 2 6 0" strokeWidth="1.6" />
    <path {...sw.main} d="M97 42 Q95 56 94 66 M94 48 Q78 52 64 50 Q58 49 55 46 M96 48 Q114 52 128 46 Q133 44 135 40" />
    <path {...sw.main} d="M58 46 a4 4 0 1 0 0.1 0 M136 36 a4 4 0 1 0 0.1 0" />
    <path {...sw.echo} d="M96 44 Q95 55 94 64 M95 49 Q80 53 66 51" />
    <path {...sw.main} d="M94 66 Q86 78 76 86 Q72 90 70 96 M94 66 Q104 76 110 84 Q113 88 112 94" />
    <path {...sw.main} d="M56 100 Q90 110 134 98 Q138 97 140 94 M60 101 l-2 8 M130 100 l4 7" />
    <path {...sw.echo} d="M60 100 Q92 109 130 99" />
    <path {...sw.main} d="M66 112 a5 5 0 1 0 0.1 0 M122 110 a5 5 0 1 0 0.1 0 M84 114 a5 5 0 1 0 0.1 0 M104 113 a5 5 0 1 0 0.1 0" />
    <path {...sw.detail} d="M40 70 l10 2 M36 80 l12 1 M34 90 l10 0" opacity="0.35" />
    <path {...sw.hatch2} d="M98 52 l10 8 M94 56 l12 9" />
    <path {...sw.detail} d="M150 30 q4 -6 0 -10 q6 2 8 8" opacity="0.4" />
  </svg>,

  /* 8 — walker with a big backpack, seen from behind */
  <svg key="walker" viewBox="0 0 200 140" className="journal-doodle-svg">
    <path {...sw.main} d="M98 22 a10 10 0 1 0 0.2 0 M90 18 Q98 12 108 18" />
    <path {...sw.main} d="M92 42 L92 86 M110 42 L110 84 M92 50 Q84 54 80 64 M110 50 Q118 54 120 62" />
    <path {...sw.main} d="M88 44 L114 44 L116 78 L88 78 Z" />
    <path {...sw.echo} d="M91 47 L112 47 L113 75 L91 75" />
    <path {...sw.hatch} d="M92 52 l20 2 M92 58 l21 1 M92 64 l21 1 M92 70 l20 1" opacity="0.22" />
    <path {...sw.main} d="M96 86 Q94 100 90 110 Q89 114 85 116 M108 84 Q110 98 112 108 Q113 113 118 114" />
    <path {...sw.main} d="M80 118 L92 116 M112 116 L124 116" />
    <path {...sw.detail} d="M100 44 l0 -6 M104 38 q4 2 4 6" opacity="0.45" />
    <path {...sw.detail} d="M60 120 q30 6 80 0" opacity="0.3" />
    <path {...sw.hatch2} d="M70 124 l60 2 M78 128 l48 1" />
    <path {...sw.detail} d="M140 50 q6 -4 12 0 M148 58 q5 -3 10 0" opacity="0.35" />
  </svg>,

  /* 9 — peace-sign hand */
  <svg key="peace" viewBox="0 0 200 140" className="journal-doodle-svg">
    <path {...sw.main} d="M86 118 Q82 100 84 84 Q78 88 72 86 Q66 84 66 76 Q66 68 74 62 Q80 58 84 52 L88 30 Q89 24 94 25 Q98 26 97 33 L95 54 M97 44 L104 20 Q106 14 111 16 Q115 18 113 25 L106 52" />
    <path {...sw.main} d="M106 52 Q114 50 120 54 Q126 58 124 66 Q122 74 112 78 Q104 81 100 86 Q102 102 100 118" />
    <path {...sw.echo} d="M87 115 Q84 100 86 86 M90 32 Q90 26 93 27 M105 22 Q107 17 110 18" />
    <path {...sw.hatch} d="M88 92 l10 2 M87 98 l11 2 M87 104 l11 1 M88 110 l10 1" opacity="0.25" />
    <path {...sw.hatch2} d="M76 68 q6 -4 10 -8 M74 74 q6 -3 10 -7" />
    <path {...sw.main} d="M78 122 Q94 128 108 122" />
    <path {...sw.detail} d="M134 36 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1 l3 -1 Z M58 42 q-3 -4 0 -8" opacity="0.45" />
  </svg>,

  /* 10 — cassette tape and music notes */
  <svg key="cassette" viewBox="0 0 200 140" className="journal-doodle-svg">
    <path {...sw.main} d="M44 48 L156 50 L154 102 L46 100 Z" />
    <path {...sw.echo} d="M48 52 L152 54 L150 98 L50 96" />
    <path {...sw.main} d="M62 64 L138 66 L136 84 L64 82 Z" />
    <path {...sw.main} d="M76 74 a6 6 0 1 0 0.1 0 M120 75 a6 6 0 1 0 0.1 0" />
    <path {...sw.detail} d="M88 74 L112 75 M74 70 l4 8 M124 71 l-4 8" opacity="0.4" />
    <path {...sw.hatch} d="M52 90 l12 1 M52 94 l14 1 M136 92 l12 1 M134 96 l14 0" opacity="0.3" />
    <path {...sw.detail} d="M60 56 l8 0 M132 58 l8 0" />
    <path {...sw.main} d="M160 30 q2 -10 12 -12 l0 24 a5 4 0 1 1 -3 -5 M172 18 q6 2 8 7" />
    <path {...sw.main} d="M36 28 l0 16 a4 3.5 0 1 1 -2.5 -4 M36 28 q5 1 7 5" />
    <path {...sw.hatch2} d="M58 108 l84 2 M66 113 l68 1" />
  </svg>,
];

/* Tiny margin scribbles scattered on the right page, like idle pen marks. */
export const MARGINALIA = [
  /* scribbled star */
  <svg key="m-star" viewBox="0 0 40 40" className="journal-doodle-svg">
    <path {...sw.main} d="M20 6 L23 16 L33 17 L25 23 L28 33 L20 27 L12 33 L15 23 L7 17 L17 16 Z" strokeWidth="1.2" opacity="0.5" />
    <path {...sw.echo} d="M20 9 L22 16 M26 24 L28 31" strokeWidth="0.8" />
  </svg>,
  /* spiral */
  <svg key="m-spiral" viewBox="0 0 40 40" className="journal-doodle-svg">
    <path {...sw.main} d="M20 20 q4 -1 4 3 q0 5 -6 5 q-8 0 -8 -8 q0 -10 11 -10 q13 0 13 13" strokeWidth="1.2" opacity="0.45" />
  </svg>,
  /* swoosh arrow */
  <svg key="m-arrow" viewBox="0 0 48 40" className="journal-doodle-svg">
    <path {...sw.main} d="M6 32 Q20 28 30 18 Q36 12 40 8 M40 8 L32 10 M40 8 L38 16" strokeWidth="1.2" opacity="0.5" />
  </svg>,
  /* crossed scribble */
  <svg key="m-cross" viewBox="0 0 40 40" className="journal-doodle-svg">
    <path {...sw.main} d="M10 12 Q20 18 30 26 M30 12 Q20 20 10 28 M12 32 q8 2 16 0" strokeWidth="1.2" opacity="0.4" />
  </svg>,
];
