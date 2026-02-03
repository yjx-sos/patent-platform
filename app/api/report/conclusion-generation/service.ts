import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";

// 报告结论生成模板字符串
const CONCLUSION_GENERATION_TEMPLATE_STRING = `你是一位专业的专利分析师，请根据以下信息为专利检索报告生成"结论与建议"部分。

输入信息：
1. 检索主题: {searchTopic}
2. 检索结果概述: {searchResults}
3. 关键专利分析: {keyPatentAnalysis}
4. 专利地图/技术分布: {patentMap}
5. 创新点评估: {innovationAssessment}

撰写要求：
1. **技术现状总结**: 概括当前技术领域的专利布局现状
2. **创新性评估**: 分析目标技术的创新程度和专利壁垒
3. **风险分析**: 识别潜在的侵权风险和技术规避空间
4. **建议与策略**: 给出专利申请、布局或规避的具体建议
5. **后续行动**: 提出进一步的检索或分析建议
6. **语言风格**: 使用专业、客观的专利分析术语，数据驱动
7. **格式**: 分段撰写，每部分有明确的小标题。800字以内。

请直接输出报告结论的内容，不要包含Markdown标题；`;

// 创建prompt模板
const conclusionPromptTemplate = ChatPromptTemplate.fromTemplate(
  CONCLUSION_GENERATION_TEMPLATE_STRING
);

// 创建OpenAI模型实例
const model = new ChatOpenAI({
  modelName: process.env.OPENAI_CHAT_MODEL || "gpt-4",
  temperature: 0.3, // 较低的temperature确保结果更稳定
  openAIApiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  }
});

// 构建生成链
const conclusionGenerationChain = RunnableSequence.from([
  conclusionPromptTemplate,
  model,
  new StringOutputParser()
]);

// 导出生成函数
export async function generateConclusion(params: {
  searchTopic: string;
  searchResults: string;
  keyPatentAnalysis: string;
  patentMap?: string;
  innovationAssessment?: string;
}) {
  const { searchTopic, searchResults, keyPatentAnalysis, patentMap, innovationAssessment } = params;
  
  try {
    const conclusion = await conclusionGenerationChain.invoke({
      searchTopic,
      searchResults,
      keyPatentAnalysis,
      patentMap: patentMap || "暂无专利地图数据",
      innovationAssessment: innovationAssessment || "暂无创新性评估数据"
    });
    
    return conclusion;
  } catch (error) {
    console.error("生成报告结论时出错:", error);
    throw new Error("生成报告结论失败");
  }
}