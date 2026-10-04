# Island adventure design pass

The homepage keeps two chefs, the literal wordmark, and one Play link. The next section introduces exploring, gathering, and cooking. The cave kitchen now follows the supplied gameplay reference: an ornate gold vessel, parchment Behemoth Crown Roast recipe, cutting board, and log-fueled fire. Ten batches require 25 taps, matching the pictured ingredient quantities. This is a website demonstration, not a playable game build.

Effects use CSS, inline SVG and a local Canvas animation. Water is a masked copy of the existing island background with an animated SVG displacement filter. Steam and firelight animate near the pot; Canvas embers run only while the hearth is visible. Reduced-motion preferences and the footer atmosphere toggle stop decorative movement. The gallery supports enlarged artwork, previous/next navigation, Escape, and return focus.

## Generated artwork

Built-in image generation was used. The earlier rustic concept `assets/camp-kitchen.png` is retained but no longer displayed. The displayed golden vessel is `assets/cave-cooking-vessel.png`. The registered open-body variant is `assets/cave-cooking-vessel-open.png`, generated with transparent alpha using the existing golden vessel as the edit target. CSS clips the original lid into a separate moving layer. No external image service is called by the website.

## Chopping and feeding update

Each board activation advances one chop; a quantity of four needs four taps. A prepared batch is draggable. The lid stays lifted during a drag and closes on drop or cancellation. Accepted batches shrink into the opening, followed by a short vessel shake. The pot button offers the same action for touch and keyboard users. Duplicate submissions are locked during the feeding sequence. Reduced motion removes the decorative movement without blocking recipe progress.

Final open-body edit prompt (built-in tool mode):

> Use case: precise-object-edit. Image 1 is the edit target, a transparent game cooking vessel sprite. Create an OPEN version: remove ONLY the central domed lid and its finial (the removable lid ends at the narrow horizontal rim near y=400 on the 1280 square reference). Show a dark elliptical open mouth inside that upper rim. Everything else MUST stay registered in precisely the same pixel position and size: tall side handles, patterned neck band below lid, face relief, legs, logs, rocks and flames. Keep the full square canvas and all existing transparent margins, same lighting, gold material and viewpoint. Do not center or resize the remaining pot. No detached lid anywhere, no steam, no text. Genuine transparent background. This will be layered under the original lid for an animation, so accurate alignment is essential.

## Earlier rustic concept (retained, unused)

Final generation prompt:

> Use case: stylized-concept. Asset type: transparent illustration for a fantasy survival cooking game's website, Feast and Feral. Create one beautiful detailed stylized 3D game illustration, a rounded black cast-iron field cooking pot with elegant aged brass rim and handles, delicious golden stew with vegetable pieces visible inside, wooden ladle angled out to upper right. Pot sits on a small rustic stone hearth with glowing amber embers and small warm flames among split logs. Around the lower sides: a linen sack of dark purple dusk plums, a few luminous cream and pale lavender mushrooms, wild green cabbage leaves and herb sprigs, a small brown leather adventure pouch. Cozy yet adventurous, high quality fantasy game promotional art, warm golden firelight, lovely material definition, painterly edges with crisp focal detail. View three-quarter front slightly above to see inside pot. Entire composition isolated on transparent alpha, no landscape, no sky, no ground plane extending to canvas edges, no people, no text, no logo. Almost square landscape composition, pot fills center 65 percent, foliage extends subtly on lower left and right. Leave upper fifth airy for website animated steam. Warm brown ivory light gold and muted green palette, slight violet in mushrooms. Keep all props within frame. Do not paint steam; it will be animated in CSS.
