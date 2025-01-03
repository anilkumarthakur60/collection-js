import { collect } from '../collect'

describe('dd and dump methods', () => {
  let consoleLogSpy: jest.SpyInstance
  let processExitSpy: jest.SpyInstance

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit() was called.')
    })
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    processExitSpy.mockRestore()
  })

  it('The dump method logs the collection items and returns them', () => {
    const collection = collect(['John Doe', 'Jane Doe'])
    const result = collection.dump()

    expect(consoleLogSpy).toHaveBeenCalledWith(['John Doe', 'Jane Doe'])
    expect(result).toEqual(['John Doe', 'Jane Doe'])
  })

  it('The dd method dumps the collection items and ends execution of the script', () => {
    const collection = collect(['John Doe', 'Jane Doe'])

    try {
      collection.dd()
    } catch (e) {
      const error = e as Error
      expect(error.message).toBe('process.exit() was called.')
    }

    expect(consoleLogSpy).toHaveBeenCalledWith(['John Doe', 'Jane Doe'])
    expect(processExitSpy).toHaveBeenCalledWith(1)
  })
})
