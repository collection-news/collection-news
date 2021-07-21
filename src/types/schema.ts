import { omit } from 'ramda'
import * as yup from 'yup'
import { appleDailyCategory } from '../constants/appleDailyCategory'
import { mediaType } from '../constants/mediaType'

const mediaTypeValues = Object.keys(mediaType).map(key => mediaType[key as keyof typeof mediaType])
const appleDailyCategoryValues = Object.keys(appleDailyCategory).map(
  key => appleDailyCategory[key as keyof typeof appleDailyCategory]
)

export const articleListQueryParamsSchema = yup.object().shape({
  media: yup.string().required().oneOf(mediaTypeValues),
  publishDate: yup.string().matches(/[0-9]{8}/),
  category: yup.string().oneOf(appleDailyCategoryValues),
})

export const historyPagePathParamsSchema = yup.object().shape({
  media: yup.string().required().oneOf(mediaTypeValues),
  year: yup
    .string()
    .required()
    .matches(/20[0-9]{2}/),
  category: yup.string().oneOf(appleDailyCategoryValues),
})
