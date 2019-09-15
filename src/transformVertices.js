import { Box2 } from 'vecks'

/**
 * Transform an array of vertices by the given
 * transforms. 
 */
export default (vertices, transforms) => {
  const matrices = transforms.map(transform => {
    // Create the transformation matrix
    const tx = transform.x || 0
    const ty = transform.y || 0
    const sx = transform.scaleX || 1
    const sy = transform.scaleY || 1
    const angle = (transform.rotation || 0) / 180 * Math.PI
    const { cos, sin } = Math
    let a, b, c, d, e, f
    // In DXF an extrusionZ value of -1 denote a tranform around the Y axis.
    if (transform.extrusionZ === -1) {
      a = -sx * cos(angle)
      b = sx * sin(angle)
      c = sy * sin(angle)
      d = sy * cos(angle)
      e = -tx
      f = ty
    } else {
      a = sx * cos(angle)
      b = sx * sin(angle)
      c = -sy * sin(angle)
      d = sy * cos(angle)
      e = tx
      f = ty
    }
    return [a, b, c, d, e, f]
  })

  matrices.forEach(([a, b, c, d, e, f]) => {
    vertices = vertices.map(point => ({
      x: point.x * a + point.y * c + e,
      y: point.x * b + point.y * d + f
    }))
  })

  return vertices 
}
