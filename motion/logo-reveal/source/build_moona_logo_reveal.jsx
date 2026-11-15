// MOONA eclipse logo reveal v05: v04 plus two ring-fill variants: comets + cooling heat (v05a), cooling heat only (v05b).
// Same design as v03. S scales every spatial value; T() remaps v03 times to the shorter timeline.
// Run from After Effects: File > Scripts > Run Script File, or osascript DoScriptFile. Paths are relative to this file.
var HERE = File($.fileName).parent.fsName + "/";
var LOG = new File(HERE + "build_log.txt");
function log(s) { LOG.open("a"); LOG.writeln(s); LOG.close(); }
LOG.open("w"); LOG.close();

var SYMBOL = HERE + "MOONA-symbol-transparent.png";
var SOUND = HERE + "sound/MOONA_logo_reveal_sound.wav";
var S = 2;                 // 1 = 1080p, 2 = 4K
var VARIANT = "heat";      // set per build below: "comets" (1+2) or "heat" (2 only)
var FPS = 30, DUR = 5.3;
var NIGHT = [0.012, 0.02, 0.045];
var MOON = [0.04, 0.03, 0.024];

// v03 timeline -> v04: the moon now arrives at 1.1s instead of 1.7s, everything after shifts 0.7s earlier
function T(t) { return t <= 1.7 ? t * 1.1 / 1.7 : t - 0.7; }
function s(v) { if (v instanceof Array) { var o = []; for (var i = 0; i < v.length; i++) o.push(v[i] * S); return o; } return v * S; }
var C = s([643, 553]);

function easeArity(p) {
  try { var Ty = PropertyValueType; if (p.propertyValueType === Ty.TwoD || p.propertyValueType === Ty.ThreeD) return p.value.length; } catch (e) {}
  return 1;
}
// list: [[v03time, value, inInfluence, outInfluence], ...] in time order
function keys(p, list) {
  for (var i = 0; i < list.length; i++) p.setValueAtTime(T(list[i][0]), list[i][1]);
  var n = p.numKeys, ar = easeArity(p);
  for (var k = 1; k <= n; k++) {
    var it = list[k - 1];
    var inI = (it.length > 2 && it[2] != null) ? it[2] : 33, outI = (it.length > 3 && it[3] != null) ? it[3] : 33;
    p.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
    var ein = [], eout = [];
    for (var d = 0; d < ar; d++) { ein.push(new KeyframeEase(0, Math.max(0.1, inI))); eout.push(new KeyframeEase(0, Math.max(0.1, outI))); }
    p.setTemporalEaseAtKey(k, ein, eout);
  }
}
function tr(l, name) { return l.property("ADBE Transform Group").property(name); }
function shapeEllipse(comp, name, w, h, pos, color) {
  var l = comp.layers.addShape(); l.name = name;
  var c = l.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group").property("ADBE Vectors Group");
  c.addProperty("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size").setValue([w, h]);
  c.addProperty("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color").setValue(color);
  tr(l, "ADBE Position").setValue(pos);
  return l;
}
function fx(l, match, props) {
  var e = l.property("ADBE Effect Parade").addProperty(match);
  for (var k in props) {
    var pr = e.property(k);
    if (!pr) { log("  missing prop " + l.name + " " + k); continue; }
    try { pr.setValue(props[k]); } catch (e2) { log("  fx prop fail " + l.name + " " + k + ": " + e2.toString()); }
  }
  return e;
}
function ellipseShape(cx, cy, w, h) {
  var K = 0.5523, rx = w / 2, ry = h / 2, sh = new Shape();
  sh.vertices = [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]];
  sh.inTangents = [[-K * rx, 0], [0, -K * ry], [K * rx, 0], [0, K * ry]];
  sh.outTangents = [[K * rx, 0], [0, K * ry], [-K * rx, 0], [0, -K * ry]];
  sh.closed = true; return sh;
}
function rectShape(cx, cy, w, h) {
  var sh = new Shape();
  sh.vertices = [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]];
  sh.closed = true; return sh;
}
function mask(l, shape, mode, feather) {
  var m = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  m.property("ADBE Mask Shape").setValue(shape); m.maskMode = mode;
  if (feather) m.property("ADBE Mask Feather").setValue([feather, feather]);
  return m;
}
function solid(comp, name, color, w, h) { return comp.layers.addSolid(color, name, w || comp.width, h || comp.height, 1); }
function text(comp, name, str, font, size, color, tracking, pos) {
  var l = comp.layers.addText(str); l.name = name;
  var sp = l.property("ADBE Text Properties").property("ADBE Text Document");
  var td = sp.value; td.resetCharStyle();
  td.font = font; td.fontSize = size; td.applyFill = true; td.fillColor = color;
  td.tracking = tracking || 0; td.justification = ParagraphJustification.LEFT_JUSTIFY;
  sp.setValue(td); tr(l, "ADBE Position").setValue(pos);
  return l;
}
function newComp(name, w, h) { var c = app.project.items.addComp(name, w, h, 1, DUR, FPS); c.motionBlur = true; return c; }

var symbolItem = null;
function buildEclipse(name, w, h, gradientBG, haloBase, haloDrop) {
  var comp = newComp(name, w, h);
  var bg = solid(comp, "BG_night", NIGHT);
  if (gradientBG) fx(bg, "ADBE Ramp", { "Start of Ramp": s([960, 540]), "Start Color": [0.04, 0.065, 0.12], "End of Ramp": s([960, 1500]), "End Color": [0.006, 0.01, 0.025], "Ramp Shape": 2 });

  var halo = shapeEllipse(comp, "SUN_halo", s(760), s(760), C, [1, 0.78, 0.5]);
  tr(halo, "ADBE Scale").setValue([140, 140]);
  fx(halo, "ADBE Gaussian Blur 2", { "Blurriness": s(320), "Repeat Edge Pixels": 0 });
  halo.blendingMode = BlendingMode.ADD;

  var core = shapeEllipse(comp, "SUN_core", s(250), s(250), C, [1, 0.94, 0.82]);
  fx(core, "ADBE Gaussian Blur 2", { "Blurriness": s(6), "Repeat Edge Pixels": 0 });
  fx(core, "ADBE Glo2", { "Glow Threshold": 40, "Glow Radius": s(120), "Glow Intensity": 1.2 });

  var rays = solid(comp, "CORONA_rays", [0, 0, 0], s(1000), s(1000));
  tr(rays, "ADBE Position").setValue(C);
  var fn = fx(rays, "ADBE Fractal Noise", { "Contrast": 170, "Brightness": -25, "Uniform Scaling": 0, "Scale Width": s(18), "Scale Height": s(3000), "Complexity": 3 });
  fn.property("Evolution").expression = "time*25;";
  fx(rays, "ADBE Polar Coordinates", { "Interpolation": 1, "Type of Conversion": 1 });
  fx(rays, "ADBE Tint", { "Map Black To": [0, 0, 0], "Map White To": [1, 0.86, 0.66] });
  mask(rays, ellipseShape(s(500), s(500), s(760), s(760)), MaskMode.ADD, s(300));
  rays.blendingMode = BlendingMode.ADD;
  tr(rays, "ADBE Rotate Z").expression = "time*2;";
  keys(tr(rays, "ADBE Opacity"), [[2.15, 0, 33, 33], [3, 34, 70, 33]]);

  var stars = solid(comp, "STARS", [0, 0, 0]);
  fx(stars, "ADBE Fill", { "Color": [0.85, 0.9, 1] });
  fx(stars, "CC Star Burst", { "Speed": 0, "Scatter": s(300), "Size": 25 * S });
  stars.blendingMode = BlendingMode.ADD;
  keys(tr(stars, "ADBE Opacity"), [[1.1, 0, 33, 33], [2.4, 55, 70, 33]]);

  var moon = shapeEllipse(comp, "MOON_disc", s(262), s(262), C, MOON);
  keys(tr(moon, "ADBE Position"), [[0, s([120, 625]), 33, 30], [1.7, C, 85, 33]]);
  moon.motionBlur = true;
  // set after MOON_disc exists, AE evaluates the expression immediately
  tr(halo, "ADBE Opacity").expression = "C=[" + C[0] + "," + C[1] + "];d=length(thisComp.layer(\"MOON_disc\").transform.position,C);cov=clamp(1-d/" + s(262) + ",0,1);" + haloBase + "-" + haloDrop + "*cov;";

  if (!symbolItem) symbolItem = app.project.importFile(new ImportOptions(new File(SYMBOL)));
  var both = (VARIANT == "comets");
  function addSymbol(nm) {
    var l = comp.layers.add(symbolItem); l.name = nm;
    tr(l, "ADBE Position").setValue(C); tr(l, "ADBE Scale").setValue([16.9 * S, 16.9 * S]);
    l.quality = LayerQuality.BEST; try { l.samplingQuality = LayerSamplingQuality.BICUBIC; } catch (e3) {}
    var m = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom"); m.name = "EDGE_clean";
    m.property("ADBE Mask Shape").setValue(ellipseShape(1023, 1023, 1554, 1582)); m.property("ADBE Mask Feather").setValue([4, 4]);
    fx(l, "ADBE Channel Blur", { "Alpha Blurriness": 4 });
    return l;
  }
  var sym = addSymbol("LOGO_symbol");
  // comets: the ring opens from the bottom-left (225deg) in both directions and closes at the flash point (45deg)
  var rw = fx(sym, "ADBE Radial Wipe", { "Start Angle": 45, "Wipe Center": [1024, 1024], "Feather": 140, "Wipe": both ? 3 : 1 });
  keys(rw.property("Transition Completion"), [[0.9, 100, 33, 70], [1.7, 100, 60, 60], [2.2, 0, 10, 33]]);
  var gl = fx(sym, "ADBE Glo2", { "Glow Threshold": 80, "Glow Radius": s(60) });
  keys(gl.property("Glow Intensity"), [[2.18, 0, 33, 20], [2.26, 0.3, 20, 20], [3.3, 0.06, 75, 33]]);
  gl.property("Glow Intensity").expression = "t=time-" + T(3.3) + ";value+(t>0?0.08*(1-Math.cos(t*2.4))/2:0);";

  var WIPE = "thisComp.layer(\"LOGO_symbol\").effect(\"Radial Wipe\")(\"Transition Completion\")";
  // heat: the freshly lit part of the rim glows white-hot, then orange, then cools to the logo gold
  var bands = [["RIM_hot_orange", 0.22, [1, 0.55, 0.15], 80], ["RIM_hot_white", 0.07, [1, 0.97, 0.9], 90]];
  for (var b = 0; b < bands.length; b++) {
    var hb = addSymbol(bands[b][0]);
    var w1 = fx(hb, "ADBE Radial Wipe", { "Start Angle": 45, "Wipe Center": [1024, 1024], "Feather": 140, "Wipe": both ? 3 : 1 });
    w1.property("Transition Completion").expression = WIPE + ";";
    var w2 = fx(hb, "ADBE Radial Wipe", { "Start Angle": both ? 225 : 45, "Wipe Center": [1024, 1024], "Feather": 140, "Wipe": both ? 3 : 2 });
    w2.property("Transition Completion").expression = "100-" + WIPE + ".valueAtTime(time-" + bands[b][1] + ");";
    fx(hb, "ADBE Tint", { "Map Black To": [0, 0, 0], "Map White To": bands[b][2] });
    fx(hb, "ADBE Glo2", { "Glow Threshold": 30, "Glow Radius": s(30), "Glow Intensity": 1.2 });
    hb.blendingMode = BlendingMode.ADD;
    tr(hb, "ADBE Opacity").setValue(bands[b][3]);
  }

  var OPA = "100*clamp((99.7-c)/7.7,0,1)*clamp((c-0.3)/2.7,0,1)";
  function posExpr(sign, lag) {
    var cc = lag ? WIPE + ".valueAtTime(time-" + lag + ")" : WIPE;
    var ang = both ? "225" + sign + "(1-c/100)*180" : "45-(1-c/100)*360";
    return "c=" + cc + ";a=degreesToRadians(" + ang + ");r=" + s(122) + ";[" + C[0] + "+r*Math.sin(a)," + C[1] + "-r*Math.cos(a)];";
  }
  if (!both) {
    var head = shapeEllipse(comp, "LIGHT_head", s(16), s(16), C, [1, 0.94, 0.82]);
    fx(head, "ADBE Gaussian Blur 2", { "Blurriness": s(5), "Repeat Edge Pixels": 0 });
    fx(head, "ADBE Glo2", { "Glow Threshold": 20, "Glow Radius": s(40), "Glow Intensity": 2.5 });
    head.blendingMode = BlendingMode.ADD;
    tr(head, "ADBE Position").expression = posExpr("", 0);
    tr(head, "ADBE Opacity").expression = "c=" + WIPE + ";" + OPA + ";";
  } else {
    var dirs = [["A", "-"], ["B", "+"]];
    for (var d = 0; d < 2; d++) {
      var tag = dirs[d][0], sg = dirs[d][1];
      for (var k = 10; k >= 1; k--) {
        var lag = (k * 0.012).toFixed(3);
        var dot = shapeEllipse(comp, "COMET_" + tag + "_trail_" + k, s(12), s(12), C, [1, 0.88, 0.62]);
        fx(dot, "ADBE Gaussian Blur 2", { "Blurriness": s(3), "Repeat Edge Pixels": 0 });
        dot.blendingMode = BlendingMode.ADD;
        tr(dot, "ADBE Position").expression = posExpr(sg, lag);
        tr(dot, "ADBE Opacity").expression = "c=" + WIPE + ".valueAtTime(time-" + lag + ");" + OPA + "*" + ((1 - k / 11) * 0.85).toFixed(3) + ";";
        var sc = 100 * (1 - k / 14); tr(dot, "ADBE Scale").setValue([sc, sc]);
      }
      var hd = shapeEllipse(comp, "COMET_" + tag + "_head", s(18), s(18), C, [1, 0.96, 0.88]);
      fx(hd, "ADBE Gaussian Blur 2", { "Blurriness": s(4), "Repeat Edge Pixels": 0 });
      fx(hd, "ADBE Glo2", { "Glow Threshold": 20, "Glow Radius": s(50), "Glow Intensity": 3 });
      hd.blendingMode = BlendingMode.ADD;
      tr(hd, "ADBE Position").expression = posExpr(sg, 0);
      tr(hd, "ADBE Opacity").expression = "c=" + WIPE + ";" + OPA + ";";

      var sp = solid(comp, "COMET_" + tag + "_sparks", [0, 0, 0]);
      sp.blendingMode = BlendingMode.ADD;
      try {
        var ps = sp.property("ADBE Effect Parade").addProperty("CC Particle Systems II");
        ps.property("Birth Rate").expression = "c=" + WIPE + ";(c>2&&c<97)?2.5:0;";
        ps.property("Longevity (sec)").setValue(0.35);
        var pr = ps.property("Producer");
        pr.property("Position").expression = posExpr(sg, 0);
        pr.property("Radius X").setValue(0); pr.property("Radius Y").setValue(0);
        var ph = ps.property("Physics");
        ph.property("Velocity").setValue(0.5); ph.property("Gravity").setValue(0.2);
        var pa = ps.property("Particle");
        pa.property("Birth Size").setValue(0.06); pa.property("Death Size").setValue(0);
        pa.property("Birth Color").setValue([1, 0.95, 0.8]); pa.property("Death Color").setValue([1, 0.45, 0.1]);
      } catch (e4) { log("  sparks setup: " + e4.toString()); }
    }
  }

  var F = s([728, 468]);
  var fc = shapeEllipse(comp, "FLASH_core", s(70), s(70), F, [1, 0.95, 0.85]);
  fx(fc, "ADBE Gaussian Blur 2", { "Blurriness": s(34), "Repeat Edge Pixels": 0 });
  fc.blendingMode = BlendingMode.ADD;
  keys(tr(fc, "ADBE Opacity"), [[2.13, 0, 33, 33], [2.22, 100, 20, 20], [2.9, 0, 70, 33]]);
  keys(tr(fc, "ADBE Scale"), [[2.13, [40, 40], 33, 33], [2.24, [180, 180], 20, 20], [2.9, [110, 110], 75, 33]]);

  var fs = shapeEllipse(comp, "FLASH_streak", s(1400), s(5), F, [1, 0.9, 0.74]);
  fx(fs, "ADBE Gaussian Blur 2", { "Blurriness": s(6), "Repeat Edge Pixels": 0 });
  fs.blendingMode = BlendingMode.ADD;
  keys(tr(fs, "ADBE Opacity"), [[2.16, 0, 33, 33], [2.23, 85, 20, 20], [3, 0, 70, 33]]);
  keys(tr(fs, "ADBE Scale"), [[2.16, [20, 100], 33, 33], [2.26, [100, 100], 20, 20], [3, [125, 100], 75, 33]]);
  return comp;
}

function buildWordmark(font) {
  var comp = newComp("MOONA_v05_wordmark", s(1920), s(1080));
  var letters = ["M", "O", "O", "N", "A"], WHITE = [0.86, 0.9, 0.96];
  for (var i = 0; i < 5; i++) {
    var x = 881 + i * 116.24, t0 = 2.32 + 0.07 * i;
    var l = text(comp, "TXT_" + (i + 1) + "_" + letters[i], letters[i], font, s(116), WHITE, 0, s([x, 584]));
    keys(tr(l, "ADBE Position"), [[t0, s([x - 50, 584]), 33, 22], [t0 + 0.8, s([x, 584]), 75, 33]]);
    if (i == 1 || i == 2) keys(tr(l, "ADBE Opacity"), [[t0 + 0.05, 0, 33, 33], [t0 + 0.45, 0, 33, 33], [t0 + 0.91, 100, 60, 33]]);
    else keys(tr(l, "ADBE Opacity"), [[t0 + 0.05, 0, 33, 33], [t0 + 0.45, 100, 60, 33]]);
    fx(l, "ADBE Gaussian Blur 2", { "Blurriness": 0 }).property("Blurriness").expression = "(100-transform.opacity)*" + (0.14 * S) + ";";
    l.motionBlur = true;
  }
  var phases = [["PHASE_crescent_O1", 1032, 2.39, true], ["PHASE_full_O2", 1148.4, 2.46, false]];
  for (var j = 0; j < 2; j++) {
    var p = phases[j], t = p[2];
    var sh = shapeEllipse(comp, p[0], s(74), s(74), s([p[1], 542]), WHITE);
    if (p[3]) { mask(sh, rectShape(0, 0, s(200), s(200)), MaskMode.ADD, 0); mask(sh, ellipseShape(s(-20), s(-8), s(74), s(74)), MaskMode.SUBTRACT, s(2)); }
    fx(sh, "ADBE Glo2", { "Glow Threshold": 50, "Glow Radius": s(25), "Glow Intensity": 0.6 });
    keys(tr(sh, "ADBE Position"), [[t, s([p[1] - 50, 542]), 33, 22], [t + 0.8, s([p[1], 542]), 75, 33]]);
    keys(tr(sh, "ADBE Opacity"), [[t + 0.05, 0, 33, 33], [t + 0.31, 100, 50, 50], [t + 0.61, 100, 50, 50], [t + 0.91, 0, 60, 33]]);
    keys(tr(sh, "ADBE Scale"), [[t + 0.61, [100, 100], 33, 30], [t + 0.91, [96, 118], 70, 33]]);
    sh.motionBlur = true;
  }
  var tag = text(comp, "TXT_tagline", "AI VIDEO STUDIO", font, s(30), [0.86, 0.75, 0.56], 640, s([885, 650]));
  keys(tr(tag, "ADBE Position"), [[3.55, s([885, 664]), 33, 22], [4.25, s([885, 650]), 75, 33]]);
  keys(tr(tag, "ADBE Opacity"), [[3.76, 0, 33, 33], [4.1, 100, 60, 33]]);
  tag.motionBlur = true;
  return comp;
}

function master(name, w, h, scene, soundItem) {
  var m = newComp(name, w, h); m.bgColor = NIGHT;
  var l = m.layers.add(scene);
  // slow push-in over the whole piece (times here are already v04 seconds)
  var sc = tr(l, "ADBE Scale");
  sc.setValueAtTime(0, [100, 100]); sc.setValueAtTime(DUR, [104, 104]);
  for (var k = 1; k <= 2; k++) { sc.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
    var e = [new KeyframeEase(0, k == 1 ? 10 : 40), new KeyframeEase(0, k == 1 ? 10 : 40), new KeyframeEase(0, k == 1 ? 10 : 40)]; sc.setTemporalEaseAtKey(k, e, e); }
  fx(l, "ADBE Noise", { "Amount of Noise": 2.5 });
  if (soundItem) { var a = m.layers.add(soundItem); a.name = "SFX_eclipse"; }
  return m;
}

try {
  for (var r = app.project.numItems; r >= 1; r--) { var it = app.project.item(r); if (it.name.indexOf("v05") >= 0) it.remove(); }
  app.project.bitsPerChannel = 16;
  app.beginUndoGroup("Build MOONA v05");
  var FONT = "HelveticaNeue";
  var W = buildWordmark(FONT); log("wordmark ok");
  var snd = null;
  if (new File(SOUND).exists) snd = app.project.importFile(new ImportOptions(new File(SOUND)));
  var VARS = [["comets", "v05a_comets"], ["heat", "v05b_heat"]];
  for (var vi = 0; vi < VARS.length; vi++) {
    VARIANT = VARS[vi][0]; var tagv = VARS[vi][1];
    var E16 = buildEclipse("MOONA_" + tagv + "_eclipse_16x9", s(1920), s(1080), true, 55, 43);
    var E916 = buildEclipse("MOONA_" + tagv + "_eclipse_9x16", s(1920), s(1920), false, 40, 35);
    var S16 = newComp("MOONA_" + tagv + "_scene_16x9", s(1920), s(1080));
    S16.layers.add(E16); S16.layers.add(W);
    var S916 = newComp("MOONA_" + tagv + "_scene_9x16", s(1080), s(1920));
    solid(S916, "BG_fill_night", NIGHT);
    var e = S916.layers.add(E916);
    tr(e, "ADBE Anchor Point").setValue(C); tr(e, "ADBE Position").setValue(s([540, 740])); tr(e, "ADBE Scale").setValue([150, 150]);
    var wl = S916.layers.add(W);
    tr(wl, "ADBE Anchor Point").setValue(s([1148.5, 600])); tr(wl, "ADBE Position").setValue(s([540, 1185])); tr(wl, "ADBE Scale").setValue([118, 118]);
    master("MOONA_reveal_" + tagv + "_16x9", s(1920), s(1080), S16, snd);
    master("MOONA_reveal_" + tagv + "_9x16", s(1080), s(1920), S916, snd);
    log(tagv + " ok");
  }
  app.endUndoGroup();
  app.project.save(new File(HERE + "MOONA_logo_reveal_rebuilt.aep"));
  log("saved " + app.project.file.fsName + " items=" + app.project.numItems);
} catch (err) {
  log("ERROR line " + err.line + ": " + err.toString());
}
