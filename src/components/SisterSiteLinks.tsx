import { Box, Flex, Link, Tooltip } from '@chakra-ui/react'
import Image from 'next/image'

import { sisterSites } from '../constants/sisterSites'

export const SisterSiteLinks = () => (
  <Flex as="nav" aria-label="姊妹網站" justify="center" gap="6">
    {sisterSites.map(({ name, href, icon, size }) => (
      <Tooltip key={name} label={`${name}（在新分頁開啟）`} placement="bottom" openDelay={200} hasArrow>
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name}（在新分頁開啟）`}
          display="flex"
          alignItems="center"
          minH="12"
          px="2"
          borderRadius="md"
          color="whiteAlpha.900"
          _hover={{ textDecoration: 'none' }}
          _focusVisible={{ outline: '2px solid', outlineColor: 'brand.500', outlineOffset: '3px' }}
          sx={{
            transition: 'background-color 150ms ease-out, transform 150ms ease-out',
            '@media (hover: hover) and (pointer: fine)': {
              '&:hover': { backgroundColor: 'whiteAlpha.100', transform: 'translateY(-2px)' },
            },
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
              '&:hover': { transform: 'none' },
            },
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" boxSize="9" flexShrink={0}>
            <Image src={icon} alt="" width={size} height={size} unoptimized loading="eager" />
          </Box>
        </Link>
      </Tooltip>
    ))}
  </Flex>
)
