// Simple article test page
import { GetStaticProps } from 'next'

import { getArticle } from '../../../services/dynamo'
import { Article as AppleDailyArticleType } from '../../../types/appleDailyArticle'
import { AppleDailyArticle } from '../../../containers/AppleDailyArticle'
import { mediaType } from '../../../constants/mediaType'
import { ContentWrapper } from '../../../components/ContentWrapper'

type Props = {
  article: AppleDailyArticleType
}

const getArticleRender = (article: AppleDailyArticleType) => {
  switch (article.media) {
    case mediaType.APPLE_DAILY:
      return <AppleDailyArticle article={article} />
    default:
      // TODO: 404 page
      return <div>404</div>
  }
}

const ArticlePage: React.FC<Props> = props => <ContentWrapper>{getArticleRender(props.article)}</ContentWrapper>

export default ArticlePage

type Params = {
  media: string
  articleId: string
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { media, articleId } = params as Params
  const article = await getArticle({ articleId, media })
  if (!article) {
    return {
      notFound: true,
    }
  }
  return {
    props: {
      article,
    },
    revalidate: false, // In seconds
  }
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// the path has not been generated.
export async function getStaticPaths() {
  // We'll pre-render nothing at build time.
  // { fallback: blocking } will server-render pages
  // on-demand if the path doesn't exist.
  return { paths: [], fallback: 'blocking' }
}
