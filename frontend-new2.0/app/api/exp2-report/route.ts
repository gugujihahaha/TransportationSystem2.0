import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// 配置 Python API 地址（开发/生产环境区分）
const PYTHON_MODEL_API = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000/predict'  // 本地开发
  : 'https://visualisable-fidela-nondiaphanous.ngrok-free.dev/predict'; // 公网演示

// 英文标签转中文映射
const LABEL_MAP: Record<string, string> = {
  'Walk': '步行',
  'Bike': '骑行',
  'Bus': '公交',
  'Subway': '地铁',
  'PrivateCar': '私家车',
  'OnlineCar': '网约车'
};

// 定义类型接口（TypeScript 类型约束）
interface TrajectoryPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

interface PythonApiResponse {
  prediction: string;
  confidence: number;
}

interface ErrorResponse {
  detail: string;
}

interface ApiSuccessResponse {
  success: true;
  predictedLabel: string;
  confidence: number;
  inferenceTime: number;
  probability: Record<string, number>;
}

interface ApiErrorResponse {
  success: false;
  error: string;
}

// GET 请求：返回模型评估报告
export async function GET() {
  return NextResponse.json({
    modelName: 'Exp2 双输入 Bi-LSTM 模型',
    accuracy: {
      baseline: 69.6,
      optimized: 79.49,
      improvement: 9.89
    },
    inferenceTime: '20ms/条',
    supportedModes: Object.values(LABEL_MAP),
    features: {
      trajectory: 9,
      kg: 11
    }
  });
}

// POST 请求：调用 Python 模型 API 预测
export async function POST(req: NextRequest) {
  try {
    // 1. 解析前端请求体
    const requestBody = await req.json();
    const { trajectory } = requestBody as { trajectory?: TrajectoryPoint[] };

    // 2. 验证输入参数
    if (!trajectory || !Array.isArray(trajectory) || trajectory.length === 0) {
      const errorRes: ApiErrorResponse = {
        success: false,
        error: '轨迹数据不能为空，需为包含lat/lng/timestamp的数组'
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    // 3. 调用 Python 模型 API
    const startTime = performance.now();
    const axiosResponse = await axios.post<PythonApiResponse>(
      PYTHON_MODEL_API,
      { trajectory },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000 // 5秒超时
      }
    );
    const inferenceTime = Math.round((performance.now() - startTime) * 1000) / 1000; // 保留3位小数

    // 4. 解析并转换响应数据
    const { prediction, confidence } = axiosResponse.data;
    const predictedLabel = LABEL_MAP[prediction] || prediction; // 英文转中文
    const confidencePercent = parseFloat((confidence * 100).toFixed(2)); // 小数转百分比

    // 构造概率分布（适配前端图表）
    const probability: Record<string, number> = {};
    Object.keys(LABEL_MAP).forEach(enLabel => {
      const cnLabel = LABEL_MAP[enLabel];
      probability[cnLabel] = enLabel === prediction 
        ? confidencePercent 
        : parseFloat(((1 - confidence) / 5).toFixed(2));
    });

    // 5. 返回前端所需格式
    const successRes: ApiSuccessResponse = {
      success: true,
      predictedLabel,
      confidence: confidencePercent,
      inferenceTime,
      probability
    };
    return NextResponse.json(successRes);

  } catch (error: any) {
    // 统一错误处理
    let errorMsg = '调用模型失败';
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      // Axios 错误（API 响应错误/无响应）
      if (error.response) {
        // Python API 返回 4xx/5xx 错误
        const errorData = error.response.data as ErrorResponse;
        errorMsg = errorData.detail || `服务器错误：${error.response.status}`;
        statusCode = error.response.status;
      } else if (error.request) {
        // 请求发送但无响应（API 未启动/地址错误）
        errorMsg = '无法连接到模型服务，请检查Python API是否运行';
        statusCode = 503;
      } else {
        // 请求构建错误
        errorMsg = `请求错误：${error.message}`;
        statusCode = 400;
      }
    } else {
      // 其他未知错误
      errorMsg = `系统错误：${error.message || '未知错误'}`;
    }

    const errorRes: ApiErrorResponse = {
      success: false,
      error: errorMsg
    };
    return NextResponse.json(errorRes, { status: statusCode });
  }
}