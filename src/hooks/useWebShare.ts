export function useWebShare() {
  const onShare = () => {
    if (navigator.share) {
      let url = document.location.href
      const canonicalElement: HTMLLinkElement | null = document.querySelector('link[rel=canonical]')
      if (canonicalElement !== null) {
        url = canonicalElement.href
      }
      navigator
        .share({
          title: document.querySelector('title')?.textContent || '',
          url: url,
        })
        .then(() => console.log('Successful share'))
        .catch(error => console.log('Error sharing', error))
    }
  }

  const canShare = typeof window !== 'undefined' && !!navigator.share
  return { canShare, onShare }
}
