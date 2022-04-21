import React, { useState } from 'react'
import { Divider, IconButton, Popover, PopoverContent, PopoverTrigger } from '@chakra-ui/react'
import Link from 'next/link'
import Image from 'next/image'
import collectionNewsLogoWhite from '../assets/collectionNewsLogoWhite.svg'
import { mediaDescMap } from '../constants/mediaMeta/desc'

export const NavDropdown: React.FC<{ showMainPage?: boolean }> = ({ children, showMainPage = true }) => {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(prev => !prev)
  const close = () => setIsOpen(false)

  return (
    <Popover colorScheme="theme" isOpen={isOpen} onClose={close} onOpen={open}>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent borderRadius="sm" w={60} borderWidth={4} borderColor="theme.400" bg="theme.500">
        {showMainPage && (
          <>
            <Link href="/" passHref>
              <IconButton
                justifyContent="flex-start"
                aria-label="Home"
                colorScheme="theme"
                icon={<Image src={collectionNewsLogoWhite} alt="logo" height="48px" width="80px" />}
                data-cy="header-home-btn"
                h="full"
                paddingLeft={2}
                onClick={close}
              />
            </Link>
            <Divider borderColor="theme.400" borderWidth={2} />
          </>
        )}
        {mediaDescMap.map(({ key, logoFullWhite }) => (
          <Link key={key} href={`/${key}`} passHref>
            <IconButton
              justifyContent="flex-start"
              aria-label="Media Home"
              colorScheme="theme"
              icon={<Image src={logoFullWhite} alt="logo" height="48px" width="80px" />}
              data-cy={`header-media-${key}-btn`}
              h="full"
              paddingLeft={2}
              onClick={close}
            />
          </Link>
        ))}
      </PopoverContent>
    </Popover>
  )
}
