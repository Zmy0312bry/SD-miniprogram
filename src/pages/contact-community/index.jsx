import { View, Text } from '@tarojs/components'
import { Button, Flex } from '@taroify/core'
import { Phone, Location, ArrowLeft, HomeOutlined } from '@taroify/icons'
import Taro from '@tarojs/taro'
import './index.scss'

export default function ContactCommunity() {

  const communityList = [
    {
      id: 1,
      name: '上地东里第一社区',
      address: '海淀区上地东里四区7号楼102',
      phone: '62986360',
      lat: 40.032123,
      lng: 116.319766
    },
    {
      id: 2,
      name: '上地东里第二社区',
      address: '海淀区上地街道上地东里七区四号楼一层',
      phone: '62982695',
      lat: 40.033100,
      lng: 116.320800
    },
    {
      id: 3,
      name: '上地西里社区',
      address: '上地西里社区颂芳园4号楼611',
      phone: '62963909',
      lat: 40.034500,
      lng: 116.315000
    },
    {
        id: 4,
        name: '东馨园社区',
        address: '海淀上地东馨园社区12号楼底商东馨园居委会',
        phone: '82708058',
        lat: 40.036000,
        lng: 116.325000
      }
  ]

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handleCall = (phoneNumber) => {
    Taro.makePhoneCall({
      phoneNumber: phoneNumber
    })
  }

  const handleNavigate = (item) => {
    Taro.openLocation({
      latitude: item.lat,
      longitude: item.lng,
      name: item.name,
      address: item.address,
      scale: 18
    })
  }

  // 获取状态栏高度，用于适配刘海屏
  const systemInfo = Taro.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 20

  return (
    <View className='contact-community-page'>
      {/* 自定义导航栏背景 */}
      <View className='custom-header'>
        <View className='nav-bar'>
            <View className='back-btn' onClick={handleBack}>
                <ArrowLeft size={20} />
                <Text>返回</Text>
            </View>
        </View>

        <View className='header-content'>
            <View className='title'>联系社区</View>
            <View className='subtitle'>上地街道各社区联系方式</View>
        </View>
      </View>

      {/* 社区列表 */}
      <View className='community-list' style={{ marginTop: '-4vh' }}>
        {communityList.map(item => (
            <View key={item.id} className='community-card'>
                {/* 头部信息 */}
                <Flex align='center' className='card-header'>
                    <View className='icon-wrapper'>
                        <HomeOutlined size={24} color='#fff' />
                    </View>
                    <View className='info-content'>
                        <View className='name'>{item.name}</View>
                        <View className='address'>{item.address}</View>
                    </View>
                </Flex>

                {/* 电话行 */}
                <View className='phone-row'>
                    <Phone className='phone-icon' />
                    <Text className='label'>联系电话：</Text>
                    <Text className='number'>{item.phone}</Text>
                </View>

                {/* 按钮组 */}
                <Flex className='action-row'>
                    <Button
                        className='action-btn call-btn'
                        shape="square"
                        onClick={() => handleCall(item.phone)}
                    >
                        <Phone size={16} style={{ marginRight: 4 }} />
                        立即拨打
                    </Button>
                    <Button
                        className='action-btn nav-btn'
                        shape="square"
                        onClick={() => handleNavigate(item)}
                    >
                        <Location size={16} style={{ marginRight: 4 }} />
                        导航
                    </Button>
                </Flex>
            </View>
        ))}
      </View>
    </View>
  )
}
