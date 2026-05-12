import { View, Text } from "@tarojs/components";
import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import Button from "@taroify/core/button";
import Tag from "@taroify/core/tag";
import ArrowLeft from "@taroify/icons/ArrowLeft";
import Arrow from "@taroify/icons/Arrow";
import LocationOutlined from "@taroify/icons/LocationOutlined";
import { getServiceMapContents, getServiceMapTypes } from "../api/serviceMap";
import { getCommunityServices } from "../api/community_service";
import "./index.scss";

const tryParseJson = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const readFirst = (source, keys) => {
  if (!source || typeof source !== "object") {
    return "";
  }

  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") {
      return String(value);
    }
  }

  return "";
};

const parseTypeName = (typeName) => {
  if (!typeName && typeName !== 0) {
    return null;
  }

  if (typeof typeName === "object") {
    return typeName;
  }

  return tryParseJson(typeName) || String(typeName);
};

const getObjectCategoryName = (item) => {
  return (
    item.type_two ||
    item.typeTwo ||
    item.type_name ||
    item.typeName ||
    item.name ||
    item.title ||
    item.label ||
    ""
  );
};

const normalizeTypeCategories = (parsed) => {
  if (!parsed && parsed !== 0) {
    return [];
  }

  if (typeof parsed === "string" || typeof parsed === "number") {
    return [{ typeTwo: String(parsed), title: String(parsed) }];
  }

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => {
        if (typeof item === "string" || typeof item === "number") {
          return { typeTwo: String(item), title: String(item) };
        }

        if (item && typeof item === "object") {
          const title = getObjectCategoryName(item);
          return title
            ? { typeTwo: String(title), title: String(title) }
            : null;
        }

        return null;
      })
      .filter(Boolean);
  }

  if (typeof parsed === "object") {
    return Object.keys(parsed)
      .map((key) => {
        const value = parsed[key];
        if (value && typeof value === "object" && !Array.isArray(value)) {
          const title = getObjectCategoryName(value);
          if (title) {
            return { typeTwo: String(title), title: String(title) };
          }
        }

        if (typeof value === "string" || typeof value === "number") {
          return { typeTwo: String(value), title: String(value) };
        }

        return { typeTwo: key, title: key };
      })
      .filter((item) => item.typeTwo);
  }

  return [];
};

const normalizeContentList = (res) => {
  const list = Array.isArray(res?.service_map_contents)
    ? res.service_map_contents
    : Array.isArray(res?.serviceMapContents)
      ? res.serviceMapContents
      : Array.isArray(res?.data)
        ? res.data
        : [];

  return list.map((item) => ({
    ...item,
    contentParsed: tryParseJson(item?.content),
  }));
};

const extractDisplaySources = (contentItem) => {
  const parsed = contentItem?.contentParsed;

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (parsed && typeof parsed === "object") {
    const list =
      parsed.shops ||
      parsed.stores ||
      parsed.providers ||
      parsed.items ||
      parsed.list ||
      parsed.data;
    return Array.isArray(list) ? list : [parsed];
  }

  return [];
};

const normalizeDisplayItem = (source) => {
  const shopName = readFirst(source, [
    "shop_name",
    "shopName",
    "store_name",
    "storeName",
    "provider_name",
    "providerName",
    "name",
    "title",
    "店铺名",
    "商家名称",
    "机构名称",
  ]);
  const address = readFirst(source, [
    "address",
    "addr",
    "location",
    "detail_address",
    "detailAddress",
    "地址",
    "详细地址",
  ]);
  const phone = readFirst(source, [
    "phone",
    "telephone",
    "tel",
    "mobile",
    "contact_phone",
    "contactPhone",
    "联系电话",
    "电话",
  ]);
  const owner = readFirst(source, [
    "boss",
    "boss_name",
    "bossName",
    "owner",
    "owner_name",
    "ownerName",
    "manager",
    "contact_person",
    "contactPerson",
    "person_in_charge",
    "personInCharge",
    "老板",
    "负责人",
    "联系人",
  ]);

  return { shopName, address, phone, owner };
};

const buildDisplayItems = (contents) => {
  return contents
    .flatMap((contentItem) => extractDisplaySources(contentItem))
    .map(normalizeDisplayItem)
    .filter(
      (item) => item.shopName || item.address || item.phone || item.owner,
    );
};

const normalizeCommunityKey = (name) => {
  return String(name || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/社区$/u, "");
};

const toFiniteNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
};

const makeCategoryKey = (typeOne, typeTwo) => `${typeOne}::${typeTwo}`;

export default function ServiceMap() {
  const [mapTypes, setMapTypes] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);
  const [expandedCategoryKeys, setExpandedCategoryKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    const fetchServiceMapTypes = async () => {
      setLoading(true);
      setErrorText("");

      try {
        const [res, communityRes] = await Promise.all([
          getServiceMapTypes(),
          getCommunityServices().catch(() => null),
        ]);

        if (res?.code && res.code !== 200) {
          setErrorText(res?.message || "服务地图接口返回异常");
        }

        const communityList = Array.isArray(communityRes?.communityServices)
          ? communityRes.communityServices
          : Array.isArray(communityRes?.data)
            ? communityRes.data
            : [];

        const communityMap = communityList.reduce((acc, item) => {
          const key = normalizeCommunityKey(item?.name);
          if (!key) {
            return acc;
          }
          acc[key] = {
            address: item?.address || "",
            latitude: toFiniteNumber(item?.latitude ?? item?.lat),
            longitude: toFiniteNumber(item?.longitude ?? item?.lng),
          };
          return acc;
        }, {});

        const resolveCommunityFallback = (communityName) => {
          const key = normalizeCommunityKey(communityName);
          if (!key) {
            return null;
          }

          if (communityMap[key]) {
            return communityMap[key];
          }

          const fuzzyKey = Object.keys(communityMap).find(
            (nameKey) => nameKey.includes(key) || key.includes(nameKey),
          );
          return fuzzyKey ? communityMap[fuzzyKey] : null;
        };

        const rawList = Array.isArray(res?.service_map_types)
          ? res.service_map_types
          : Array.isArray(res?.serviceMapTypes)
            ? res.serviceMapTypes
            : Array.isArray(res?.data)
              ? res.data
              : [];

        const list = rawList
          .map((item, index) => ({
            ...item,
            id: item?.id ?? item?.typeOne ?? index,
            community_name:
              item?.community_name || item?.communityName || "未命名社区",
            type_sum: item?.type_sum ?? item?.typeSum ?? 0,
            type_name: item?.type_name ?? item?.typeName ?? "",
            address: item?.address || item?.community_address || "",
            latitude: toFiniteNumber(item?.latitude ?? item?.lat),
            longitude: toFiniteNumber(item?.longitude ?? item?.lng),
          }))
          .map((item) => {
            const fallback = resolveCommunityFallback(item.community_name);
            return {
              ...item,
              address: item.address || fallback?.address || item.community_name,
              latitude: Number.isFinite(item.latitude)
                ? item.latitude
                : fallback?.latitude,
              longitude: Number.isFinite(item.longitude)
                ? item.longitude
                : fallback?.longitude,
              categories: normalizeTypeCategories(
                parseTypeName(item.type_name),
              ),
            };
          })
          .sort((a, b) => (a.id || 0) - (b.id || 0));

        setMapTypes(list);
        setExpandedIds([]);

        if (!list.length && res?.message && (!res?.code || res.code !== 200)) {
          setErrorText(res.message);
        }
      } catch (error) {
        console.error("[ServiceMap] data request failed:", error);
        setMapTypes([]);
        setExpandedIds([]);
        setErrorText("服务地图数据加载失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceMapTypes();
  }, []);

  const goBack = () => {
    Taro.navigateBack();
  };

  const handleLocation = (item) => {
    const latitude = Number(item?.latitude);
    const longitude = Number(item?.longitude);

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      Taro.openLocation({
        name: item.community_name,
        address: item.address || item.community_name,
        latitude,
        longitude,
        scale: 16,
      });
    } else {
      Taro.showToast({
        title: "该社区暂无坐标信息，请联系管理员补充",
        icon: "none",
      });
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id],
    );
  };

  const updateCategory = (typeOne, typeTwo, patch) => {
    setMapTypes((prev) =>
      prev.map((item) => {
        if (item.id !== typeOne) {
          return item;
        }

        return {
          ...item,
          categories: item.categories.map((category) =>
            category.typeTwo === typeTwo ? { ...category, ...patch } : category,
          ),
        };
      }),
    );
  };

  const toggleCategory = async (item, category) => {
    const categoryKey = makeCategoryKey(item.id, category.typeTwo);
    const willExpand = !expandedCategoryKeys.includes(categoryKey);

    setExpandedCategoryKeys((prev) =>
      willExpand
        ? [...prev, categoryKey]
        : prev.filter((key) => key !== categoryKey),
    );

    if (!willExpand || category.loaded || category.loading) {
      return;
    }

    updateCategory(item.id, category.typeTwo, {
      loading: true,
      errorText: "",
    });

    try {
      const contentRes = await getServiceMapContents(item.id, category.typeTwo);
      const contents = normalizeContentList(contentRes);
      updateCategory(item.id, category.typeTwo, {
        loading: false,
        loaded: true,
        contents,
        displayItems: buildDisplayItems(contents),
      });
    } catch (error) {
      console.error("[ServiceMap] content request failed:", {
        type_one: item.id,
        type_two: category.typeTwo,
        error,
      });
      updateCategory(item.id, category.typeTwo, {
        loading: false,
        loaded: true,
        contents: [],
        displayItems: [],
        errorText: "内容加载失败，请稍后重试",
      });
    }
  };

  const renderCategoryContent = (category) => {
    if (category.loading) {
      return <Text className="type-empty-text">正在加载...</Text>;
    }

    if (category.errorText) {
      return <Text className="type-empty-text">{category.errorText}</Text>;
    }

    if (!category.loaded) {
      return <Text className="type-empty-text">点击类目查看内容</Text>;
    }

    if (!category.displayItems?.length) {
      return <Text className="type-empty-text">暂无可展示信息</Text>;
    }

    return category.displayItems.map((content, index) => (
      <View className="content-card" key={`${category.typeTwo}-${index}`}>
        <Text className="shop-name">{content.shopName || "未命名店铺"}</Text>
        {content.address ? (
          <View className="info-row">
            <Text className="info-label">地址</Text>
            <Text className="info-value">{content.address}</Text>
          </View>
        ) : null}
        {content.phone ? (
          <View className="info-row">
            <Text className="info-label">电话</Text>
            <Text className="info-value">{content.phone}</Text>
          </View>
        ) : null}
        {content.owner ? (
          <View className="info-row">
            <Text className="info-label">老板</Text>
            <Text className="info-value">{content.owner}</Text>
          </View>
        ) : null}
      </View>
    ));
  };

  return (
    <View className="service-map-page">
      <View className="custom-header">
        <View className="nav-bar">
          <View className="back-btn" onClick={goBack}>
            <ArrowLeft size={20} />
            <Text>返回</Text>
          </View>
        </View>
        <View className="header-content">
          <Text className="title">养老服务资源地图</Text>
          <Text className="subtitle">为您提供便捷的养老服务机构信息</Text>
        </View>
      </View>

      <View className="community-list">
        {loading ? (
          <Text className="state-text">正在加载服务地图...</Text>
        ) : null}
        {!loading && errorText ? (
          <Text className="state-text">{errorText}</Text>
        ) : null}
        {!loading && !errorText && !mapTypes.length ? (
          <Text className="state-text">暂无服务地图数据</Text>
        ) : null}

        {mapTypes.map((item) => {
          const isExpanded = expandedIds.includes(item.id);
          const categories = item.categories || [];

          return (
            <View className="community-card" key={item.id}>
              <View
                className="community-header"
                onClick={() => toggleExpand(item.id)}
              >
                <View className="community-title-row">
                  <Text className="community-icon">社区</Text>
                  <Text className="community-name">{item.community_name}</Text>
                  <Tag
                    color="warning"
                    variant="outlined"
                    shape="rounded"
                    size="small"
                    className="type-count-tag"
                  >
                    服务类目
                  </Tag>
                </View>
                <View
                  className={`expand-arrow ${isExpanded ? "expanded" : ""}`}
                >
                  <Arrow size={16} />
                </View>
              </View>

              <View className="community-location">
                <Button
                  className="location-btn"
                  color="warning"
                  variant="outlined"
                  shape="round"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLocation(item);
                  }}
                >
                  <LocationOutlined size={16} style={{ marginRight: 4 }} />
                  查看位置
                </Button>
              </View>

              {isExpanded ? (
                <View className="community-body">
                  {categories.length ? (
                    categories.map((category) => {
                      const categoryKey = makeCategoryKey(
                        item.id,
                        category.typeTwo,
                      );
                      const isCategoryExpanded =
                        expandedCategoryKeys.includes(categoryKey);

                      return (
                        <View className="type-section" key={category.typeTwo}>
                          <View
                            className="type-section-header"
                            onClick={() => toggleCategory(item, category)}
                          >
                            <View className="section-indicator" />
                            <Text className="type-section-title">
                              {category.title}
                            </Text>
                            <View
                              className={`category-arrow ${
                                isCategoryExpanded ? "expanded" : ""
                              }`}
                            >
                              <Arrow size={14} />
                            </View>
                          </View>
                          {isCategoryExpanded ? (
                            <View className="type-section-body">
                              {renderCategoryContent(category)}
                            </View>
                          ) : null}
                        </View>
                      );
                    })
                  ) : (
                    <Text className="type-empty-text">暂无服务类目</Text>
                  )}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
