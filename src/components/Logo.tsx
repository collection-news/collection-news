import * as React from 'react'
import Image, { type ImageProps } from 'next/image'

type Props = Pick<ImageProps, 'src'>

const Logo = ({ src }: Props) => {
  return (
    <Image
      src={src}
      alt="logo"
      height={48}
      width={80}
      style={{
        maxWidth: '100%',
        height: 'auto',
      }}
    />
  )
}

export default Logo
