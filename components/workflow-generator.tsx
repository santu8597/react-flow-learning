"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Loader2, Copy, Download } from "lucide-react"

interface WorkflowGeneratorProps {
  onWorkflowGenerated: (workflow: any) => void
  onClose: () => void
}

const EXAMPLE_PROMPTS = [
  "Calculate the area of a rectangle using length and width inputs",
  "Convert temperature from Celsius to Fahrenheit",
  "Check if a number is greater than 100 and display the result",
  "Take two names, combine them, and convert to uppercase",
  "Calculate compound interest with principal, rate, and time",
  "Compare two test scores and show which is higher",
  "Process a sentence: count words, reverse it, and show both results",
  "Calculate BMI from height and weight inputs",
]

export function WorkflowGenerator({ onWorkflowGenerated, onClose }: WorkflowGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const generateWorkflow = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate workflow")
      }

      const data = await response.json()
      setGeneratedWorkflow(data.workflow)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsGenerating(false)
    }
  }

  const useWorkflow = () => {
    if (generatedWorkflow) {
      onWorkflowGenerated(generatedWorkflow)
      onClose()
    }
  }

  const copyWorkflowJson = () => {
    if (generatedWorkflow) {
      navigator.clipboard.writeText(JSON.stringify(generatedWorkflow, null, 2))
    }
  }

  const downloadWorkflowJson = () => {
    if (generatedWorkflow) {
      const blob = new Blob([JSON.stringify(generatedWorkflow, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "workflow.json"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold">AI Workflow Generator</h2>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Describe what you want to build and AI will generate a complete workflow for you.
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt">Describe your workflow</Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., Calculate the total cost including tax from price and tax rate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Button onClick={generateWorkflow} disabled={!prompt.trim() || isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Workflow
                  </>
                )}
              </Button>

              {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

              {/* Example Prompts */}
              <div>
                <Label className="text-sm font-medium">Example prompts:</Label>
                <div className="mt-2 space-y-2">
                  {EXAMPLE_PROMPTS.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="text-left text-sm text-blue-600 hover:text-blue-800 hover:underline block"
                    >
                      • {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              {generatedWorkflow && (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Generated Workflow</Label>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={copyWorkflowJson}>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadWorkflowJson}>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <Card className="p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Description:</div>
                        <div className="text-sm">{generatedWorkflow.metadata?.description}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Nodes:</span> {generatedWorkflow.nodes?.length || 0}
                        </div>
                        <div>
                          <span className="font-medium">Connections:</span> {generatedWorkflow.edges?.length || 0}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="max-h-64 overflow-y-auto">
                    <pre className="text-xs bg-gray-100 p-3 rounded border">
                      {JSON.stringify(generatedWorkflow, null, 2)}
                    </pre>
                  </div>

                  <Button onClick={useWorkflow} className="w-full" size="lg">
                    Use This Workflow
                  </Button>
                </>
              )}

              {!generatedWorkflow && !isGenerating && (
                <div className="text-center text-gray-500 py-12">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Generated workflow will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
