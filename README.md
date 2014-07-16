face.haluska.sk | FACE FILTER | source release

Geometric Photo Filter
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
developed in Jun-July 2014
