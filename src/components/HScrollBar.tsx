import React from 'react'
import { Scrollbars } from 'react-custom-scrollbars-2'

const renderScrollThumb = ({ style, ...props }: { style: React.CSSProperties }) => {
  const thumbStyle = {
    backgroundColor: '#6B7672',
    cursor: 'pointer',
    height: '4px',
    bottom: '-4px',
  }
  return <div style={{ ...style, ...thumbStyle }} {...props} />
}

type Props = {
  children: React.ReactNode
}

const HScrollBar: React.FC<Props> = ({ children }) => {
  return (
    <Scrollbars autoHeight universal renderThumbHorizontal={renderScrollThumb}>
      {children}
    </Scrollbars>
  )
}

export default HScrollBar
