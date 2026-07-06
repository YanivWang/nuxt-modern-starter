import AntdIcon from '@ant-design/icons-vue/es/components/AntdIcon'
import AppstoreOutlinedSvg from '@ant-design/icons-svg/es/asn/AppstoreOutlined'
import ArrowLeftOutlinedSvg from '@ant-design/icons-svg/es/asn/ArrowLeftOutlined'
import ArrowRightOutlinedSvg from '@ant-design/icons-svg/es/asn/ArrowRightOutlined'
import CheckOutlinedSvg from '@ant-design/icons-svg/es/asn/CheckOutlined'
import DeleteOutlinedSvg from '@ant-design/icons-svg/es/asn/DeleteOutlined'
import DownloadOutlinedSvg from '@ant-design/icons-svg/es/asn/DownloadOutlined'
import EllipsisOutlinedSvg from '@ant-design/icons-svg/es/asn/EllipsisOutlined'
import FolderOutlinedSvg from '@ant-design/icons-svg/es/asn/FolderOutlined'
import GlobalOutlinedSvg from '@ant-design/icons-svg/es/asn/GlobalOutlined'
import LayoutOutlinedSvg from '@ant-design/icons-svg/es/asn/LayoutOutlined'
import LogoutOutlinedSvg from '@ant-design/icons-svg/es/asn/LogoutOutlined'
import MoonOutlinedSvg from '@ant-design/icons-svg/es/asn/MoonOutlined'
import PlusOutlinedSvg from '@ant-design/icons-svg/es/asn/PlusOutlined'
import ReadOutlinedSvg from '@ant-design/icons-svg/es/asn/ReadOutlined'
import RightOutlinedSvg from '@ant-design/icons-svg/es/asn/RightOutlined'
import RocketOutlinedSvg from '@ant-design/icons-svg/es/asn/RocketOutlined'
import SearchOutlinedSvg from '@ant-design/icons-svg/es/asn/SearchOutlined'
import ShareAltOutlinedSvg from '@ant-design/icons-svg/es/asn/ShareAltOutlined'
import StarOutlinedSvg from '@ant-design/icons-svg/es/asn/StarOutlined'
import SunOutlinedSvg from '@ant-design/icons-svg/es/asn/SunOutlined'
import TagOutlinedSvg from '@ant-design/icons-svg/es/asn/TagOutlined'
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
export const ArrowLeftOutlined = createAntdIcon('ArrowLeftOutlined', ArrowLeftOutlinedSvg)
export const ArrowRightOutlined = createAntdIcon('ArrowRightOutlined', ArrowRightOutlinedSvg)
export const CheckOutlined = createAntdIcon('CheckOutlined', CheckOutlinedSvg)
export const DeleteOutlined = createAntdIcon('DeleteOutlined', DeleteOutlinedSvg)
export const DownloadOutlined = createAntdIcon('DownloadOutlined', DownloadOutlinedSvg)
export const EllipsisOutlined = createAntdIcon('EllipsisOutlined', EllipsisOutlinedSvg)
export const FolderOutlined = createAntdIcon('FolderOutlined', FolderOutlinedSvg)
export const GlobalOutlined = createAntdIcon('GlobalOutlined', GlobalOutlinedSvg)
export const LayoutOutlined = createAntdIcon('LayoutOutlined', LayoutOutlinedSvg)
export const LogoutOutlined = createAntdIcon('LogoutOutlined', LogoutOutlinedSvg)
export const MoonOutlined = createAntdIcon('MoonOutlined', MoonOutlinedSvg)
export const PlusOutlined = createAntdIcon('PlusOutlined', PlusOutlinedSvg)
export const ReadOutlined = createAntdIcon('ReadOutlined', ReadOutlinedSvg)
export const RightOutlined = createAntdIcon('RightOutlined', RightOutlinedSvg)
export const RocketOutlined = createAntdIcon('RocketOutlined', RocketOutlinedSvg)
export const SearchOutlined = createAntdIcon('SearchOutlined', SearchOutlinedSvg)
export const ShareAltOutlined = createAntdIcon('ShareAltOutlined', ShareAltOutlinedSvg)
export const StarOutlined = createAntdIcon('StarOutlined', StarOutlinedSvg)
export const SunOutlined = createAntdIcon('SunOutlined', SunOutlinedSvg)
export const TagOutlined = createAntdIcon('TagOutlined', TagOutlinedSvg)
export const TranslationOutlined = createAntdIcon('TranslationOutlined', TranslationOutlinedSvg)
export const UserOutlined = createAntdIcon('UserOutlined', UserOutlinedSvg)
