import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import FeedbackForm from '../../components/FeedbackForm';
import './index.scss';

const FeedbackPage = () => {
  return (
    <View className='feedback-page'>
      <FeedbackForm />
    </View>
  );
};

export default FeedbackPage;
