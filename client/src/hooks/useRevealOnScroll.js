import { useEffect } from 'react'

export function useRevealOnScroll(reloadKey) {
  useEffect(() => {
    const revealSelector = '[data-reveal]:not(.reveal-in)'
    const revealNodes = document.querySelectorAll(revealSelector)

    if (!revealNodes.length) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-in')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -8% 0px',
      },
    )

    const observePendingNodes = () => {
      document.querySelectorAll(revealSelector).forEach((node) => observer.observe(node))
    }

    observePendingNodes()

    // Observe async-rendered nodes (for example fetched alumni cards) so they do not remain hidden.
    const mutationObserver = new MutationObserver(() => {
      observePendingNodes()
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      mutationObserver.disconnect()
      observer.disconnect()
    }
  }, [reloadKey])
}