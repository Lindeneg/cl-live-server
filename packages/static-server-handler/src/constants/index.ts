/* istanbul ignore file */
export const INJECT_CANDIDATES = [
    new RegExp('</body>', 'i'),
    new RegExp('</svg>'),
    new RegExp('</head>', 'i'),
];

export const POSSIBLE_EXTENSIONS = ['', '.html', '.htm', '.xhtml', '.php', '.svg'];
