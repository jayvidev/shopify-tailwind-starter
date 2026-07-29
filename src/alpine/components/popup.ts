import { getCookie, setCookie } from '@/helpers'
import { defineData } from '@/types/alpine'

type Initial = {
  delay: number
  cookieName: string
  cookieDays: number
}

export default {
  name: 'popup',
  component: defineData(({ delay, cookieName, cookieDays }: Initial) => ({
    visible: false,

    init() {
      if (getCookie(cookieName)) return

      setTimeout(() => {
        this.visible = true
        this.markAsSeen()
      }, delay)
    },

    markAsSeen() {
      setCookie(cookieName, '1', cookieDays)
    },

    close() {
      this.visible = false
      this.markAsSeen()
    },
  })),
}
