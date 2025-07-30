import { NodeExecutor } from "./types"
import { InputNodeExecutor } from "./input-node-executor"
import { MathNodeExecutor } from "./math-node-executor"
import { TextNodeExecutor } from "./text-node-executor"
import { ConditionNodeExecutor } from "./condition-node-executor"
import { OutputNodeExecutor } from "./output-node-executor"

export class NodeExecutorRegistry {
  private executors = new Map<string, NodeExecutor>()

  constructor() {
    this.registerDefaultExecutors()
  }

  private registerDefaultExecutors() {
    this.register(new InputNodeExecutor())
    this.register(new MathNodeExecutor())
    this.register(new TextNodeExecutor())
    this.register(new ConditionNodeExecutor())
    this.register(new OutputNodeExecutor())
  }

  register(executor: NodeExecutor): void {
    this.executors.set(executor.type, executor)
  }

  getExecutor(type: string): NodeExecutor | undefined {
    return this.executors.get(type)
  }

  getAvailableTypes(): string[] {
    return Array.from(this.executors.keys())
  }

  unregister(type: string): boolean {
    return this.executors.delete(type)
  }
}

// Default registry instance
export const defaultNodeRegistry = new NodeExecutorRegistry()
