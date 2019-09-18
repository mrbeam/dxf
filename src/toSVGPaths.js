import { pd } from 'pretty-data'
import { Box2 } from 'vecks'

import entityToPolyline from './entityToPolyline'
import denormalise from './denormalise'
import getRGBForEntity from './getRGBForEntity'
import logger from './util/logger'
import rgbToColorAttribute from './util/rgbToColorAttribute'
import transformVertices from './transformVertices'

/**
 * Create the 'd' attribute of a <path /> element. Interpolates curved entities.
 * @entity object, example: { type: 'LINE',
 *       start: { x: 100, y: 10 },
 *       end: { x: 100, y: 20 },
 *       layer: '0',
 *       lineTypeName: 'ByLayer',
 *       colorNumber: 256,
 *       transforms: [] }
 */
const pathdata = (entity) => {
  let vertices = entityToPolyline(entity)
  vertices = transformVertices(vertices, entity.transforms)
  //  const bbox = vertices.reduce((acc, [x, y], i) => acc.expandByPoint({ x, y }), new Box2()) // throws exception on some files???
  let bbox = new Box2()
  vertices.forEach(function (point) {
    bbox.expandByPoint({ x: point[0], y: point[0] })
  })
  const d = vertices.reduce((acc, point, i) => {
    acc += (i === 0) ? 'M' : 'L'
    acc += point[0] + ',' + point[1]
    return acc
  }, '')
  const start = vertices[0]
  const end = vertices[vertices.length - 1]

  return { bbox: bbox, pathdata: d, pathStart: { x: start[0], y: start[1] }, pathEnd: { x: end[0], y: end[1] } }
}

/**
 * Switcth the appropriate function on entity type. All elements will be interpolated polylines.
 */
const entityToBoundsAndPathAttr = (entity) => {
  switch (entity.type) {
    case 'CIRCLE':
    case 'ELLIPSE':
    case 'ARC':
    case 'SPLINE':
    case 'LINE':
    case 'LWPOLYLINE':
    case 'POLYLINE': {
      return pathdata(entity)
    }
    default:
      logger.warn('entity type not supported in SVG rendering:', entity.type)
      return null
  }
}

export default (parsed) => {
  let entities = denormalise(parsed)
  const stripMovetoRegex = /^M[^MmLlHhVvCcSsQqTtAaZz]+/

  let lastColor = [null, null, null]
  let lastEnd = null
  let dAttr = ''
  const { bbox, elements } = entities.reduce((acc, entity, i, origArray) => {
    const rgb = getRGBForEntity(parsed.tables.layers, entity)
    const boundsAndPathAttr = entityToBoundsAndPathAttr(entity)
    // Ignore entities like MTEXT that don't produce SVG elements
    if (boundsAndPathAttr) {
      const { bbox, pathdata, pathStart, pathEnd } = boundsAndPathAttr
      acc.bbox.expandByPoint(bbox.min)
      acc.bbox.expandByPoint(bbox.max)

      // { type: 'LINE',
      //    start: { x: 100, y: 10 },
      //    end: { x: 100, y: 20 },
      //    layer: '0',
      //    lineTypeName: 'ByLayer',
      //    colorNumber: 256,
      //    transforms: [] },

      if (rgb[0] === lastColor[0] && rgb[1] === lastColor[1] && rgb[2] === lastColor[2]) {
        if (pathStart.x === lastEnd.x && pathStart.y === lastEnd.y) {
          const stripped = pathdata.replace(stripMovetoRegex, '')
          dAttr += stripped
        } else {
          dAttr += pathdata
        }
      } else {
        if (dAttr.length > 0) {
          acc.elements.push(`<path d="${dAttr}" stroke="${rgbToColorAttribute(lastColor)}" fill="none" />`)
        }
        dAttr = pathdata
      }

      // remember
      lastColor = rgb
      lastEnd = { x: pathEnd.x, y: pathEnd.y }
    }

    return acc
  }, {// initialization of acc
    bbox: new Box2(),
    elements: []
  })

  if (dAttr.length > 0) {
    elements.push(`<path d="${dAttr}" stroke="${rgbToColorAttribute(lastColor)}" fill="none" />`)
  }

  // Mr Beam Modification: "add created" with comment
  const viewBox = bbox.min.x === Infinity
    ? {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }
    : {
      x: bbox.min.x,
      y: -bbox.max.y,
      width: bbox.max.x - bbox.min.x,
      height: bbox.max.y - bbox.min.y
    }
  return `<?xml version="1.0"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
  preserveAspectRatio="xMinYMin meet"
  viewBox='${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}'
  width="100%" height="100%"
><!-- Created with mrbeam/dxf.js -->
  <g class="dxf-import" transform="matrix(1 0 0 -1 0 ${viewBox.height})">
    ${pd.xml(elements.join('\n'))}
  </g>
</svg>`
}
