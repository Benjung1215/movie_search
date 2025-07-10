import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import OptimizedImage from '../../main/vue/components/ui/OptimizedImage.vue'

// Mock the useImageLoader composable
vi.mock('../../main/vue/composables/useImageLoader.js', () => ({
  useImageLoader: () => ({
    loading: ref(false),
    error: ref(false),
    loadImage: vi.fn().mockResolvedValue({}),
    isImageCached: vi.fn().mockReturnValue(false)
  })
}))

describe('OptimizedImage', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test image'
  }

  it('should render with default props', () => {
    const wrapper = mount(OptimizedImage, {
      props: defaultProps
    })

    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.find('img').attributes('alt')).toBe('Test image')
  })

  it('should apply custom container and image classes', () => {
    const wrapper = mount(OptimizedImage, {
      props: {
        ...defaultProps,
        containerClass: 'custom-container',
        imageClass: 'custom-image'
      }
    })

    const container = wrapper.find('div')
    const img = wrapper.find('img')

    expect(container.classes()).toContain('custom-container')
    expect(img.classes()).toContain('custom-image')
  })

  it('should set aspect ratio style', () => {
    const wrapper = mount(OptimizedImage, {
      props: {
        ...defaultProps,
        aspectRatio: '16/9'
      }
    })

    const container = wrapper.find('div')
    expect(container.attributes('style')).toContain('aspect-ratio: 16/9')
  })

  it('should show loading state', async () => {
    const wrapper = mount(OptimizedImage, {
      props: defaultProps,
      data() {
        return {
          isLoading: true,
          hasError: false
        }
      }
    })

    expect(wrapper.text()).toContain('loading') // checking for loading icon or text
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('should show error state', async () => {
    const wrapper = mount(OptimizedImage, {
      props: defaultProps,
      data() {
        return {
          isLoading: false,
          hasError: true
        }
      }
    })

    expect(wrapper.text()).toContain('載入失敗')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('should emit load event', async () => {
    const wrapper = mount(OptimizedImage, {
      props: defaultProps
    })

    const img = wrapper.find('img')
    await img.trigger('load')

    expect(wrapper.emitted().load).toBeTruthy()
  })

  it('should emit error event', async () => {
    const wrapper = mount(OptimizedImage, {
      props: defaultProps
    })

    const img = wrapper.find('img')
    await img.trigger('error')

    expect(wrapper.emitted().error).toBeTruthy()
  })

  it('should render overlay slot when overlay is enabled', () => {
    const wrapper = mount(OptimizedImage, {
      props: {
        ...defaultProps,
        overlay: true
      },
      slots: {
        overlay: '<div class="overlay-content">Overlay</div>'
      }
    })

    expect(wrapper.find('.overlay-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('Overlay')
  })

  it('should use fallback src on error', () => {
    const wrapper = mount(OptimizedImage, {
      props: {
        ...defaultProps,
        fallbackSrc: '/fallback.jpg'
      }
    })

    expect(wrapper.vm.currentSrc).toBe('/fallback.jpg')
  })

  it('should add lazy loading attribute', () => {
    const wrapper = mount(OptimizedImage, {
      props: defaultProps
    })

    const img = wrapper.find('img')
    expect(img.attributes('loading')).toBe('lazy')
  })
})