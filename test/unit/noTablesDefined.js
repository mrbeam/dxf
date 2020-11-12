import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(
  __dirname, '/../resources/openscad_export.dxf'), 'utf-8')

describe('No Tables Defined (openscad export)', () => {
  it('can be parsed', () => {
    const result = parseString(dxfContents)
    const expected = {}

    const reduced = {}
    Object.keys(result.tables.layers).forEach(name => {
      const l = result.tables.layers[name]
      reduced[name] = { colorNumber: l.colorNumber }
    })
    expect(reduced).toEqual(expected)
  })
})
