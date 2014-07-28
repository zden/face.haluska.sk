
var SHADER_LINE = 0;
var SHADER_TRIANGLE = 1;
var SHADER_BOX = 2;
var SHADER_CIRCLE = 3;
var SHADER_WALK = 4;

var DVAPI = 2*Math.PI;

// ---------- helpers ----------

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
		case 'do':
						p = e.data;
						GeometricPhotoFilter(
										p.val_steps, p.val_walk_steps, p.val_shader, p.val_alfa,
										p.val_pixel_start_dist, p.val_pixel_dist,
										p.val_angle_start, p.val_angle_start_rand, p.val_arc_length,
										p.val_pixel_similiar, p.val_inverted_fade, p.val_dist_fade
										);
						break;
	}
}, false);

// actual algo \o/
// written by Zden Hlinka, Jun-July 2014 (C) Satori, s.r.o., All right reserved., zden@satori.sk
// for non-commercial, artistic and educational use only

function GeometricPhotoFilter(val_steps, val_walk_steps, val_shader, val_alfa,
												val_pixel_start_dist, val_pixel_dist,
												val_angle_start, val_angle_start_rand, val_arc_length,
												val_pixel_similiar, val_inverted_fade, val_dist_fade)
{
	var a, c, x, y, p;
	var col, col_end, col_mid;
	var xx, yy, xxx, yyy, ang, pp, dist;
	var ang_s, ang_e, found;
	var alfa;

	function get_alfa(dist)
	{
		var alfa = ( dist - val_pixel_start_dist + 1 ) / ( val_pixel_dist - val_pixel_start_dist + 1 );
		if (!val_inverted_fade) alfa = 1 - alfa;
		alfa = (val_alfa * alfa) / 100;
		alfa = ( (val_alfa/100) * (100 - val_dist_fade) ) / 100 + ( alfa * val_dist_fade ) / 100;
		return (alfa);
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

		do {
			found = 0;
			for (dist = val_pixel_start_dist; dist <= val_pixel_dist && !found; dist++)
			{
				ang_s = (DVAPI * val_angle_start)/360;
				ang_s += (DVAPI * rnd(val_angle_start_rand))/360;
				ang_e = ang_s + ((val_arc_length) * DVAPI)/360;
				for (ang = ang_s; ang < ang_e; ang += 0.031415926)
				{
					xx = x + Math.sin(ang)*dist;
					yy = y + Math.cos(ang)*dist;
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
					col_mid = col_end;
				}
			}
			else
			{
				if (found)
				{
					alfa = get_alfa(dist);
					out.push({x:x,y:y,xx:xx,yy:yy,col:col,col_end:col_end,alfa:alfa}); // walker paint
					x = xx; y = yy;
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
					out.push({x:x,y:y,xx:xx,yy:yy,col:col,col_end:col_end,alfa:alfa});
					break;
				case SHADER_TRIANGLE:
					out.push({x:x,y:y,xx:xx,yy:yy,xxx:xxx,yyy:yyy,col:col,col_end:col_end,col_mid:col_mid,alfa:alfa});
					break;
				case SHADER_CIRCLE:
					//out.push({x:(x+xx)/2,y:(y+yy)/2,r:Math.sqrt((xx-x+1)*(xx-x+1) + (yy-y+1)*(yy-y+1)),col:col,alfa:alfa});
					out.push({x:x,y:y,r:Math.sqrt((xx-x+1)*(xx-x+1) + (yy-y+1)*(yy-y+1)),col:col,col_end:col_end,alfa:alfa});
					break;
				case SHADER_BOX:
					out.push({x:x,y:y,xx:xx-x+1,yy:yy-y+1,col:col,col_end:col_end,alfa:alfa});
					break;
			}
		}
	}
	postMessage({shader:val_shader,out:out});
	out.length = 0;
}
