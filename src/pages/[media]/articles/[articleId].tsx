// Simple article test page
import { GetStaticProps } from 'next'

import { getArticle } from '../../../services/dynamo'
import { Article as ArticleType } from '../../../types/article'
import { Article } from '../../../containers/Article'
import { ContentWrapper } from '../../../components/ContentWrapper'
import { media } from '../../../constants/media'

type Params = {
  media: media
  articleId: string
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
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

type Props = {
  article: ArticleType
}

const ArticlePage = ({ article }: Props) => (
  <ContentWrapper>
    <Article article={article} />
  </ContentWrapper>
)

export default ArticlePage
