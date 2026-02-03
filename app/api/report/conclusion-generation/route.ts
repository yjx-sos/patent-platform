import { NextRequest, NextResponse } from "next/server";
import { generateConclusion } from "./service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      searchTopic, 
      searchResults, 
      keyPatentAnalysis, 
      patentMap, 
      innovationAssessment 
    } = body;

    // 验证必要参数
    if (!searchTopic || !searchResults || !keyPatentAnalysis) {
      return NextResponse.json(
        { 
          error: "缺少必要参数",
          required: ["searchTopic", "searchResults", "keyPatentAnalysis"]
        },
        { status: 400 }
      );
    }

    // 调用生成函数
    const conclusion = await generateConclusion({
      searchTopic,
      searchResults,
      keyPatentAnalysis,
      patentMap,
      innovationAssessment
    });

    return NextResponse.json({ 
      success: true,
      data: {
        conclusion,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { 
        error: "生成报告结论失败",
        message: error instanceof Error ? error.message : "未知错误"
      },
      { status: 500 }
    );
  }
}

// 可选：添加GET方法用于测试
export async function GET() {
  return NextResponse.json({
    message: "报告结论生成API",
    endpoint: "POST /api/report/conclusion-generation",
    requiredParams: ["searchTopic", "searchResults", "keyPatentAnalysis"],
    optionalParams: ["patentMap", "innovationAssessment"]
  });
}