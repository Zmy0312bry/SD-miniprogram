import { View, Text } from "@tarojs/components";
import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { getPolicyType, getPolicyFile } from "../../api";
import "./index.scss";

export default function PolicyList() {
  const [policyTypes, setPolicyTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [policyFiles, setPolicyFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    const fetchPolicyTypes = async () => {
      setLoading(true);
      setErrorText("");
      try {
        const res = await getPolicyType();
        const types = res.policyTypes || res.policy_types || [];
        setPolicyTypes(types);
        if (types.length > 0) {
          setSelectedType(types[0].type);
        }
      } catch (error) {
        console.error("[PolicyRegulation] fetch policy types failed:", error);
        setErrorText("政策类型加载失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyTypes();
  }, []);

  useEffect(() => {
    if (!selectedType) {
      setPolicyFiles([]);
      return;
    }

    const fetchPolicyFiles = async () => {
      setLoading(true);
      setErrorText("");
      try {
        const res = await getPolicyFile(selectedType);
        const files = res.policyFiles || res.policy_files || [];
        setPolicyFiles(files);
      } catch (error) {
        console.error("[PolicyRegulation] fetch policy files failed:", error);
        setPolicyFiles([]);
        setErrorText("政策文件加载失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyFiles();
  }, [selectedType]);

  const openPreview = (file) => {
    if (!file?.index) {
      Taro.showToast({
        title: "当前文件缺少预览标识",
        icon: "none",
      });
      return;
    }

    const previewUrl = `/PolicyPreview/index?uuid=${encodeURIComponent(file.index)}`;
    console.log("[PolicyRegulation] preview navigate url:", previewUrl);
    console.log("[PolicyRegulation] preview file:", file);

    Taro.navigateTo({
      url: previewUrl,
      fail: (err) => {
        console.error("[PolicyRegulation] navigateTo failed:", err);
        Taro.showToast({
          title: "页面跳转失败",
          icon: "none",
        });
      },
    });
  };

  return (
    <View className="policy-list-page">
      <View className="policy-header compact">
        <View className="policy-nav">
          <View className="policy-back" onClick={() => Taro.navigateBack()}>
            <Text>&lt; 返回</Text>
          </View>
        </View>
        <View className="policy-header-content">
          <Text className="policy-kicker">政策法规</Text>
          <Text className="policy-title">政策文件查询</Text>
          <Text className="policy-subtitle">按政策类型查看各类文件条目</Text>
        </View>
      </View>

      <View className="policy-content-panel">
        <View className="policy-type-card">
          <Text className="section-title">政策类型</Text>
          <View className="type-group">
            {policyTypes.map((policyType) => (
              <View
                key={policyType.id}
                className={`type-button ${
                  selectedType === policyType.type ? "active" : ""
                }`}
                onClick={() => setSelectedType(policyType.type)}
              >
                <Text>{policyType.type}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="policy-files-card">
          <Text className="section-title">{selectedType || "政策文件"}</Text>

          {loading ? <Text className="state-text">正在加载内容...</Text> : null}
          {!loading && errorText ? (
            <Text className="state-text error">{errorText}</Text>
          ) : null}
          {!loading && !errorText && !policyFiles.length ? (
            <Text className="state-text">暂无政策文件</Text>
          ) : null}

          {policyFiles.map((file) => (
            <View
              key={file.id}
              className="policy-file-item"
              onClick={() => openPreview(file)}
            >
              <View className="file-title-wrap">
                <Text className="file-title-icon">文件</Text>
                <Text className="file-title">{file.title}</Text>
              </View>
              <View className="preview-btn">
                <Text>查看文件</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
