import type { Alpine } from 'alpinejs'

import debugStore from '@/alpine/stores/debug'
import uiStore from '@/alpine/stores/ui'
import cartStore from '@/alpine/stores/cart'
import tiersStore from '@/alpine/stores/discount-tiers'

import dropdownComponent from '@/alpine/components/dropdown'
import sliderComponent from '@/alpine/components/slider'
import collectionComponent from '@/alpine/components/collection'
import productInfoComponent from '@/alpine/components/product-info'
import productMediaGalleryComponent from '@/alpine/components/product-media-gallery'
import productComplementaryComponent from '@/alpine/components/product-complementary'
import promoMarqueeComponent from '@/alpine/components/promo-marquee'
import popupComponent from '@/alpine/components/popup'
import stickyAddToCartComponent from '@/alpine/components/sticky-add-to-cart'
import videoPosterComponent from '@/alpine/components/video-poster'

import amountMagic from '@/alpine/magic/amount'
import moneyMagic from '@/alpine/magic/money'

const stores = [debugStore, uiStore, cartStore, tiersStore]

const components = [
  dropdownComponent,
  sliderComponent,
  collectionComponent,
  productInfoComponent,
  productMediaGalleryComponent,
  productComplementaryComponent,
  promoMarqueeComponent,
  popupComponent,
  stickyAddToCartComponent,
  videoPosterComponent,
]

const magics = [amountMagic, moneyMagic]

export default {
  register: (Alpine: Alpine) => {
    stores.forEach((store) => Alpine.store(store.name, store.store()))
    // Alpine's own types don't model data factories that take arguments, though it supports them.
    components.forEach((component) =>
      Alpine.data(component.name, component.component as Parameters<Alpine['data']>[1])
    )
    magics.forEach((magic) => Alpine.magic(magic.name, magic.callback))
  },
}
