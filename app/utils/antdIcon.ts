import AntdIcon from '@ant-design/icons-vue/es/components/AntdIcon'
import AppstoreOutlinedSvg from '@ant-design/icons-svg/es/asn/AppstoreOutlined'
import ArrowRightOutlinedSvg from '@ant-design/icons-svg/es/asn/ArrowRightOutlined'
import CheckOutlinedSvg from '@ant-design/icons-svg/es/asn/CheckOutlined'
import GlobalOutlinedSvg from '@ant-design/icons-svg/es/asn/GlobalOutlined'
import MoonOutlinedSvg from '@ant-design/icons-svg/es/asn/MoonOutlined'
import ReadOutlinedSvg from '@ant-design/icons-svg/es/asn/ReadOutlined'
import RocketOutlinedSvg from '@ant-design/icons-svg/es/asn/RocketOutlined'
import SearchOutlinedSvg from '@ant-design/icons-svg/es/asn/SearchOutlined'
import SunOutlinedSvg from '@ant-design/icons-svg/es/asn/SunOutlined'
import TranslationOutlinedSvg from '@ant-design/icons-svg/es/asn/TranslationOutlined'
import UserOutlinedSvg from '@ant-design/icons-svg/es/asn/UserOutlined'
import type { IconDefinition } from '@ant-design/icons-svg/es/types'
import { defineComponent, h } from 'vue'

export const createAntdIcon = (displayName: string, icon: IconDefinition) =>
  defineComponent({
    name: displayName,
    inheritAttrs: false,
    setup(_props, { attrs }) {
      return () => h(AntdIcon, { ...attrs, icon })
    }
  })

export const AppstoreOutlined = createAntdIcon('AppstoreOutlined', AppstoreOutlinedSvg)
export const ArrowRightOutlined = createAntdIcon('ArrowRightOutlined', ArrowRightOutlinedSvg)
export const CheckOutlined = createAntdIcon('CheckOutlined', CheckOutlinedSvg)
export const GlobalOutlined = createAntdIcon('GlobalOutlined', GlobalOutlinedSvg)
export const MoonOutlined = createAntdIcon('MoonOutlined', MoonOutlinedSvg)
export const ReadOutlined = createAntdIcon('ReadOutlined', ReadOutlinedSvg)
export const RocketOutlined = createAntdIcon('RocketOutlined', RocketOutlinedSvg)
export const SearchOutlined = createAntdIcon('SearchOutlined', SearchOutlinedSvg)
export const SunOutlined = createAntdIcon('SunOutlined', SunOutlinedSvg)
export const TranslationOutlined = createAntdIcon('TranslationOutlined', TranslationOutlinedSvg)
export const UserOutlined = createAntdIcon('UserOutlined', UserOutlinedSvg)
