/**
 * @jest-environment node
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { loadCSV } from '@/lib/fetchSheets'

const DEFAULT_URL = 'https://example.com/default.csv'
const ENV_URL = 'https://example.com/from-env.csv'

describe('loadCSV', () => {
  let dir: string
  let cwdSpy: jest.SpyInstance
  const fetchMock = jest.fn()

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'bhajans-'))
    mkdirSync(path.join(dir, 'data'))
    cwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(dir)
    fetchMock.mockReset()
    fetchMock.mockResolvedValue({ ok: true, text: async () => 'from-network' })
    global.fetch = fetchMock as unknown as typeof fetch
  })

  afterEach(() => {
    cwdSpy.mockRestore()
    rmSync(dir, { recursive: true, force: true })
  })

  it('uses the env URL when it is set, even if a local file exists', async () => {
    writeFileSync(path.join(dir, 'data', 'bhajans.csv'), 'from-file')
    expect(await loadCSV(ENV_URL, 'bhajans.csv', DEFAULT_URL)).toBe('from-network')
    expect(fetchMock).toHaveBeenCalledWith(ENV_URL, expect.anything())
  })

  it('reads the local file when the env URL is empty', async () => {
    writeFileSync(path.join(dir, 'data', 'bhajans.csv'), 'id,title\n1,राम नाम')
    expect(await loadCSV('', 'bhajans.csv', DEFAULT_URL)).toBe('id,title\n1,राम नाम')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('strips a byte-order mark from the local file', async () => {
    writeFileSync(path.join(dir, 'data', 'bhajans.csv'), '﻿id,title')
    expect(await loadCSV('', 'bhajans.csv', DEFAULT_URL)).toBe('id,title')
  })

  it('falls back to the default sheet when there is no local file', async () => {
    expect(await loadCSV('', 'missing.csv', DEFAULT_URL)).toBe('from-network')
    expect(fetchMock).toHaveBeenCalledWith(DEFAULT_URL, expect.anything())
  })

  it('throws when the network request fails', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 })
    await expect(loadCSV(ENV_URL, 'bhajans.csv', DEFAULT_URL)).rejects.toThrow('HTTP 404')
  })
})
