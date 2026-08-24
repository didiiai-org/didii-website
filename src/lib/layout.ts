/**
 * Page shell — one definition of "where content starts".
 *
 * The nav bar and every section use the same pair, so the wordmark, the hero
 * headline and every card below line up on the same left rule at every width.
 * Change the gutter here and the whole page moves together; that is the point.
 *
 *   <div className={gutter}>
 *     <div className={shell}> … </div>
 *   </div>
 *
 * The gutter is a percentage on the outer element and the cap lives on the
 * inner one, rather than mixing `max-w` with percentage padding on a single
 * element — percentage padding resolves against the *parent's* width, so that
 * combination drifts out of alignment as the viewport grows.
 */

/** Outer: the page margin. 5% from each edge on desktop, matching the frame. */
export const gutter = "px-5 sm:px-8 lg:px-[5%]";

/** Inner: caps the measure so lines stay readable on very wide displays. */
export const shell = "mx-auto w-full max-w-[1296px]";
