import Taro from '@tarojs/taro';
import { useState } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import { Button, Radio } from "@taroify/core"
import "@taroify/core/radio/style"
import "@taroify/core/cell/style"
import { submitFeedback } from '../../api/feedback';
import './index.scss';

const FeedbackForm = () => {
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');

  const handleSubmit = async () => {
    try {
      await submitFeedback({
        feedbackType,
        content,
        contact,
      });
      Taro.showToast({
        title: '提交成功',
        icon: 'success',
      });
    } catch (error) {
      Taro.showToast({
        title: '提交失败',
        icon: 'none',
      });
    }
  };

  return (
    <View className='feedback-form'>
      <View className='form-item'>
        <Text className='label'>反馈类型</Text>
        <Radio.Group value={feedbackType} onChange={setFeedbackType}>
          <Radio name='suggestion'>建议</Radio>
          <Radio name='problem'>问题</Radio>
          <Radio name='other'>其他</Radio>
        </Radio.Group>
      </View>
      <View className='form-item'>
        <Text className='label'>反馈内容</Text>
        <Textarea
          className='input-area'
          placeholder='请输入反馈内容'
          value={content}
          onInput={(e) => setContent(e.detail.value)}
        />
      </View>
      <View className='form-item'>
        <Text className='label'>联系方式</Text>
        <Input
          className='input-contact'
          type='text'
          placeholder='请输入您的联系方式'
          value={contact}
          onInput={(e) => setContact(e.detail.value)}
        />
      </View>
      <Button color='primary' onClick={handleSubmit}>
        提交
      </Button>
    </View>
  );
};

export default FeedbackForm;
