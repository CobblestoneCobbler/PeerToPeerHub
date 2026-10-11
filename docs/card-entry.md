# Card Entry

## Responsive grid

The card entry grid uses a CSS variable for the operator-name column width so it
can be tuned per breakpoint without touching inline styles:

- `--entry-op-col` (default `200px`) drives the first grid column in
  `title-row`, `group-header`, and `operator-row`.
- Prompt cells are grouped in inner containers (`.title-cells`,
  `.header-cells`, `.row-cells`) that use `repeat(n, minmax(0, 1fr))` so they
  shrink instead of overflowing.

Below `700px` (`@media (max-width: 700px)` in `src/styles/components.css`) the
rows switch to a single-column grid (`grid-template-columns: 1fr`), stacking the
operator/group name above its checkbox cells. Gaps, padding, and font sizes are
tightened to match. Because the stacked title row is taller on mobile, the sticky
`group-header` top is bumped to `145px`, and `.title-prompt` uses
`overflow-wrap: break-word` with reduced letter-spacing so nicknames wrap
instead of overlapping.
