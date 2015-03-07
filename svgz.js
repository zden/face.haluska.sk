var svgz_head = "";
var svgz_data = "";
var svgz_shapes = 0;
var svgz_wid, svgz_hei;

//var svgz_array = "";

// more info: http://www.w3schools.com/svg/svg_examples.asp

function svgz_start(width, height, name)
{
	svgz_data = "";
	svgz_array = "";
	svgz_wid = width;
	svgz_hei = height;
	
//	svgz_array = "var "+name+" = [ {x_res:"+width+",y_res:"+height+"},\n";

	svgz_head =
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

	var style = 'style="fill:'+col_fill+';stroke:'+col_stroke+';stroke-width:'+line_width+';opacity:'+alfa/*.toFixed(3)*/+'"';
	return style;
}

function svgz_get_style2(color, alfa, line_width, cap)
{
	col_stroke = color;

	var style = 'style="stroke:'+col_stroke+';stroke-width:'+line_width+';stroke-linecap:'+cap+';opacity:'+alfa/*.toFixed(3)*/+'"';
	return style;
}

function svgz_rect(x, y, wid, hei, fill, color, alfa, line_width)
{
	var style = svgz_get_style(fill, color, alfa, line_width);

	svgz_data +=
		'<rect x="'+x+'" y="'+y+'" width="'+wid+'" height="'+hei+'" '+style+' />\n';
//	svgz_array += "{s:'r',x:"+x+",y:"+y+",w:"+wid+",h:"+hei+",f:"+fill+",c:'"+color+"',a:"+alfa/*.toFixed(3)*/+",l:"+line_width+"},\n";
	svgz_shapes++;
}

function svgz_circle(x, y, r, fill, color, alfa, line_width)
{
	var style = svgz_get_style(fill, color, alfa, line_width);

	svgz_data +=
		'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" '+style+' />\n';
//	svgz_array += "{s:'c',x:"+x+",y:"+y+",r:"+r.toFixed(3)+",f:"+fill+",c:'"+color+"',a:"+alfa/*.toFixed(3)*/+",l:"+line_width+"},\n";
	svgz_shapes++;
}

function svgz_triangle(x, y, xx, yy, xxx, yyy, fill, color, alfa, line_width)
{
	var style = svgz_get_style(fill, color, alfa, line_width);

	svgz_data +=
		'<polygon points="'+x+','+y+' '+xx+','+yy+' '+xxx+','+yyy+'" '+style+' />\n';
//	svgz_array += "{s:'t',x1:"+x+",y1:"+y+",x2:"+xx+",y2:"+yy+",x3:"+xxx+",y3:"+yyy+",f:"+fill+",c:'"+color+"',a:"+alfa/*.toFixed(3)*/+",l:"+line_width+"},\n";
	svgz_shapes++;
}

function svgz_line(x1, y1, x2, y2, color, alfa, line_width, cap)
{
	var style = svgz_get_style2(color, alfa, line_width, cap);

	svgz_data +=
		'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" '+style+' />\n';
//	svgz_array += "{s:'l',x1:"+x1+",y1:"+y1+",x2:"+x2+",y2:"+y2+",c:'"+color+"',a:"+alfa/*.toFixed(3)*/+",l:"+line_width+"},\n";
	svgz_shapes++;
}

function svgz_end(bg, col)
{
	var bgc = "";
	if (!bg)
	{
		var style = svgz_get_style(1, col, 1, 0);
		bgc = '<rect x="'+0+'" y="'+0+'" width="'+svgz_wid+'" height="'+svgz_hei+'" '+style+' />\n';
	}

	return svgz_head + bgc + svgz_data + "</svg>\n";
}

/*function svgz_array_end()
{
	return svgz_array + " ];\n";
}*/