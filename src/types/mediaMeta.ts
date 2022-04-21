import { media } from '../constants/media'
import React from 'react'

export type CategoryItem = {
  engName: string
  chiName: string
  range: [startDay: string, endDay: string]
  count: number
}

export type MediaDescription = {
  key: media
  description: React.ReactElement
  collectionNewsDescription: React.ReactElement
  brandName: string
  logoFullWhite: any
}

export type MediaMeta = {
  key: media
  brandName: string
  brandNameShorthand: string
  range: [startDay: string, endDay: string]
  count: number
  categoryList: CategoryItem[] // order matters here
}

export type MediaMetaForProps = Pick<MediaMeta, 'brandNameShorthand' | 'brandName' | 'range' | 'categoryList' | 'count'>
