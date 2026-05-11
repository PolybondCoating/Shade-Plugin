/* ==============================================
   POLYBOND — COLOUR + PRODUCT DATA
   File: js/data.js

   HOW TO USE:
   - Replace the COLOURS array with your real 245 colours from polybond_colours.csv
   - Each colour object needs: code, name, hex, ral, lrv, gloss, finish, lab, rgb
   - Update PRODUCTS array to match your actual product range
=============================================== */


/* ==============================================
   COLOUR DATA
   code   : product code (e.g. "59406")
   name   : colour name (e.g. "PP RAL 9001 SATIN")
   hex    : hex colour code (e.g. "#E7DFD5")
   ral    : RAL equivalent (e.g. "RAL 9001")
   lrv    : light reflectance value 0-100
   gloss  : gloss units (GU@60°)
   finish : finish type — must match filter chips in index.html
            accepted values: "Satin Matt", "Gloss", "Texture", "Metallic",
                             "Metallic Satin", "Metallic Texture"
   lab    : LAB values as string (e.g. "L:89 a:1 b:6")
   rgb    : RGB values as string (e.g. "231,223,213")
=============================================== */
const COLOURS = [

  /* ---- REPLACE THIS SAMPLE DATA WITH YOUR 245 REAL COLOURS FROM polybond_colours.csv ---- */
  /* Format: { code:'XXXXX', name:'NAME', hex:'#RRGGBB', ral:'RAL XXXX', lrv:00, gloss:00, finish:'FINISH TYPE', lab:'L:00 a:00 b:00', rgb:'000,000,000' }, */

  // Blacks / Dark
  { code:'55103', name:'Super Black Glossy',  hex:'#0D0D0D', ral:'RAL 9005', lrv:2,  gloss:70, finish:'Gloss',      lab:'L:4 a:0 b:0',   rgb:'13,13,13' },
  { code:'59101', name:'PP RAL 9005 Satin',   hex:'#111111', ral:'RAL 9005', lrv:2,  gloss:35, finish:'Satin Matt', lab:'L:4 a:0 b:0',   rgb:'17,17,17' },

  // Whites / Creams
  { code:'59406', name:'PP RAL 9001 Satin',   hex:'#E7DFD5', ral:'RAL 9001', lrv:80, gloss:35, finish:'Satin Matt', lab:'L:89 a:1 b:6',  rgb:'231,223,213' },
  { code:'59582', name:'9002 Satin',           hex:'#E0DADA', ral:'RAL 9002', lrv:77, gloss:35, finish:'Satin Matt', lab:'L:86 a:0 b:1',  rgb:'224,218,218' },
  { code:'59580', name:'9003 Satin',           hex:'#F0F0EE', ral:'RAL 9003', lrv:87, gloss:35, finish:'Satin Matt', lab:'L:93 a:-1 b:0', rgb:'240,240,238' },

  // Greys
  { code:'59505', name:'9010 Satin',           hex:'#F2EFE8', ral:'RAL 9010', lrv:88, gloss:35, finish:'Satin Matt', lab:'L:94 a:-1 b:4', rgb:'242,239,232' },

  // Add your remaining 239 colours here following the same format

];


/* ==============================================
   PRODUCT DATA
   name   : product range name
   short  : short code (PP / EP / PE / PU)
   colour : accent colour for the product card icon (hex)
   desc   : product description paragraph
   apps   : array of application strings (shown as tags)
=============================================== */
const PRODUCTS = [
  {
    name:   'Pure Polyester',
    short:  'PP',
    colour: '#E8A857',
    desc:   'The workhorse of architectural powder coating. UV stable, excellent weatherability. Specified for exterior facades, curtain walling, aluminium extrusions.',
    apps:   ['Facade cladding', 'Curtain walling', 'Extrusion profiles', 'Louvre systems']
  },
  {
    name:   'Epoxy Polyester',
    short:  'EP',
    colour: '#6B8FA8',
    desc:   'Hybrid chemistry. Superior adhesion and chemical resistance. Specified for interior steelwork, industrial components, and applications with chemical exposure.',
    apps:   ['Interior steel', 'Furniture', 'Appliances', 'Industrial components']
  },
  {
    name:   'Pure Epoxy',
    short:  'PE',
    colour: '#7A9A78',
    desc:   'Maximum chemical and corrosion resistance. Chalks on UV exposure — interior use only or as primer coat in duplex systems.',
    apps:   ['Pipe coating', 'Rebar', 'Interior structural steel', 'Marine interiors']
  },
  {
    name:   'Polyurethane',
    short:  'PU',
    colour: '#C47A5A',
    desc:   'Premium exterior performance. Combines the UV stability of polyester with enhanced flexibility and scratch resistance.',
    apps:   ['Premium facades', 'High-traffic surfaces', 'Handrails', 'Transport']
  },
];
