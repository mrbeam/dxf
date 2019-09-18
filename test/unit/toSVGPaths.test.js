import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

// import { parseString } from '../../src'
import { Helper, config } from '../../src'
config.verbose = false

const names = [
  'lines',
  'lwpolylines',
  'polylines',
  'squareandcircle',
  'circlesellipsesarcs',
  'ellipticalarcs',
  'ellipticalarcs2',
  'splines',
  'blocks1',
  'blocks2',
  'layers',
  'supported_entities',
  'empty',
  'floorplan',
  'Ceco.NET-Architecture-Tm-53',
  'openscad_export',
  'issue21',
  'issue27a',
  'issue27b',
  'issue27c',
  'issue28',
  'issue29',
  'issue39',
  'issue42',
  'splineA'
]

const expectations = {
  lines: { pathCount: 1, svg: '', viewbox: "viewBox='0 -100 100 100'", colors: 1 },
  lwpolylines: { pathCount: 1, svg: '', viewbox: "viewBox='0 -80 80 80'", colors: 1 },
  polylines: { pathCount: 1, svg: '', viewbox: "viewBox='0 -300 300 300'", colors: 1 },
  squareandcircle: { pathCount: 2, svg: '', viewbox: "viewBox='0 -10 10 10'", colors: 2 },
  circlesellipsesarcs: { pathCount: 1, svg: '', viewbox: "viewBox='-20 -192.71849814799046 212.71849814799046 212.71849814799046'", colors: 1 },
  ellipticalarcs: { pathCount: 1, svg: '', viewbox: "viewBox='-100 -520 620 620'", colors: 1 },
  ellipticalarcs2: { pathCount: 1, svg: '', viewbox: "viewBox='-204.75990483223006 -528.027453086821 732.787357919051 732.787357919051'", colors: 1 },
  splines: { pathCount: 1, svg: '', viewbox: "viewBox='10 -90 80 80'", colors: 1 },
  blocks1: { pathCount: 1, svg: '', viewbox: "viewBox='-11.213203435596423 -132.64142522944434 143.85462866504076 143.85462866504076'", colors: 1 },
  blocks2: { pathCount: 1, svg: '', viewbox: "viewBox='165 -285 120 120'", colors: 1 },
  layers: { pathCount: 1, svg: '', viewbox: "viewBox='0 -100 100 100'", colors: 1 },
  supported_entities: { pathCount: 1, svg: '', viewbox: "viewBox='15 -735 720 720'", colors: 1 },
  empty: { pathCount: 0, svg: '', viewbox: "viewBox='0 0 0 0'", colors: 0 },
  floorplan: { pathCount: 189, svg: '', viewbox: "viewBox='-684.0621483962348 -182.0902808298651 866.1524292260999 866.1524292260999'", colors: 10 },
  'Ceco.NET-Architecture-Tm-53': { pathCount: 127, svg: '', viewbox: "viewBox='0 -43.10000000000002 43.10000000000002 43.10000000000002'", colors: 10 },
  openscad_export: { pathCount: 1, svg: '', viewbox: "viewBox='-13 -27 40 40'", colors: 1 },
  issue21: { pathCount: 1, svg: '', viewbox: "viewBox='463.4857177734375 -803.9474487304688 340.46173095703125 340.46173095703125'", colors: 1 },
  issue27a: { pathCount: 1, svg: '', viewbox: "viewBox='77.80634736 -411.948956433 334.14260907299996 334.14260907299996'", colors: 1 },
  issue27b: { pathCount: 1, svg: '', viewbox: "viewBox='137.227065473 -272.353316392 135.126250919 135.126250919'", colors: 1 },
  issue27c: { pathCount: 1, svg: '', viewbox: "viewBox='2 -12 10 10'", colors: 1 },
  issue28: { pathCount: 1, svg: '', viewbox: "viewBox='-1474.835381364 1179.221072186 295.6143091780002 295.6143091780002'", colors: 1 },
  issue29: { pathCount: 1, svg: '', viewbox: "viewBox='0 -571.5 571.5 571.5'", colors: 1 },
  issue39: { pathCount: 1, svg: '', viewbox: "viewBox='2911.513068867986 -2930.533265618455 19.02019675046904 19.02019675046904'", colors: 1 },
  issue42: { pathCount: 1, svg: '', viewbox: "viewBox='-178.8542017396276 -105.1457982603728 284.0000000000004 284.0000000000004'", colors: 1 },
  splineA: { pathCount: 1, svg: '', viewbox: "viewBox='0 -200 200 200'", colors: 1 }
}

for (var i = 0; i < names.length; i++) {
  const name = names[i]
  describe(`TO_SVG_PATHS: ${name}`, () => {
    const dxfString = fs.readFileSync(join(__dirname, `../resources/${name}.dxf`), 'utf-8')
    const dxf = new Helper(dxfString)
    const svg = dxf.toSVGPaths()
    //    console.log(svg)

    it('can be converted to svgPaths', () => {
      let matches = svg.match(/<path d.+?\/>/g) || []
      expect(matches.length).toEqual(expectations[name].pathCount)
    })
    it('can be converted without undefined values', () => {
      expect(svg.indexOf('undefined')).toEqual(-1)
    })

    it('has correct viewBox', () => {
      let viewbox = svg.match(/viewBox='.+?'/g)
      expect(viewbox.length).toEqual(1)
      expect(viewbox[0]).toEqual(expectations[name].viewbox)
    })

    it('has correct colors', () => {
      let matches = svg.match(/stroke=".+?"/g) || []
      let colors = []
      colors = matches.filter(function (value, index, self) {
        return self.indexOf(value) === index
      })
      expect(colors.length).toEqual(expectations[name].colors)
    })
  })
}
