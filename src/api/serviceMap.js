import protobuf from "protobufjs/minimal";
import request, { checkAuth, withQuery } from "./request";

const Reader = protobuf.Reader;

const tryParseJsonString = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const toUint8Array = (data) => {
  if (data instanceof Uint8Array) {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  return null;
};

const decodeServiceMapType = (reader, length) => {
  const end = length === undefined ? reader.len : reader.pos + length;
  const message = {};

  while (reader.pos < end) {
    const tag = reader.uint32();
    switch (tag >>> 3) {
      case 1:
        message.id = reader.int32();
        break;
      case 2:
        message.community_name = reader.string();
        break;
      case 3:
        message.type_sum = reader.int32();
        break;
      case 4:
        message.type_name = reader.string();
        break;
      case 5:
        message.address = reader.string();
        break;
      case 6:
        message.latitude = reader.float();
        break;
      case 7:
        message.longitude = reader.float();
        break;
      default:
        reader.skipType(tag & 7);
        break;
    }
  }

  return message;
};

const decodeServiceMapContent = (reader, length) => {
  const end = length === undefined ? reader.len : reader.pos + length;
  const message = {};

  while (reader.pos < end) {
    const tag = reader.uint32();
    switch (tag >>> 3) {
      case 1:
        message.id = reader.int32();
        break;
      case 2:
        message.type_one = reader.int32();
        break;
      case 3:
        message.type_two = reader.string();
        break;
      case 4:
        message.content = reader.string();
        break;
      default:
        reader.skipType(tag & 7);
        break;
    }
  }

  return message;
};

const decodeListResponse = (bytes, listFieldName, decodeItem, tags) => {
  const { listTag, codeTag, messageTag } = tags;
  const reader = bytes instanceof Reader ? bytes : Reader.create(bytes);
  const end = reader.len;
  const message = { [listFieldName]: [] };

  while (reader.pos < end) {
    const tag = reader.uint32();
    const fieldNo = tag >>> 3;
    switch (fieldNo) {
      case listTag:
        message[listFieldName].push(decodeItem(reader, reader.uint32()));
        break;
      case codeTag:
        message.code = reader.int32();
        break;
      case messageTag:
        message.message = reader.string();
        break;
      default:
        reader.skipType(tag & 7);
        break;
    }
  }

  return message;
};

const decodeTypeResponse = (data) => {
  const payload = toUint8Array(data);
  if (!payload) {
    return normalizeResponse(data);
  }

  const layouts = [
    { listTag: 1, codeTag: 2, messageTag: 3 },
    { listTag: 3, codeTag: 1, messageTag: 2 },
    { listTag: 2, codeTag: 1, messageTag: 3 },
  ];

  try {
    for (const layout of layouts) {
      const decoded = decodeListResponse(
        payload,
        "service_map_types",
        decodeServiceMapType,
        layout,
      );
      if (
        decoded.service_map_types?.length ||
        typeof decoded.code === "number" ||
        decoded.message
      ) {
        return decoded;
      }
    }
  } catch (error) {
    console.error("Proto decode service_map_type failed:", error);
  }

  return normalizeResponse(data);
};

const decodeContentResponse = (data) => {
  const payload = toUint8Array(data);
  if (!payload) {
    return normalizeResponse(data);
  }

  const layouts = [
    { listTag: 1, codeTag: 2, messageTag: 3 },
    { listTag: 3, codeTag: 1, messageTag: 2 },
    { listTag: 2, codeTag: 1, messageTag: 3 },
  ];

  try {
    for (const layout of layouts) {
      const decoded = decodeListResponse(
        payload,
        "service_map_contents",
        decodeServiceMapContent,
        layout,
      );
      if (
        decoded.service_map_contents?.length ||
        typeof decoded.code === "number" ||
        decoded.message
      ) {
        return decoded;
      }
    }
  } catch (error) {
    console.error("Proto decode service_map_content failed:", error);
  }

  return normalizeResponse(data);
};

const normalizeResponse = (res) => {
  if (res instanceof ArrayBuffer) {
    try {
      const text = new TextDecoder("utf-8").decode(new Uint8Array(res));
      return tryParseJsonString(text) || {};
    } catch {
      return {};
    }
  }

  if (typeof res === "string") {
    return tryParseJsonString(res) || {};
  }

  return res || {};
};

/**
 * 获取养老服务资源地图类型列表
 * GET /api/service_map_type
 *
 * @returns {Promise<{
 *   service_map_types: Array<{
 *     id: number,
 *     community_name: string,
 *     type_sum: number,
 *     type_name: string,
 *   }>,
 *   code: number,
 *   message: string,
 * }>}
 */
export const getServiceMapTypes = () => {
  const requestOptions = {
    url: "/api/service_map_type",
    method: "GET",
    responseType: "arraybuffer",
  };
  console.log("[ServiceMap][GET request]", requestOptions);
  return request(requestOptions).then((res) =>
    checkAuth(decodeTypeResponse(res)),
  );
};

/**
 * 新增养老服务资源地图类型
 * POST /api/service_map_type
 *
 * @param {{ community_name: string, type_sum: number, type_name: string }} data
 * @returns {Promise<{ service_map_types: Array, code: number, message: string }>}
 */
export const addServiceMapType = (data) => {
  return request({
    url: "/api/service_map_type",
    method: "POST",
    data,
    responseType: "arraybuffer",
  }).then((res) => checkAuth(decodeTypeResponse(res)));
};

/**
 * 修改养老服务资源地图类型
 * PUT /api/service_map_type?id=x
 *
 * @param {number} id
 * @param {{ community_name?: string, type_sum?: number, type_name?: string }} data
 * @returns {Promise<{ service_map_types: Array, code: number, message: string }>}
 */
export const updateServiceMapType = (id, data) => {
  return request({
    url: withQuery("/api/service_map_type", { id }),
    method: "PUT",
    data,
    responseType: "arraybuffer",
  }).then((res) => checkAuth(decodeTypeResponse(res)));
};

/**
 * 删除养老服务资源地图类型
 * DELETE /api/service_map_type?id=x
 *
 * @param {number} id
 * @returns {Promise<{ code: number, message: string }>}
 */
export const deleteServiceMapType = (id) => {
  return request({
    url: withQuery("/api/service_map_type", { id }),
    method: "DELETE",
    responseType: "arraybuffer",
  }).then((res) => checkAuth(decodeTypeResponse(res)));
};

// ============ service_map_content 服务地图具体内容 ============

/**
 * 获取服务地图具体内容列表
 * GET /api/service_map_content?type_one=xx&type_two=xx
 *
 * @param {number} typeOne - 对应 service_map_types 的 id（用户点击的一级目录）
 * @param {string} typeTwo - 对应 type_name JSON 中的类型名称（用户点击的二级目录）
 * @returns {Promise<{
 *   service_map_contents: Array<{
 *     id: number,
 *     type_one: number,
 *     type_two: string,
 *     content: string,
 *   }>,
 *   code: number,
 *   message: string,
 * }>}
 */
export const getServiceMapContents = (typeOne, typeTwo) => {
  const requestOptions = {
    url: withQuery("/api/service_map_content", {
      type_one: typeOne,
      type_two: typeTwo,
    }),
    method: "GET",
    responseType: "arraybuffer",
  };
  console.log("[ServiceMap][GET request]", {
    ...requestOptions,
    params: {
      type_one: typeOne,
      type_two: typeTwo,
    },
  });
  return request(requestOptions).then((res) =>
    checkAuth(decodeContentResponse(res)),
  );
};

/**
 * 新增服务地图具体内容
 * POST /api/service_map_content
 *
 * - type_one: 对应 service_map_types 中的 id
 * - type_two: 对应 service_map_types 中 type_name JSON 里某个类型的名字
 * - content:  JSON 转字符串，包含层级结构用于渲染第三级目录
 *
 * @param {{ type_one: number, type_two: string, content: string }} data
 * @returns {Promise<{ service_map_contents: Array, code: number, message: string }>}
 */
export const addServiceMapContent = (data) => {
  return request({
    url: "/api/service_map_content",
    method: "POST",
    data,
    responseType: "arraybuffer",
  }).then((res) => checkAuth(decodeContentResponse(res)));
};

/**
 * 修改服务地图具体内容
 * PUT /api/service_map_content?type_one=xx&type_two=xx
 *
 * @param {number} typeOne - 对应 service_map_types 的 id
 * @param {string} typeTwo - 对应 type_name JSON 中的类型名称
 * @param {{ type_one?: number, type_two?: string, content?: string }} data
 * @returns {Promise<{ service_map_contents: Array, code: number, message: string }>}
 */
export const updateServiceMapContent = (typeOne, typeTwo, data) => {
  return request({
    url: withQuery("/api/service_map_content", {
      type_one: typeOne,
      type_two: typeTwo,
    }),
    method: "PUT",
    data,
    responseType: "arraybuffer",
  }).then((res) => checkAuth(decodeContentResponse(res)));
};

/**
 * 删除服务地图具体内容
 * DELETE /api/service_map_content?type_one=xx&type_two=xx
 *
 * @param {number} typeOne - 对应 service_map_types 的 id
 * @param {string} typeTwo - 对应 type_name JSON 中的类型名称
 * @returns {Promise<{ code: number, message: string }>}
 */
export const deleteServiceMapContent = (typeOne, typeTwo) => {
  return request({
    url: withQuery("/api/service_map_content", {
      type_one: typeOne,
      type_two: typeTwo,
    }),
    method: "DELETE",
    responseType: "arraybuffer",
  }).then((res) => checkAuth(decodeContentResponse(res)));
};
