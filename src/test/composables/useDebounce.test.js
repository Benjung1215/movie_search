import { describe, it, expect, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { useDebounce, useDebouncedFunction } from '../../main/vue/composables/useDebounce.js'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce ref value changes', async () => {
    const source = ref('initial')
    const debouncedValue = useDebounce(source, 500)
    
    expect(debouncedValue.value).toBe('initial')
    
    source.value = 'updated'
    await nextTick()
    expect(debouncedValue.value).toBe('initial') // not updated yet
    
    vi.advanceTimersByTime(300)
    await nextTick()
    expect(debouncedValue.value).toBe('initial') // still not updated
    
    vi.advanceTimersByTime(200)
    await nextTick()
    expect(debouncedValue.value).toBe('updated') // now updated
  })

  it('should reset timer on rapid changes', async () => {
    const source = ref('initial')
    const debouncedValue = useDebounce(source, 500)
    
    source.value = 'first'
    await nextTick()
    vi.advanceTimersByTime(300)
    
    source.value = 'second'
    await nextTick()
    vi.advanceTimersByTime(300)
    
    source.value = 'third'
    await nextTick()
    vi.advanceTimersByTime(300)
    
    expect(debouncedValue.value).toBe('initial') // no change yet
    
    vi.advanceTimersByTime(200)
    await nextTick()
    expect(debouncedValue.value).toBe('third') // final value
  })
})

describe('useDebouncedFunction', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce function calls', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebouncedFunction(mockFn, 500)
    
    debouncedFn('arg1')
    debouncedFn('arg2')
    debouncedFn('arg3')
    
    expect(mockFn).not.toHaveBeenCalled()
    
    vi.advanceTimersByTime(500)
    
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('arg3')
  })

  it('should cancel pending function calls', () => {
    const mockFn = vi.fn()
    const { debouncedFn, cancel } = useDebouncedFunction(mockFn, 500)
    
    debouncedFn('test')
    
    vi.advanceTimersByTime(300)
    cancel()
    vi.advanceTimersByTime(200)
    
    expect(mockFn).not.toHaveBeenCalled()
  })

  it('should handle multiple cancellations safely', () => {
    const mockFn = vi.fn()
    const { debouncedFn, cancel } = useDebouncedFunction(mockFn, 500)
    
    cancel() // cancel when nothing is pending
    debouncedFn('test')
    cancel()
    cancel() // multiple cancels
    
    vi.advanceTimersByTime(500)
    
    expect(mockFn).not.toHaveBeenCalled()
  })

  it('should use default delay when not specified', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebouncedFunction(mockFn) // no delay specified
    
    debouncedFn('test')
    
    vi.advanceTimersByTime(299)
    expect(mockFn).not.toHaveBeenCalled()
    
    vi.advanceTimersByTime(1)
    expect(mockFn).toHaveBeenCalledWith('test')
  })
})