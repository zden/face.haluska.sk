
var SHADER_LINE = 0;
var SHADER_TRIANGLE = 1;
var SHADER_BOX = 2;
var SHADER_CIRCLE = 3;
var SHADER_WALK = 4;

var DVAPI = 2*Math.PI;

// ---------- helpers ----------

var new_color; // dirty passing of new color

function RGB(r,g,b)
{
	this.r = r;
	this.g = g;
	this.b = b;
	this.str = 'rgb(' + r + ',' + g + ',' + b + ')';
	return this;
}

function rnd(n)
{
  return Math.floor( Math.random() * n );
}

// ---------- processing image data & resolution ----------

var img_data;
var x_res, y_res;

var out = new Array();
out = [];

var vectors = new Array();

// ---------- handle events ----------

self.addEventListener('message', function(e)
{
	var p;

	switch (e.data.cmd)
	{
		case 'start':
						break;
		case 'img':
						img_data = e.data.img_data;
						x_res = e.data.x_res;
						y_res = e.data.y_res;
						break;
		case 'start_paint':
						vectors.length = 0;
						break;
		case 'do':
						p = e.data;
						GeometricPhotoFilter(
										p.val_steps, p.val_walk_steps, p.val_shader, p.val_shape_precision, p.val_alfa,
										p.val_pixel_start_dist, p.val_pixel_dist,
										p.val_angle_start, p.val_angle_start_rand, p.val_arc_length,
										p.val_pixel_similiar, p.val_inverted_fade, p.val_dist_fade,
										p.val_no_overlap, p.val_allow_inside
										);
						break;
	}
}, false);

// actual algo \o/
// written by Zden Hlinka, Jun-July 2014 (C) Satori, s.r.o., All right reserved., zden@satori.sk
// for non-commercial, artistic and educational use only

function GeometricPhotoFilter(val_steps, val_walk_steps, val_shader, val_shape_precision, val_alfa,
												val_pixel_start_dist, val_pixel_dist,
												val_angle_start, val_angle_start_rand, val_arc_length,
												val_pixel_similiar, val_inverted_fade, val_dist_fade,
												val_no_overlap, val_allow_inside)
{
	var a, c, cc, x, y, p, x_, y_, w, h, r;
	var col, col_end, col_mid;
	var xx, yy, xxx, yyy, ang, pp, dist, dist_sub;
	var ang_s, ang_e, found;
	var alfa;
	var v;

	function get_alfa(dist)
	{
		var alfa = ( dist - val_pixel_start_dist + 1 ) / ( val_pixel_dist - val_pixel_start_dist + 1 );
		if (!val_inverted_fade) alfa = 1 - alfa;
		alfa = (val_alfa * alfa) / 100;
		alfa = ( (val_alfa/100) * (100 - val_dist_fade) ) / 100 + ( alfa * val_dist_fade ) / 100;
		alfa = Math.abs(alfa);
		alfa = alfa.toFixed(3);
		return (alfa);
	}
	function dist(x1, y1, x2, y2)
	{
		var dx = x2 - x1, dy = y2 - y1;
		return (Math.sqrt( dx*dx + dy*dy ));
	}


	for (a = 0; a < val_steps; a++)
	{
		x = rnd(x_res - 1);
		y = rnd(y_res - 1);

		p = y*x_res*4 + x*4;
		col = new RGB(img_data[p], img_data[p+1], img_data[p+2]);

		if (val_shader == SHADER_WALK)
			c = val_walk_steps;
		else
			c = val_shader == SHADER_TRIANGLE ? 2 : 1;

		dist_sub = 0;
		do {
			found = 0;
			for (dist = val_pixel_start_dist; dist <= val_pixel_dist && !found; dist++)
			{
				ang_s = (DVAPI * val_angle_start)/360;
				ang_s += (DVAPI * rnd(val_angle_start_rand))/360;
				ang_e = ang_s + ((val_arc_length) * DVAPI)/360;
				for (ang = ang_s; ang < ang_e; ang += 0.031415926)
				{
					xx = x + Math.sin(ang)*(dist-dist_sub);
					yy = y + Math.cos(ang)*(dist-dist_sub);
					xx = Math.floor(xx);
					yy = Math.floor(yy);
					if (xx < 0) break; if (yy < 0) break;
					if (xx >= x_res) break; if (yy >= y_res) break;
					pp = (yy*x_res + xx) << 2;
					if ( Math.abs(img_data[p] - img_data[pp]) <= val_pixel_similiar &&
						Math.abs(img_data[p+1] - img_data[pp+1]) <= val_pixel_similiar &&
						Math.abs(img_data[p+2] - img_data[pp+2]) <= val_pixel_similiar )
					{
						found = 1;
						col_end = new RGB(img_data[pp], img_data[pp+1], img_data[pp+2]);
						break;
					}
				}
			}
			if (val_shader != SHADER_WALK)
			{
				if (c == 2)
				{
					xxx = xx;
					yyy = yy;
					x_ = x; y_ = y;
					ang = DVAPI/6;
					x = Math.cos(ang)*(xxx - x_) - Math.sin(ang)*(yyy - y_) + x_;
					y = Math.sin(ang)*(xxx - x_) + Math.cos(ang)*(yyy - y_) + y_;
					dist_sub = val_pixel_start_dist;
					col_mid = col_end;
				}
			}
			else
			{
				if (found)
				{
					alfa = get_alfa(dist);				
					if (!val_shape_precision || line_check(val_pixel_similiar, val_shape_precision, x, y, xx, yy, col))
					{
						v = { s:'l', x1:x, y1:y, x2:xx, y2:yy };
						if (!val_no_overlap || !shape_overlap(v, val_allow_inside))
						{
							vectors.push(v);
							out.push({x:x,y:y,xx:xx,yy:yy,col:(!val_shape_precision ? col : new_color),col_end:col_end,alfa:alfa});
							x = xx+1; y = yy+1;
						}
					}
				}
			}
			c--;
		} while (c && found);
		if (val_shader != SHADER_WALK && found)
		{	
			alfa = get_alfa(dist);
			switch (val_shader)
			{
				case SHADER_LINE:
					if (!val_shape_precision || line_check(val_pixel_similiar, val_shape_precision, x, y, xx, yy, col))
					{
						v = { s:'l', x1:x, y1:y, x2:xx, y2:yy };
						if (!val_no_overlap || !shape_overlap(v, val_allow_inside))
						{
							vectors.push(v);
							out.push({x:x,y:y,xx:xx,yy:yy,col:(!val_shape_precision ? col : new_color),col_end:col_end,alfa:alfa});
						}
					}
					break;
				case SHADER_TRIANGLE:
					if (!val_shape_precision || triangle_check(val_pixel_similiar, val_shape_precision, x_, y_, xx, yy , xxx, yyy, col))
					{
						v = { s:'t', x1:x_, y1:y_,x2:xx, y2:yy, x3:xxx, y3:yyy };
						if (!val_no_overlap || !shape_overlap(v, val_allow_inside))
						{
							vectors.push(v);
							out.push({x:x_,y:y_,xx:xx,yy:yy,xxx:xxx,yyy:yyy,col:(!val_shape_precision ? col : new_color),col_end:col_end,col_mid:col_mid,alfa:alfa});
						}
					}
					break;
				case SHADER_CIRCLE:
					r = Math.sqrt((xx-x+1)*(xx-x+1) + (yy-y+1)*(yy-y+1));
					if (!val_shape_precision || circ_check(val_pixel_similiar, val_shape_precision, x, y, r, col))
					{
						v = { s:'c', x:x, y:y, r:r };
						if (!val_no_overlap || !shape_overlap(v, val_allow_inside))
						{
							vectors.push(v);
							out.push({x:x,y:y,r:r,col:(!val_shape_precision ? col : new_color),col_end:col_end,alfa:alfa});
						}
					}
					break;
				case SHADER_BOX:
					w = xx-x+1;
					h = yy-y+1;

					if (w < 0)
					{
						x += w;
						w *= -1;
					}
					if (h < 0)
					{
						y += h;
						h *= -1;
					}
					
					if (!val_shape_precision || rect_check(val_pixel_similiar, val_shape_precision, x, y, w, h, col))
					{
						v = { s:'r', x:x, y:y, w:w, h:h };
						if (!val_no_overlap || !shape_overlap(v, val_allow_inside))
						{
							vectors.push(v);
							out.push({x:x,y:y,xx:w,yy:h,col:(!val_shape_precision ? col : new_color),col_end:col_end,alfa:alfa});
						}
					}
					break;
			}
		}
	}
	postMessage({shader:val_shader,out:out});
	out.length = 0;
}

function circ_check(val_pixel_similiar, val_shape_precision, x, y, r, col)
{
	var i1, i2;
	var c = 0;
	var px, py, p;
	var f = 0, fn = 0;
	var r = col.r;
	var g = col.g;
	var b = col.b;

	for (i1 = 0; i1 <= r; i1 += 1)
	{
		for (i2 = 0; i2 <= DVAPI; i2 += DVAPI/64)
		{
			px = x + i1*Math.sin(i2);
			py = y + i1*Math.cos(i2);
			px = Math.floor(px);
			py = Math.floor(py);
			p = py*x_res*4 + px*4;

			if ( Math.abs(img_data[p] - r) <= val_pixel_similiar &&
				Math.abs(img_data[p+1] - g) <= val_pixel_similiar &&
				Math.abs(img_data[p+2] - b) <= val_pixel_similiar )
			{
				f++;

				r += img_data[p];
				g += img_data[p+1];
				b += img_data[p+2];
				r >>= 1; g >>= 1; b >>= 1;
			}
			else
			{ fn++; }
			c++;
		}
	}
	c = (c * val_shape_precision) / 100;
	if (f >= c) { new_color = new RGB(r, g, b); return 1; }
	return 0;
}

function rect_check(val_pixel_similiar, val_shape_precision, x, y, w, h, col)
{
	var i1, i2;
	var c = 0;
	var px, py, p;
	var f = 0, fn = 0;
	var r = col.r;
	var g = col.g;
	var b = col.b;

	for (i1 = 0; i1 <= 1; i1 += 0.05)
	{
		for (i2 = 0; i2 <= 1; i2 += 0.05)
		{
			px = x + w*i1;
			py = y + h*i1;
			px = Math.floor(px);
			py = Math.floor(py);
			p = py*x_res*4 + px*4;

			if ( Math.abs(img_data[p] - r) <= val_pixel_similiar &&
				Math.abs(img_data[p+1] - g) <= val_pixel_similiar &&
				Math.abs(img_data[p+2] - b) <= val_pixel_similiar )
			{
				f++;

				r += img_data[p];
				g += img_data[p+1];
				b += img_data[p+2];
				r >>= 1; g >>= 1; b >>= 1;
			}
			else
			{ fn++; }
			c++;
		}
	}
	c = (c * val_shape_precision) / 100;
	if (f >= c) { new_color = new RGB(r, g, b); return 1; }
	return 0;
}

function line_check(val_pixel_similiar, val_shape_precision, x, y, xx, yy, col)
{
	var i1;
	var p, px, py;
	var f = 0, fn = 0;
	var r = col.r;
	var g = col.g;
	var b = col.b;
	var c = 0;

	for (i1 = 0; i1 <= 1; i1 += 0.05)
	{
		px = x + (xx - x)*i1;
		py = y + (yy - y)*i1;
		px = Math.floor(px);
		py = Math.floor(py);
		p = py*x_res*4 + px*4;

		if ( Math.abs(img_data[p] - r) <= val_pixel_similiar &&
			Math.abs(img_data[p+1] - g) <= val_pixel_similiar &&
			Math.abs(img_data[p+2] - b) <= val_pixel_similiar )
		{
			f++;
			r += img_data[p];
			g += img_data[p+1];
			b += img_data[p+2];
			r >>= 1; g >>= 1; b >>= 1;
		}
		else
		{ fn++; }
		c++;
	}
	c = (c * val_shape_precision) / 100;
	if (f >= c) { new_color = new RGB(r, g, b); return 1; }
	return 0;
}

function triangle_check(val_pixel_similiar, val_shape_precision, x, y, xx, yy, xxx, yyy, col)
{
	var i1, i2;
	var tx1, ty1, tx2, ty2;
	var p, px, py;
	var c = 0;

	var f = 0, fn = 0;
	var r = col.r;
	var g = col.g;
	var b = col.b;

	for (i2 = 0; i2 <= 1; i2 += 0.05)
	{
		tx1 = x + (xxx - x)*i2;
		ty1 = y + (yyy - y)*i2;
		tx2 = x + (xx - x)*i2;
		ty2 = y + (yy - y)*i2;
		for (i1 = 0; i1 <= 1; i1 += 0.05)
		{
			px = tx1 + (tx2 - tx1)*i1;
			py = ty1 + (ty2 - ty1)*i1;
			px = Math.floor(px);
			py = Math.floor(py);

			p = py*x_res*4 + px*4;

			if ( Math.abs(img_data[p] - r) <= val_pixel_similiar &&
				Math.abs(img_data[p+1] - g) <= val_pixel_similiar &&
				Math.abs(img_data[p+2] - b) <= val_pixel_similiar )
			{
				f++;
				r += img_data[p];
				g += img_data[p+1];
				b += img_data[p+2];
				r >>= 1; g >>= 1; b >>= 1;
			}
			else
			{ fn++; }
			c++;
		}
	}
	c = (c * val_shape_precision) / 100;
	if (f >= c) { new_color = new RGB(r, g, b); return 1; }
	return 0;
}

// overlap, inside

function intersect_line_line(v_in, v)
{
	var t1, t2;

	var sd, s1_x, s1_y, s2_x, s2_y;
	
	s1_x = v_in.x2 - v_in.x1;
	s1_y = v_in.y2 - v_in.y1;
	s2_x = v.x2 - v.x1;
	s2_y = v.y2 - v.y1;
	
	sd = (-s2_x * s1_y + s1_x * s2_y);
	if (sd != 0)
	{
		t1 = (-s1_y * (v_in.x1 - v.x1) + s1_x * (v_in.y1 - v.y1)) / sd;
		t2 = ( s2_x * (v_in.y1 - v.y1) - s2_y * (v_in.x1 - v.x1)) / sd;

		if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) return 1;
	}
	return 0;
}

function intersect_triangle_triangle(t1, t2)
{
	var t1_l1 = { x1:t1.x1, y1:t1.y1, x2:t1.x2, y2:t1.y2 };
	var t1_l2 = { x1:t1.x2, y1:t1.y2, x2:t1.x3, y2:t1.y3 };
	var t1_l3 = { x1:t1.x3, y1:t1.y3, x2:t1.x1, y2:t1.y1 };
	var t2_l1 = { x1:t2.x1, y1:t2.y1, x2:t2.x2, y2:t2.y2 };
	var t2_l2 = { x1:t2.x2, y1:t2.y2, x2:t2.x3, y2:t2.y3 };
	var t2_l3 = { x1:t2.x3, y1:t2.y3, x2:t2.x1, y2:t2.y1 };

	if (intersect_line_line(t1_l1, t2_l1)) return 1;
	if (intersect_line_line(t1_l1, t2_l2)) return 1;
	if (intersect_line_line(t1_l1, t2_l3)) return 1;
	if (intersect_line_line(t1_l2, t2_l1)) return 1;
	if (intersect_line_line(t1_l2, t2_l2)) return 1;
	if (intersect_line_line(t1_l2, t2_l3)) return 1;
	if (intersect_line_line(t1_l3, t2_l1)) return 1;
	if (intersect_line_line(t1_l3, t2_l2)) return 1;
	if (intersect_line_line(t1_l3, t2_l3)) return 1;
	return 0;
}

function dist(x1, y1, x2, y2)
{
	var dx = x2 - x1, dy = y2 - y1;
	return (Math.sqrt( dx*dx + dy*dy ));
}

function dist_nsq(x1, y1, x2, y2)
{
	var dx = x2 - x1, dy = y2 - y1;
	return ( dx*dx + dy*dy );
}

function intersect_line_circle(l, c)
{
	var dx = l.x2 - l.x1;
	var dy = l.y2 - l.y1;
	var a = dx * dx + dy * dy;
	var b = 2.0 * (dx * (l.x1 - c.x) + dy * (l.y1 - c.y));
	var cc = c.x * c.x + c.y * c.y;

	cc += l.x1 * l.x1 + l.y1 * l.y1;
	cc -= 2.0 * (c.x * l.x1 + c.y * l.y1);
	cc -= c.r * c.r;

	var r = b * b - 4 * a * cc;

	if (r < 0)
		return 0;

	var mu = (-b + Math.sqrt( b*b - 4*a*cc )) / (2*a);
	var ix1 = l.x1 + mu*(dx);
	var iy1 = l.y1 + mu*(dy);
	mu = (-b - Math.sqrt(b*b - 4*a*cc )) / (2*a);
	var ix2 = l.x1 + mu*(dx);
	var iy2 = l.y1 + mu*(dy);

	var testX;
	var testY;
	if (dist(l.x1, l.y1, c.x, c.y) < dist(l.x2, l.y2, c.x, c.y))
	{
		testX = l.x2;
		testY = l.y2;
	}
	else
	{
		testX = l.x1;
		testY = l.y1;
	}

	var dd = dist(l.x1, l.y1, l.x2, l.y2);
	if (dist(testX, testY, ix1, iy1) < dd || dist(testX, testY, ix2, iy2) < dd)
		return 1;
	return 0;
}

function intersect_triangle_circle(t, c)
{
	var t_l1 = { x1:t.x1, y1:t.y1, x2:t.x2, y2:t.y2 };
	var t_l2 = { x1:t.x2, y1:t.y2, x2:t.x3, y2:t.y3 };
	var t_l3 = { x1:t.x3, y1:t.y3, x2:t.x1, y2:t.y1 };

	if (intersect_line_circle(t_l1, c)) return 1;
	if (intersect_line_circle(t_l2, c)) return 1;
	if (intersect_line_circle(t_l3, c)) return 1;
	return 0;
}

function intersect_line_triangle(l, t)
{
	var t_l1 = { x1:t.x1, y1:t.y1, x2:t.x2, y2:t.y2 };
	var t_l2 = { x1:t.x2, y1:t.y2, x2:t.x3, y2:t.y3 };
	var t_l3 = { x1:t.x3, y1:t.y3, x2:t.x1, y2:t.y1 };

	if (intersect_line_line(l, t_l1)) return 1;
	if (intersect_line_line(l, t_l2)) return 1;
	if (intersect_line_line(l, t_l3)) return 1;
	return 0;
}

function inside_point_triangle(x, y, t)
{
	var a = ((t.y2 - t.y3)*(x - t.x3) + (t.x3 - t.x2)*(y - t.y3)) /
        ((t.y2 - t.y3)*(t.x1 - t.x3) + (t.x3 - t.x2)*(t.y1 - t.y3));
	var b = ((t.y3 - t.y1)*(x - t.x3) + (t.x1 - t.x3)*(y - t.y3)) /
       ((t.y2 - t.y3)*(t.x1 - t.x3) + (t.x3 - t.x2)*(t.y1 - t.y3));
	var g = 1.0 - a - b;

	if (a > 0 && b > 0 && g > 0) return 1;
	return 0;
}

function inside_line_triangle(l, t)
{
	if (inside_point_triangle(l.x1, l.y1, t)) return 1;
	if (inside_point_triangle(l.x2, l.y2, t)) return 1;
	if (inside_point_triangle(l.x3, l.y3, t)) return 1;
	return 0;
}

function inside_triangle_triangle(t1, t2)
{
	if (inside_point_triangle(t1.x1, t1.y1, t2)) return 1;
	if (inside_point_triangle(t1.x2, t1.y2, t2)) return 1;
	if (inside_point_triangle(t1.x3, t1.y3, t2)) return 1;
	if (inside_point_triangle(t2.x1, t2.y1, t1)) return 1;
	if (inside_point_triangle(t2.x2, t2.y2, t1)) return 1;
	if (inside_point_triangle(t2.x3, t2.y3, t1)) return 1;
	return 0;
}

function inside_line_circle(l, c)
{
	if (dist(l.x1, l.y1, c.x, c.y) < c.r || dist(l.x2, l.y2, c.x, c.y) < c.r) return 1;
	return 0;
}

function inside_triangle_circle(t, c)
{
	if (dist(t.x1, t.y1, c.x, c.y) < c.r || dist(t.x2, t.y2, c.x, c.y) < c.r || dist(t.x3, t.y3, c.x, c.y) < c.r) return 1;
	if (inside_point_triangle(c.x, c.y, t)) return 1;
	return 0;
}

function intersect_circle_circle(c1, c2)
{
	var tx = dist(c1.x, c1.y, c2.x, c2.y);

	if (tx < c1.r + c2.r) return 1;
	return 0;
}

function inside_circle_circle(c1, c2)
{
	var tx = dist(c1.x, c1.y, c2.x, c2.y);

	if (c1.r > c2.r)
	{
		if (tx + c2.r > c1.r) return 1;
	}
	else
	{
		if (tx + c1.r > c2.r) return 1;
	}
	return 0;
}

function intersect_line_rect(l, r)
{
	var rl1 = { x1: r.x, y1: r.y, x2: r.x + r.w, y2: r.y };
	var rl2 = { x1: r.x + r.w, y1: r.y, x2: r.x + r.w, y2: r.y + r.h };
	var rl3 = { x1: r.x + r.w, y1: r.y + r.h, x2: r.x, y2: r.y + r.h };
	var rl4 = { x1: r.x, y1: r.y + r.h, x2: r.x, y2: r.y };
	
	if (intersect_line_line(l, rl1)) return 1;
	if (intersect_line_line(l, rl2)) return 1;
	if (intersect_line_line(l, rl3)) return 1;
	if (intersect_line_line(l, rl4)) return 1;
	return 0;
}

function intersect_rect_rect(r1, r2)
{
	var rl1 = { x1: r1.x, y1: r1.y, x2: r1.x + r1.w, y2: r1.y };
	var rl2 = { x1: r1.x + r1.w, y1: r1.y, x2: r1.x + r1.w, y2: r1.y + r1.h };
	var rl3 = { x1: r1.x + r1.w, y1: r1.y + r1.h, x2: r1.x, y2: r1.y + r1.h };
	var rl4 = { x1: r1.x, y1: r1.y + r1.h, x2: r1.x, y2: r1.y };
	
	var r2l1 = { x1: r2.x, y1: r2.y, x2: r2.x + r2.w, y2: r2.y };
	var r2l2 = { x1: r2.x + r2.w, y1: r2.y, x2: r2.x + r2.w, y2: r2.y + r2.h };
	var r2l3 = { x1: r2.x + r2.w, y1: r2.y + r2.h, x2: r2.x, y2: r2.y + r2.h };
	var r2l4 = { x1: r2.x, y1: r2.y + r2.h, x2: r2.x, y2: r2.y };
	
	if (intersect_line_line(rl1, r2l1)) return 1;
	if (intersect_line_line(rl1, r2l2)) return 1;
	if (intersect_line_line(rl1, r2l3)) return 1;
	if (intersect_line_line(rl1, r2l4)) return 1;

	if (intersect_line_line(rl2, r2l1)) return 1;
	if (intersect_line_line(rl2, r2l2)) return 1;
	if (intersect_line_line(rl2, r2l3)) return 1;
	if (intersect_line_line(rl2, r2l4)) return 1;

	if (intersect_line_line(rl3, r2l1)) return 1;
	if (intersect_line_line(rl3, r2l2)) return 1;
	if (intersect_line_line(rl3, r2l3)) return 1;
	if (intersect_line_line(rl3, r2l4)) return 1;

	if (intersect_line_line(rl4, r2l1)) return 1;
	if (intersect_line_line(rl4, r2l2)) return 1;
	if (intersect_line_line(rl4, r2l3)) return 1;
	if (intersect_line_line(rl4, r2l4)) return 1;

	return 0;
}

function inside_point_rect(x, y, r)
{
	if (x >= r.x && x < r.x+r.w && y >= r.y && y < r.y+r.h) return 1;
	return 0;
}

function inside_rect_rect(r1, r2)
{
	if (inside_point_rect(r1.x, r1.y, r2)) return 1;
	if (inside_point_rect(r1.x+r1.w, r1.y, r2)) return 1;
	if (inside_point_rect(r1.x+r1.w, r1.y+r1.h, r2)) return 1;
	if (inside_point_rect(r1.x, r1.y+r1.h, r2)) return 1;
	
	if (inside_point_rect(r2.x, r2.y, r1)) return 1;
	if (inside_point_rect(r2.x+r2.w, r2.y, r1)) return 1;
	if (inside_point_rect(r2.x+r2.w, r2.y+r2.h, r1)) return 1;
	if (inside_point_rect(r2.x, r2.y+r2.h, r1)) return 1;
	return 0;
}

function inside_line_rect(l, r)
{
	if (inside_point_rect(l.x1, l.y1, r)) return 1;
	if (inside_point_rect(l.x2, l.y2, r)) return 1;
	return 0;
}

function intersect_rect_circle(r, c)
{
	var rl1 = { x1: r.x, y1: r.y, x2: r.x + r.w, y2: r.y };
	var rl2 = { x1: r.x + r.w, y1: r.y, x2: r.x + r.w, y2: r.y + r.h };
	var rl3 = { x1: r.x + r.w, y1: r.y + r.h, x2: r.x, y2: r.y + r.h };
	var rl4 = { x1: r.x, y1: r.y + r.h, x2: r.x, y2: r.y };

	if (intersect_line_circle(rl1, c)) return 1;
	if (intersect_line_circle(rl2, c)) return 1;
	if (intersect_line_circle(rl3, c)) return 1;
	if (intersect_line_circle(rl4, c)) return 1;
	return 0;
}

function inside_rect_circle(r, c)
{
	if (inside_point_rect(c.x, c.y, r)) return 1;

	if (dist(r.x, r.y, c.x, c.y) < c.r || dist(r.x+r.w, r.y, c.x, c.y) < c.r ||
		dist(r.x+r.w, r.y+r.h, c.x, c.y) < c.r || dist(r.x, r.y+r.h, c.x, c.y) < c.r) return 1;
	return 0;
}

function intersect_rect_triangle(r, t)
{
	var rl1 = { x1: r.x, y1: r.y, x2: r.x + r.w, y2: r.y };
	var rl2 = { x1: r.x + r.w, y1: r.y, x2: r.x + r.w, y2: r.y + r.h };
	var rl3 = { x1: r.x + r.w, y1: r.y + r.h, x2: r.x, y2: r.y + r.h };
	var rl4 = { x1: r.x, y1: r.y + r.h, x2: r.x, y2: r.y };
	
	if (intersect_line_triangle(rl1, t)) return 1;
	if (intersect_line_triangle(rl2, t)) return 1;
	if (intersect_line_triangle(rl3, t)) return 1;
	if (intersect_line_triangle(rl4, t)) return 1;
	return 0;
}

function inside_rect_triangle(r, t)
{
	if (inside_point_triangle(r.x, r.y, t)) return 1;
	if (inside_point_triangle(r.x+r.w, r.y, t)) return 1;
	if (inside_point_triangle(r.x+r.w, r.y+r.h, t)) return 1;
	if (inside_point_triangle(r.x, r.y+r.h, t)) return 1;

	if (inside_point_rect(t.x1, t.y1, r)) return 1;
	if (inside_point_rect(t.x2, t.y2, r)) return 1;
	if (inside_point_rect(t.x3, t.y3, r)) return 1;
	return 0;
}

function shape_overlap(v_in, val_allow_inside)
{
	var a, c = vectors.length, v;
	var t1, t2, tx, ty;

	for (a = 0; a < c; a++)
	{
		v = vectors[a];
		switch (v.s)
		{
			case 'c':
				switch (v_in.s)
				{
					case 'c':
						if (intersect_circle_circle(v_in, v))
						{
							if (!val_allow_inside) return 1;
							else
							if (inside_circle_circle(v_in, v)) return 1;
						}
						break;
					case 'l':
						if (intersect_line_circle(v_in, v)) return 1;
						if (!val_allow_inside && inside_line_circle(v_in, v)) return 1;
						break;
					case 't':
						if (intersect_triangle_circle(v_in, v)) return 1;
						if (!val_allow_inside && inside_triangle_circle(v_in, v)) return 1;
						break;
					case 'r':
						if (intersect_rect_circle(v_in, v)) return 1;
						if (!val_allow_inside && inside_rect_circle(v_in, v)) return 1;
						break;
				}
				break;
			case 'l':
				switch (v_in.s)
				{
					case 'l':
						if (intersect_line_line(v_in, v)) return 1;
						break;
					case 'c':
						if (intersect_line_circle(v, v_in)) return 1;
						if (!val_allow_inside && inside_line_circle(v, v_in)) return 1;
						break;
					case 't':
						if (intersect_line_triangle(v, v_in)) return 1;
						if (!val_allow_inside && inside_line_triangle(v, v_in)) return 1;
						break;
					case 'r':
						if (intersect_line_rect(v, v_in)) return 1;
						if (!val_allow_inside && inside_line_rect(v, v_in)) return 1;
						break;
				}
				break;
			case 't':
				switch (v_in.s)
				{
					case 't':
						if (intersect_triangle_triangle(v_in, v)) return 1;
						if (!val_allow_inside && inside_triangle_triangle(v_in, v)) return 1;
						break;
					case 'c':
						if (intersect_triangle_circle(v, v_in)) return 1;
						if (!val_allow_inside && inside_triangle_circle(v, v_in)) return 1;
						break;
					case 'l':
						if (intersect_line_triangle(v_in, v)) return 1;
						if (!val_allow_inside && inside_line_triangle(v_in, v)) return 1;
						break;
					case 'r':
						if (intersect_rect_triangle(v_in, v)) return 1;
						if (!val_allow_inside && inside_rect_triangle(v_in, v)) return 1;
						break;
				}
				break;
			case 'r':
				switch (v_in.s)
				{
					case 'r':
						if (intersect_rect_rect(v_in, v)) return 1;
						if (!val_allow_inside && inside_rect_rect(v_in, v)) return 1;
						break;
					case 'l':
						if (intersect_line_rect(v_in, v)) return 1;
						if (!val_allow_inside && inside_line_rect(v_in, v)) return 1;
						break;
					case 'c':
						if (intersect_rect_circle(v, v_in)) return 1;
						if (!val_allow_inside && inside_rect_circle(v, v_in)) return 1;
						break;
					case 't':
						if (intersect_rect_triangle(v, v_in)) return 1;
						if (!val_allow_inside && inside_rect_triangle(v, v_in)) return 1;
						break;
				}
		}
	}
	return 0;
}
