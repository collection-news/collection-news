import type { MDXComponents } from 'mdx/types'

import { markdownComponents } from './components/Markdown'

// This is intentionally not imported by app code. @next/mdx discovers this file
// by convention and calls useMDXComponents while compiling/rendering MDX files.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...markdownComponents,
    ...components,
  }
}
