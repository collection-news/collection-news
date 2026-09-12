import { media } from '../../src/constants/media'
import type { ImageBlock, Story, Video } from '../../src/types/article'

export const fixtureImage: ImageBlock = {
  type: 'image',
  url: '/test-image.svg',
  caption: 'Archive fixture photograph',
  subtitle: null,
  createdDate: null,
}

export function story(overrides: Partial<Story> = {}): Story {
  return {
    type: 'story',
    media: media.APPLE_DAILY,
    articleId: 'fixture-story',
    title: 'Archive fixture story',
    subHeadline: '',
    description: 'A synthetic archive article for tests.',
    contentElements: [{ type: 'text', content: 'This is the complete fixture article body.' }],
    introElements: [{ ...fixtureImage }],
    publishDate: '20210623',
    publishTimestamp: '2021-06-23T10:30:00Z',
    createdTimestamp: null,
    category: 'local',
    author: 'Fixture author',
    originalUrl: 'https://example.test/article',
    dumpSource: 'test-fixture',
    tags: ['測試', 'archive'],
    ...overrides,
  }
}

export function video(overrides: Partial<Video> = {}): Video {
  const { contentElements: _content, subHeadline: _subHeadline, ...base } = story()
  return { ...base, type: 'video', articleId: 'fixture-video', title: 'Fixture video', streams: [], ...overrides }
}

export const richStory = story({
  articleId: 'rich-story',
  title: 'Archive <em>rich</em> story',
  tags: ['測試', '_internal', '123', ' ', 'archive'],
  contentElements: [
    { type: 'header', level: 2, content: 'Section heading' },
    { type: 'text', content: 'This is the complete fixture article body.' },
    { type: 'html', content: '<strong>Preserved archive markup</strong>' },
    fixtureImage,
    { type: 'quote', content: 'A quoted observation.' },
    { type: 'list', listType: 'ordered', items: [{ type: 'text', content: 'First list entry' }] },
    {
      type: 'table',
      header: [{ type: 'text', content: 'Column heading' }],
      rows: [[{ type: 'text', content: 'Table cell' }]],
    },
    { type: 'video', title: 'Archived video', streams: [] },
    { type: 'reference', referent: { id: 'not-rendered', type: 'reference' } },
  ],
})
