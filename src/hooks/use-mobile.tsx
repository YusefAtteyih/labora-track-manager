
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Function to check if the viewport is mobile sized
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile)
    
    // Check initial size
    checkIsMobile()
    
    // Cleanup event listener
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  return !!isMobile
}
