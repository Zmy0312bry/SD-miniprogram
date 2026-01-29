import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.scss';

export default function ServiceGrid() {
  const services = [
    { title: '政策法规', path: '/pages/PolicyRegulation/index' },
    { title: '联系社区', path: '/pages/contact-community/index' },
    { title: '卫生服务', path: '/pages/HealthService/index' },
    { title: '资源清单', path: '/pages/ResourceList/index' },
    { title: '服务地图', path: '/pages/ServiceMap/index' },
    { title: '意见反馈', path: '/pages/Feedback/index' },
    { title: '健康指导', path: '/pages/HealthGuidance/index' },
    { title: '养老用餐', path: '/pages/ElderlyCareMeal/index' },
    { title: '更多服务', path: '/pages/MoreServices/index' },
  ];

  const handleServiceClick = (service) => {
    Taro.navigateTo({ url: service.path });
  };

  return (
    <View className='service-grid-wrapper'>
      <View className='service-grid-container'>
        {services.map((service, index) => (
          <View
            key={index}
            className='service-item'
            onClick={() => handleServiceClick(service)}
          >
            <Text className='service-title'>{service.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
