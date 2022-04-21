import { media } from '../constants/media'

export type TextBlock = {
  type: 'text'
  content: string
}

export type HeaderBlock = {
  type: 'header'
  level: number
  content: string
}

export type ImageBlock = {
  type: 'image'
  url: string
  subtitle: string | null
  createdDate: Date | null
  caption: string | null
}

export type HTMLBlock = {
  type: 'html' // raw_html
  content: string
}

type ReferenceBlock = {
  type: 'reference'
  referent: {
    id: string
    type: string
  }
}

type oembedPoolBlock = {
  type: 'oembed'
  referent: {
    id: string
    provider: string
  }
  subtype: 'polldaddy'
  raw: {
    _id: string // oembed link
    html: string
    provider_name: string
    provider_url: string
    type: string
    version: string
  }
}

type oembedTwitterBlock = {
  type: 'oembed'
  referent: {
    id: string
    provider: string
  }
  subtype: 'twitter'
  raw: {
    _id: string // oembed link
    url: string
    author_name: string
    author_url: string
    html: string
    width: number
    height: null
    type: string
    provider_name: string
    provider_url: string
    version: string
  }
}

type ListBlock = {
  type: 'list'
  listType: 'ordered' | 'unordered'
  items: ContentElement[]
}

type TableBlock = {
  type: 'table'
  header: TextBlock[]
  rows: TextBlock[][]
}

type VideoBlock = {
  type: 'video'
  title: string | null
  streams: Stream[]
}

export type QuoteBlock = {
  type: 'quote'
  content: string // raw_html
}

export type ContentElement =
  | TextBlock
  | ImageBlock
  | HTMLBlock
  | HeaderBlock
  | ReferenceBlock
  | oembedPoolBlock
  | oembedTwitterBlock
  | ListBlock
  | TableBlock
  | VideoBlock
  | Article
  | QuoteBlock

export type BaseArticle = {
  media: media
  dumpSource: string
  articleId: string
  createdTimestamp: string | null
  publishTimestamp: string | null
  publishDate: string | null // YYYYMMDD
  category: string
  author: string | 'unknown'
  originalUrl: string
  title: string
  description: string
  tags: string[]
  introElements: (VideoBlock | ImageBlock)[]
}

export type Story = {
  type: 'story'
  contentElements: ContentElement[]
  contentElementsGziped?: Uint8Array
  subHeadline: string
} & BaseArticle

export type Stream = {
  height: number
  width: number
  fileSize: number
  streamType: string
  url: string
  bitrate: number
  provider: string
}

export type Video = {
  type: 'video'
  streams: Stream[]
} & BaseArticle

export type Article = Story | Video
