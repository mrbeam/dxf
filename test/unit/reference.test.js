import fs from 'fs'
import { join } from 'path'

import { parseString, denormalise, toSVG, entityToPolyline } from '../../src'

const readContents = (filename) => {
  return fs.readFileSync(join(__dirname, '/../resources/', filename), 'utf-8')
}

describe('Reference files dont\'t generate errors', function () {
  const createTest = function (filename) {
    return function () {
      this.timeout(5000)
      const parsed = parseString(readContents(filename))
      const entities = denormalise(parsed)
      entities.forEach(e => {
        entityToPolyline(e)
      })
      toSVG(parsed)
    }
  }

  it('entities.dxf', createTest('entities.dxf'))
  it('Ceco.NET-Architecture-Tm-53.dxf', createTest('Ceco.NET-Architecture-Tm-53.dxf'))
})
