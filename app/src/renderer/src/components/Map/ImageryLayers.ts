import {
  buildModuleUrl,
  Credit,
  ImageryLayer,
  OpenStreetMapImageryProvider,
  TileMapServiceImageryProvider
} from 'cesium'

// デフォルトの画像としてフリーのものを使用する。
// →のリンクのsandcastle参照: https://community.cesium.com/t/cesium-ion-logo-removal/8979/10
// 何も指定しないと Secium ion のものを使ってしまう。
export const baseLayer = ImageryLayer.fromProviderAsync(
  TileMapServiceImageryProvider.fromUrl(buildModuleUrl('Assets/Textures/NaturalEarthII')),
  {}
)

export const imageryProviders = {
  地理院地図: new OpenStreetMapImageryProvider({
    url: 'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/',
    fileExtension: 'jpg',
    credit: new Credit(
      '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院地図</a>',
      true
    ),
    maximumLevel: 18
  }),
  OpenStreetMap: new OpenStreetMapImageryProvider({
    url: 'https://tile.openstreetmap.org/',
    credit: new Credit(
      '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      true
    ),
    maximumLevel: 19
  })
}
