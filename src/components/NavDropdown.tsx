import React, { useState } from 'react'
import { Box, Button, IconButton, Popover, Separator } from '@chakra-ui/react'
import Link from 'next/link'
import collectionNewsLogoWhite from '../assets/collectionNewsLogoWhite.svg'
import { mediaDescMap } from '../constants/mediaMeta/desc'
import Logo from './Logo'
import Image from 'next/image'
import { sisterSites } from '../constants/sisterSites'

type Props = {
  showMainPage?: boolean
  children: React.ReactNode
}

export const NavDropdown: React.FC<Props> = ({ children, showMainPage = true }) => {
  const [isOpen, setIsOpen] = useState(false)

  const close = () => setIsOpen(false)

  return (
    <Popover.Root open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content borderRadius="sm" w={60} borderWidth={4} borderColor="theme.400" bg="theme.500">
          {showMainPage && (
            <>
              <IconButton
                justifyContent="flex-start"
                aria-label="Home"
                colorPalette="theme"
                data-cy="header-home-btn"
                h="full"
                w="full"
                paddingLeft={2}
                onClick={close}
                asChild
              >
                <Link href="/">
                  <Logo src={collectionNewsLogoWhite} />
                </Link>
              </IconButton>
              <Separator borderColor="theme.400" borderWidth={2} />
            </>
          )}
          {mediaDescMap.map(({ key, logoFullWhite }) => (
            <IconButton
              justifyContent="flex-start"
              aria-label="Media Home"
              colorPalette="theme"
              data-cy={`header-media-${key}-btn`}
              h="full"
              w="full"
              paddingLeft={2}
              onClick={close}
              asChild
              key={key}
            >
              <Link href={`/${key}`}>
                <Logo src={logoFullWhite} />
              </Link>
            </IconButton>
          ))}
          <Separator borderColor="theme.400" />
          <Box role="group" aria-label="姊妹網站" py="1">
            {sisterSites.map(({ key, name, href, icon, size }) => (
              <Button
                key={key}
                aria-label={`${name}（在新分頁開啟）`}
                justifyContent="flex-start"
                colorPalette="theme"
                color="white"
                fontSize="lg"
                fontWeight="bold"
                gap="1"
                data-cy={`header-media-${key}-btn`}
                w="full"
                h="12"
                paddingLeft={2}
                borderRadius="sm"
                _focusVisible={{ outline: '2px solid', outlineColor: 'brand.500', outlineOffset: '-2px' }}
                asChild
              >
                <a href={href} target="_blank" rel="noopener noreferrer" onClick={close}>
                  <Box display="flex" alignItems="center" justifyContent="center" boxSize="9" flexShrink={0}>
                    <Image src={icon} alt="" width={size} height={size} unoptimized />
                  </Box>
                  {name}
                </a>
              </Button>
            ))}
          </Box>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
}
