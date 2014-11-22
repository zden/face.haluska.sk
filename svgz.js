var svgz_data = "";
var svgz_shapes = 0;

// more info: http://www.w3schools.com/svg/svg_examples.asp

function svgz_start(width, height)
{
	svgz_data = "";

	svgz_data =
		'<?xml version="1.0" standalone="yes"?>\n'+
		'<svg width="'+width+'" height="'+height+'" version="1.1" xmlns="http://www.w3.org/2000/svg">\n'+
		'<!--\n'+
		'***** generated with Geometric Photo Filter by Zden Hlinka - http://face.haluska.sk - http://Zd3N.com *****\n'+
		'-->\n';
	svgz_shapes = 0;
}

function svgz_get_style(fill, color, alfa, line_width, cap)
{
	var col_fill, col_stroke;

	if (fill)
	{
		col_fill = color;
		col_stroke = "transparent";
	}
	else
	{
		col_stroke = color;
		col_fill = "transparent";
	}

	var style = 'style="fill:'+col_fill+';stroke:'+col_stroke+';stroke-width:'+line_width+';opacity:'+alfa.toFixed(3)+'"';
	return style;
}

function svgz_get_style2(color, alfa, line_width, cap)
{
	col_stroke = color;

	var style = 'style="stroke:'+col_stroke+';stroke-width:'+line_width+';stroke-linecap:'+cap+';opacity:'+alfa.toFixed(3)+'"';
	return style;
}

function svgz_rect(x, y, wid, hei, fill, color, alfa, line_width)
{
	if (wid < 0)
	{
		x += wid;
		wid *= -1;
	}
	if (hei < 0)
	{
		y += hei;
		hei *= -1;
	}
	var style = svgz_get_style(fill, color, alfa, line_width);

	svgz_data +=
		'<rect x="'+x+'" y="'+y+'" width="'+wid+'" height="'+hei+'" '+style+' />\n';
	svgz_shapes++;
}

function svgz_circle(x, y, r, fill, color, alfa, line_width)
{
	var style = svgz_get_style(fill, color, alfa, line_width);

	svgz_data +=
		'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" '+style+' />\n';
	svgz_shapes++;
}

function svgz_triangle(x, y, xx, yy, xxx, yyy, fill, color, alfa, line_width)
{
	var style = svgz_get_style(fill, color, alfa, line_width);

	svgz_data +=
		'<polygon points="'+x+','+y+' '+xx+','+yy+' '+xxx+','+yyy+'" '+style+' />\n';
	svgz_shapes++;
}

function svgz_line(x1, y1, x2, y2, color, alfa, line_width, cap)
{
	var style = svgz_get_style2(color, alfa, line_width, cap);

	svgz_data +=
		'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" '+style+' />\n';
	svgz_shapes++;
}

 //<polygon points="200,10 250,190 160,210" style="fill:lime;stroke:purple;stroke-width:1" />

function svgz_end()
{
	return svgz_data + "</svg>\n";
}