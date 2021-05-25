# On the state of modals.

## It's no ideal.

I know.

## Why?

The modal system for connecting wallets was built as a global component that could be used
from any page. Adding a second modal (the ones for process types) to this logic didn't
quite work. The reason for this is that the components didn't really understand the mouse
click events that were used to open, close, and choose options from the differen modals.

Also, it doesn't make a lot of sense for the process type modal to be global, as it is
only used on one page.

## Where are we now?

The modal components have essentially been duplicated. Each modal has it's own container,
layout, event detections, etc. Also, the modal for processes is only available on the
token info page, where it is used, while the wallet modal is still globally available. The
only thing they have in commone is the opening/closing mechanism, which is handled
by the global modal context.

The system should be refactored eventually, but currently having nice code is less of a
priority than having working code.

VR 25-05-2021
