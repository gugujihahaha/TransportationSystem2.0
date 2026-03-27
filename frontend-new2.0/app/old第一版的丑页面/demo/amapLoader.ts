'use client';

// 声明高德地图全局变量（避免TS报错）
declare global {
  interface Window {
    AMap: any;
    _AMapSecurityConfig: {
      securityJsCode: string;
    };
  }
}

/**
 * 加载高德地图JS SDK
 * @param callback 加载完成后的回调函数
 */
export const loadAmapSDK = (callback: () => void) => {
  // 前端专属高德Web端Key和安全密钥（带NEXT_PUBLIC前缀）
  const webJsKey = process.env.NEXT_PUBLIC_AMAP_WEB_JS_KEY;
  const webJsSecret = process.env.NEXT_PUBLIC_AMAP_WEB_JS_SECRET;

  // 校验Key和安全密钥
  if (!webJsKey || !webJsSecret) {
    console.error('高德地图Web端Key或安全密钥未配置');
    alert('地图加载失败：请配置高德地图Web端Key和安全密钥');
    return;
  }

  // 已加载则直接执行回调
  if (window.AMap) {
    callback();
    return;
  }

  // 配置安全密钥（Web端必须）
  window._AMapSecurityConfig = {
    securityJsCode: webJsSecret,
  };

  // 动态创建script标签加载SDK
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `https://webapi.amap.com/maps?v=2.0&key=${webJsKey}`;
  script.async = true;
  script.defer = true;

  // 加载成功回调
  script.onload = () => {
    if (window.AMap) {
      callback();
    } else {
      console.error('高德地图SDK加载失败');
      alert('地图加载失败：SDK初始化异常');
    }
  };

  // 加载失败处理
  script.onerror = () => {
    console.error('高德地图SDK脚本加载失败');
    alert('地图加载失败：网络异常或Key错误');
  };

  // 插入到body中
  document.body.appendChild(script);
};

/**
 * 初始化高德地图实例
 * @param containerId 地图容器ID
 * @param center 地图中心点 [lng, lat]
 * @param zoom 缩放级别（默认14）
 * @returns 地图实例
 */
export const initAmap = (
  containerId: string,
  center: [number, number] = [116.481028, 39.990739],
  zoom: number = 14
) => {
  const container = document.getElementById(containerId);
  if (!container || !window.AMap) return null;

  // 创建地图实例
  const map = new window.AMap.Map(container, {
    center: center,
    zoom: zoom,
    resizeEnable: true, // 窗口大小变化时自动调整
    showLabel: true, // 显示地图标注
    showIndoorMap: false, // 不显示室内地图
  });

  // 添加常用控件
  map.addControl(new window.AMap.Scale()); // 比例尺
  map.addControl(new window.AMap.ToolBar()); // 工具栏（缩放、定位等）
  map.addControl(new window.AMap.MapType({
    defaultType: 0, // 0:普通地图 1:卫星地图
    showTraffic: true // 显示路况图层
  }));

  return map;
};

/**
 * 在地图上添加轨迹点标记
 * @param map 地图实例
 * @param points 轨迹点数组 [[lng, lat, name], ...]
 */
export const addTrajectoryMarkers = (map: any, points: [number, number, string][]) => {
  if (!map || !points.length) return;

  // 批量创建标记
  const markers = points.map(([lng, lat, name]) => {
    return new window.AMap.Marker({
      position: [lng, lat],
      title: name,
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(32, 32),
        image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
        imageSize: new window.AMap.Size(32, 32)
      }),
      anchor: 'bottom-center' // 锚点位置
    });
  });

  // 添加到地图
  map.add(markers);

  // 调整地图视野以包含所有标记
  const lnglats = points.map(([lng, lat]) => [lng, lat]);
  map.setFitView(lnglats, 50); // 50为边距

  return markers;
};