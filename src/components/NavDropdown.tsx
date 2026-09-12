import React, { useState } from 'react'
import { Box, Button, Divider, IconButton, Popover, PopoverContent, PopoverTrigger } from '@chakra-ui/react'
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

  const open = () => setIsOpen(prev => !prev)
  const close = () => setIsOpen(false)

  return (
    <Popover colorScheme="theme" isOpen={isOpen} onClose={close} onOpen={open}>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent borderRadius="sm" w={60} borderWidth={4} borderColor="theme.400" bg="theme.500">
        {showMainPage && (
          <>
            <Link href="/">
              <IconButton
                justifyContent="flex-start"
                aria-label="Home"
                colorScheme="theme"
                icon={<Logo src={collectionNewsLogoWhite} />}
                data-cy="header-home-btn"
                h="full"
                w="full"
                paddingLeft={2}
                onClick={close}
              />
            </Link>
            <Divider borderColor="theme.400" borderWidth={2} />
          </>
        )}
        {mediaDescMap.map(({ key, logoFullWhite }) => (
          <Link key={key} href={`/${key}`}>
            <IconButton
              justifyContent="flex-start"
              aria-label="Media Home"
              colorScheme="theme"
              icon={<Logo src={logoFullWhite} />}
              data-cy={`header-media-${key}-btn`}
              w="full"
              h="full"
              paddingLeft={2}
              onClick={close}
            />
          </Link>
        ))}
        <Divider borderColor="theme.400" />
        <Box role="group" aria-label="姊妹網站" py="1">
          {sisterSites.map(({ key, name, href, icon, size }) => (
            <Button
              as="a"
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name}（在新分頁開啟）`}
              justifyContent="flex-start"
              colorScheme="theme"
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
              onClick={close}
            >
              <Box display="flex" alignItems="center" justifyContent="center" boxSize="9" flexShrink={0}>
                <Image src={icon} alt="" width={size} height={size} unoptimized />
              </Box>
              {name}
            </Button>
          ))}
        </Box>
      </PopoverContent>
    </Popover>
  )
}
