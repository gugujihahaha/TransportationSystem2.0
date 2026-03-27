import { NextRequest, NextResponse } from 'next/server';

// 定义返回数据类型
interface TrafficResponse {
  status: '畅通' | '缓行' | '拥堵' | '未知';
  speed: number;
  congestion: string;
  roadName: string;
}

// 高德路况状态映射
const STATUS_MAP: Record<string, TrafficResponse['status']> = {
  '1': '畅通',
  '2': '缓行',
  '3': '拥堵',
  '0': '未知'
};

// 默认返回数据
const DEFAULT_TRAFFIC_DATA: TrafficResponse = {
  status: '畅通',
  speed: 30,
  congestion: '10%',
  roadName: '默认路段'
};

// 纽约模拟数据
const NEW_YORK_TRAFFIC_DATA: TrafficResponse = {
  status: '缓行',
  speed: 28.5,
  congestion: '25%',
  roadName: 'Fifth Avenue'
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city') || '';
    const adcode = searchParams.get('adcode') || '';
    const lng = searchParams.get('lng');
    const lat = searchParams.get('lat');
    
    // 后端专属高德Web服务Key
    const amapWebServiceKey = process.env.AMAP_WEB_SERVICE_KEY;

    // 验证高德Key是否配置
    if (!amapWebServiceKey) {
      console.error('高德地图Web服务API Key未配置');
      return NextResponse.json(DEFAULT_TRAFFIC_DATA);
    }

    // 纽约直接返回模拟数据
    if (city.trim() === '纽约') {
      return NextResponse.json(NEW_YORK_TRAFFIC_DATA);
    }

    // 验证经纬度参数
    if (!lng || !lat || isNaN(Number(lng)) || isNaN(Number(lat))) {
      console.warn('经纬度参数不合法:', { lng, lat });
      return NextResponse.json({
        ...DEFAULT_TRAFFIC_DATA,
        roadName: '建国路'
      });
    }

    // 第一步：逆地理编码获取路段名称
    const geoUrl = new URL('https://restapi.amap.com/v3/geocode/regeo');
    geoUrl.searchParams.set('key', amapWebServiceKey);
    geoUrl.searchParams.set('location', `${lng},${lat}`);
    geoUrl.searchParams.set('extensions', 'all'); // 获取更详细的地址信息

    const geoRes = await fetch(geoUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // timeout: 5000 // 设置5秒超时
    });

    if (!geoRes.ok) {
      throw new Error(`逆地理编码请求失败: ${geoRes.status}`);
    }

    const geoData = await geoRes.json();
    const roadName = geoData.regeocode?.addressComponent?.road || '建国路';

    // 验证adcode参数
    const targetAdcode = adcode || geoData.regeocode?.addressComponent?.adcode || '';
    if (!targetAdcode) {
      console.warn('无法获取adcode，使用默认路段数据');
      return NextResponse.json({
        ...DEFAULT_TRAFFIC_DATA,
        roadName
      });
    }

    // 第二步：查询该路段路况
    const trafficUrl = new URL('https://restapi.amap.com/v3/traffic/status/road');
    trafficUrl.searchParams.set('key', amapWebServiceKey);
    trafficUrl.searchParams.set('name', roadName);
    trafficUrl.searchParams.set('adcode', targetAdcode);

    const trafficRes = await fetch(trafficUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // timeout: 5000 // 设置5秒超时
    });

    if (!trafficRes.ok) {
      throw new Error(`路况查询请求失败: ${trafficRes.status}`);
    }

    const trafficData = await trafficRes.json();

    // 整理并返回有效数据
    if (trafficData.status === '1' && trafficData.trafficinfo) {
      const responseData: TrafficResponse = {
        status: STATUS_MAP[trafficData.trafficinfo.status] || '畅通',
        speed: !isNaN(Number(trafficData.trafficinfo.speed)) ? Number(trafficData.trafficinfo.speed) : 30,
        congestion: trafficData.trafficinfo.congestion || '10%',
        roadName
      };
      return NextResponse.json(responseData);
    } else {
      // 无有效路况数据时返回降级数据
      console.warn('未获取到有效路况数据', { trafficData });
      return NextResponse.json({
        ...DEFAULT_TRAFFIC_DATA,
        roadName
      });
    }

  } catch (err) {
    // 捕获所有异常并返回默认数据
    console.error('路况API处理异常:', err);
    return NextResponse.json(DEFAULT_TRAFFIC_DATA);
  }
}