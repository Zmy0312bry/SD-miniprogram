import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

export default function PolicyRegulation() {
  const openPolicyList = () => {
    Taro.navigateTo({
      url: "/PolicyRegulation/policy/index",
      fail: (err) => {
        console.error("[PolicyRegulation] policy navigate failed:", err);
        Taro.showToast({
          title: "页面跳转失败",
          icon: "none",
        });
      },
    });
  };

  const openElderlyServiceGuide = () => {
    Taro.navigateTo({
      url: "/PolicyRegulation/guide/index",
      fail: (err) => {
        console.error("[PolicyRegulation] guide navigate failed:", err);
        Taro.showToast({
          title: "页面跳转失败",
          icon: "none",
        });
      },
    });
  };

  return (
    <View className="policy-regulation-page">
      <View className="custom-header">
        <View className="nav-bar">
          <View className="back-btn" onClick={() => Taro.navigateBack()}>
            <Text>&lt; 返回</Text>
          </View>
        </View>
        <View className="header-content">
          <Text className="title">政策法规</Text>
          <Text className="subtitle">了解最新的政策法规与办事指南</Text>
        </View>
      </View>

      <View className="entry-panel">
        <Text className="section-title">请选择您想查看的内容</Text>

        <View className="entry-card policy-entry" onClick={openPolicyList}>
          <View className="entry-content">
            <Text className="entry-tag">政策法规</Text>
            <Text className="entry-title">政策文件查询</Text>
            <Text className="entry-desc">
              按政策类型查看各类法规文件和政策条目
            </Text>
          </View>
          <View className="entry-action">
            <Text>进入</Text>
          </View>
        </View>

        <View
          className="entry-card guide-entry"
          onClick={openElderlyServiceGuide}
        >
          <View className="entry-content">
            <Text className="entry-tag">补贴条件指引</Text>
            <Text className="entry-title">养老服务办事指南</Text>
            <Text className="entry-desc">
              按服务类型查看办理条件、补贴标准和流程
            </Text>
          </View>
          <View className="entry-action">
            <Text>进入</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
