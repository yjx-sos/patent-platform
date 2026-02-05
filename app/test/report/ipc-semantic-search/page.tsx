"use client";  // 注意：这是客户端组件

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";  // 参考交底书模块
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function IPCSemanticSearchPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // 搜索函数
  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("请输入查询内容");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/report/ipc-semantic-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        toast.success(`找到 ${data.results.length} 个相关分类`);
      } else {
        toast.error(data.error || "搜索失败");
      }
    } catch (error) {
      toast.error("网络错误，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  // 复制IPC号
  const handleCopyIPC = (ipc: string) => {
    navigator.clipboard.writeText(ipc);
    toast.success(`已复制: ${ipc}`);
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6" />
            IPC语义搜索
          </CardTitle>
          <CardDescription>
            输入技术描述，系统将推荐最相关的IPC分类号
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 搜索框 */}
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="例如：电动汽车的电池管理系统"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  搜索中...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  搜索
                </>
              )}
            </Button>
          </div>
          
          {/* 搜索结果 */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">搜索结果</h3>
              <div className="grid gap-3">
                {results.map((item, index) => (
                  <Card key={index} className="hover:bg-gray-50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              {item.ipc}
                            </span>
                            <span className="text-sm text-green-600">
                              相似度: {item.confidence}
                            </span>
                          </div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.full_name}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyIPC(item.ipc)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 使用示例 */}
      <Card>
        <CardHeader>
          <CardTitle>使用示例</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>📝 <strong>输入:</strong> "汽车自动驾驶系统"</p>
            <p>🎯 <strong>可能返回:</strong> B60W (车辆控制系统), G05D (系统控制), G06N (基于AI的计算机系统)</p>
            <p className="mt-4">📝 <strong>输入:</strong> "锂电池充电保护电路"</p>
            <p>🎯 <strong>可能返回:</strong> H01M (电池), H02J (供电或配电), H02H (紧急保护电路)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}