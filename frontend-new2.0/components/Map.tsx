// components/Map.tsx
"use client";

import { useEffect, useRef, useState } from 'react';

interface Point {
  lng: number;
  lat: number;
}

interface HeatDataPoint {
  lng: number;
  lat: number;
  count: number;
}

interface MapProps {
  points: Point[];
  center?: [number, number]; 
  predictedMode?: string | null;  
}

export default function Map({ points, center, predictedMode }: MapProps) {
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);
  const movingMarkerRef = useRef<any>(null); 
  const heatmapRef = useRef<any>(null);      
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. 地图初始化 (只执行一次)
  useEffect(() => {
    const loadAMap = () => {
      (window as any)._AMapSecurityConfig = {
        securityJsCode: '0fb0f8fa5a04a38e318d1ad5c87e3b97', 
      };

      if ((window as any).AMap && (window as any).AMap.Map) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      const cacheBuster = new Date().getTime();
      script.src = `https://webapi.amap.com/maps?v=2.0&key=f767f1bd274ac75111bbffd9b7995a48&plugin=AMap.Geocoder,AMap.HeatMap,AMap.MoveAnimation&t=${cacheBuster}`;
      script.async = true;
      script.onload = () => {
        (window as any).AMap.plugin(['AMap.Geocoder', 'AMap.MoveAnimation', 'AMap.HeatMap'], () => {
          initMap();
        });
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapContainerRef.current) return;
      mapInstanceRef.current = new (window as any).AMap.Map(mapContainerRef.current, {
        zoom: 15, // 稍微放大一点，让平滑轨迹看得更清晰
        center: center || [116.397428, 39.90923],
        mapStyle: 'amap://styles/darkblue', 
      });
      setIsLoaded(true);
    };

    loadAMap();

    return () => {};
  }, []);

  // 2. 数据更新与图层绘制
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;
    const AMap = (window as any).AMap;
    const map = mapInstanceRef.current;

    // 平滑移动镜头
    if (center) {
      map.panTo(center);
    }

    // 清理所有历史图层
    if (polylineRef.current) map.remove(polylineRef.current);
    if (startMarkerRef.current) map.remove(startMarkerRef.current);
    if (endMarkerRef.current) map.remove(endMarkerRef.current);
    if (heatmapRef.current) heatmapRef.current.setMap(null);
    if (movingMarkerRef.current) {
        movingMarkerRef.current.stopMove(); 
        map.remove(movingMarkerRef.current);
        movingMarkerRef.current = null;
    }

    if (points.length > 0) {
      const path = points.map(p => new AMap.LngLat(Number(p.lng), Number(p.lat)));

      // 绘制发光主轨迹
      polylineRef.current = new AMap.Polyline({
        path: path,
        strokeColor: '#00f0ff',
        strokeWeight: 7,
        strokeOpacity: 0.9,
        strokeStyle: 'solid',
        lineJoin: 'round',
        lineCap: 'round',
        isOutline: true,
        outlineColor: '#ffffff',
        borderWeight: 2,
        showDir: true 
      });

      startMarkerRef.current = new AMap.CircleMarker({
        center: path[0], radius: 6, fillColor: '#10b981', strokeColor: '#ffffff', strokeWeight: 2, fillOpacity: 1
      });

      endMarkerRef.current = new AMap.CircleMarker({
        center: path[path.length - 1], radius: 6, fillColor: '#ef4444', strokeColor: '#ffffff', strokeWeight: 2, fillOpacity: 1
      });

      map.add([polylineRef.current, startMarkerRef.current, endMarkerRef.current]);
      map.setFitView([polylineRef.current], false, [80, 80, 80, 80]);

      // 宏观伴随热力图
      const heatData: HeatDataPoint[] = [];
      const baseCenter = center || [points[0].lng, points[0].lat];
      for(let i = 0; i < 250; i++) {
        heatData.push({
          lng: baseCenter[0] + (Math.random() - 0.5) * 0.08,
          lat: baseCenter[1] + (Math.random() - 0.5) * 0.08,
          count: Math.random() * 100
        });
      }

      AMap.plugin(["AMap.HeatMap"], function() {
        heatmapRef.current = new AMap.HeatMap(map, {
          radius: 35, opacity: [0, 0.6], 
          gradient: { 0.3: '#00f0ff', 0.5: '#0070f3', 0.8: '#ffaa00', 1.0: '#ff0000' } 
        });
        heatmapRef.current.setDataSet({ data: heatData, max: 100 });
      });

      // 🌟 只有 predictedMode 有值（点击了预测）时，才显示图标并动画
      if (predictedMode) {
        const getIcon = (mode: string) => {
          const m = mode.toUpperCase();
          if (m.includes('WALK')) return '🚶';
          if (m.includes('BIKE')) return '🚲';
          if (m.includes('BUS')) return '🚌';
          if (m.includes('SUBWAY')) return '🚇';
          if (m.includes('TRAIN')) return '🚄';
          if (m.includes('AIRPLANE')) return '✈️';
          return '🚕';
        };

        movingMarkerRef.current = new AMap.Marker({
          map: map,
          position: path[0],
          content: `
            <div style="
              width: 32px; height: 32px; 
              background: rgba(15, 23, 42, 0.9); 
              border: 2px solid #00f0ff; 
              border-radius: 50%; 
              box-shadow: 0 0 15px #00f0ff; 
              display: flex; align-items: center; justify-content: center; 
              font-size: 18px;
              backdrop-filter: blur(4px);
            ">
              ${getIcon(predictedMode)}
            </div>
          `,
          offset: new AMap.Pixel(-16, -16),
          autoRotation: true,
        });

        // 🌟 核心修复：改用 duration 保证平滑
        setTimeout(() => {
          if (movingMarkerRef.current) {
            AMap.plugin('AMap.MoveAnimation', () => {
              movingMarkerRef.current.moveAlong(path, { 
                // 不再用 speed (km/h)，改用 duration (毫秒)
                // 4000 代表不论轨迹长短，图标都会用 4 秒钟的时间平滑匀速地走完全程
                duration: 4000, 
                circlable: false 
              });
            });
          }
        }, 500); // 延迟0.5秒等底层绘制完成再发车，防止跳帧
      }
    }
  }, [points, center, isLoaded, predictedMode]); 

  return (
    <div className="w-full h-full relative min-h-[400px] bg-[#010a18] rounded-lg">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur z-10 text-[#00f0ff]">
          <div className="w-8 h-8 border-4 border-[#00f0ff] border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="font-bold tracking-widest text-sm">高德全息视觉引擎载入中...</span>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full rounded-lg"></div>
    </div>
  );
}