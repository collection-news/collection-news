import React from 'react'

type Props = { html: string }

export const HTMLBlock: React.FC<Props> = ({ html }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
