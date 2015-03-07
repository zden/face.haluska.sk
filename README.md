face.haluska.sk | FACE FILTER | source release

Geometric Photo Filter - Exporting PNG, GIF, SVG

This filter performs best on high detailed portrait pictures.
______________________________________________________________________________________________________

Photo filter based on random lookup for neighbouring pixels with similar color property
and applying found pixels' positions and color for shading via drawing basic geometric primitives.

Seek for the similar pixel is started from the center radially. You can set starting and ending seek
distance as well range of the circle sector. Alpha is calculated according to the distance of found
pixels. "Line Walk" is a special mode when line primitive repeats seek process multiple times
for the same color starting again from the newly found pixel.
______________________________________________________________________________________________________

(c) Zden Hlinka | Satori, s.r.o.
developed in 2014-2015
______________________________________________________________________________________________________

V.1.15 introduces GIF creator and starts to include sources from other authors:

/gif      - Thanks to Kevin Kwok for simple jsgif library.
            Gif encoder sources: https://github.com/antimatter15/jsgif
/filesave - Eli Grey wrote support for canvas to blob and blob file saving. Large paintings
            and gifs are saved much more safely.
            File save, canvas to blob sources: https://github.com/eligrey

(large gifs can still crash your tab on certain browsers - read changelog for details)
