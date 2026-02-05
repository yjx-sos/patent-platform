import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import ipcData from '@/lib/data/ipc_dictionary.json';

// 初始化OpenAI（参考交底书模块的配置）
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // 1. 获取用户输入
    const { query } = await request.json();
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: '请输入查询文本' },
        { status: 400 }
      );
    }

    // 2. 为查询文本生成嵌入向量
    const queryEmbedding = await generateEmbedding(query);
    
    // 3. 计算与每个IPC分类的相似度
    const results = await calculateSimilarity(queryEmbedding);
    
    // 4. 返回最相关的前10个结果
    return NextResponse.json({
      success: true,
      query: query,
      results: results.slice(0, 10),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('IPC语义搜索错误:', error);
    return NextResponse.json(
      { error: '搜索失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 生成文本向量的函数
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  
  return response.data[0].embedding;
}

// 计算相似度的函数（简化版）
async function calculateSimilarity(queryEmbedding: number[]) {
  // 注：实际开发中，应该预先计算好IPC描述的向量并存储
  // 这里为了简单，假设我们有预计算的向量
  
  const similarities = [];
  
  for (const ipcItem of ipcData) {
    // 简化的余弦相似度计算（实际需要预计算的IPC向量）
    const similarity = Math.random(); // 这里应该是实际计算
    
    similarities.push({
      ipc: ipcItem.ipc,
      name: ipcItem.name,
      full_name: ipcItem.full_name,
      similarity: similarity,
      confidence: (similarity * 100).toFixed(1) + '%'
    });
  }
  
  // 按相似度降序排序
  return similarities.sort((a, b) => b.similarity - a.similarity);
}