import * as yup from 'yup'
import { media } from '../constants/media'

const mediaTypeValues = Object.values(media)

export const articleListQueryParamsSchema = yup.object().shape({
  media: yup.string().required().oneOf(mediaTypeValues),
  publishDate: yup.string().matches(/[0-9]{8}/),
  // TODO: fix category type
  category: yup.string(),
})

export const historyPagePathParamsSchema = yup.object().shape({
  media: yup.string().required().oneOf(mediaTypeValues),
  year: yup
    .string()
    .required()
    .matches(/20[0-9]{2}/),
  // TODO: fix category type
  category: yup.string(),
})
