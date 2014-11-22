November/15/2014 - V.1.16 - svg export - recording of vector data and saving in svg format (lacking gradient support for now)
  August/14/2014 - V.1.15 - gif creator - gif encoder by Kevin Kwok, safer painting saving via blobs by Eli Grey
    July/27/2014 - V.1.10 - filter in webworker, gradient with alfa end parameter, capture camera support, hue & saturation as bonus
    July/22/2014 - V.1.05 - Presets - 7 examples and simple load/save, custom Canvas Color, Alfa fix
    July/19/2014 - V.1.02 - Line Width and Line Cap options
    July/18/2014 - V.1.01 - touch devices [ upload image ] support
    July/17/2014 - V.1.00 - initial release

known-bugs:  - squashed images of _large_ bitmaps on iOS devices (Safari bug)
             - unfilled circles with gradient does not react to alfa (Firefox bug)

known-gif-bugs:
             - Chrome could crash when saving too big gif (20MB+)
             - Safari saves gif to the same tab as running filter :(
             - Safari on iOS will not save gif at all :((

gif-tip:
             - Firefox performs best when creating large gifs with too many (200+) large frames (640x640+)
             - make large gifs reasonably big (30-40MB is still OK) so you won't experience unsaved gif
               and console error "uncaught exception: out of memory"

solved bugs:
(fixed by blobs in V.1.15) - SAVE PAINTING crashes sometimes on large (horizontal) bitmaps (js bug?)