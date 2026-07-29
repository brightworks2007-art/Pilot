import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

/**
 * Lets any page set the shared TopBar's title/subtitle without MainLayout
 * needing to know about individual routes.
 *
 * Usage inside a page component:
 *   usePageHeader('Upload', 'Add documents for Pilot to process')
 */
export default function usePageHeader(title, subtitle = '') {
  const { setHeader } = useOutletContext()

  useEffect(() => {
    setHeader({ title, subtitle })
  }, [title, subtitle, setHeader])
}
