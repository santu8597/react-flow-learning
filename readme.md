# Workflow Engine - Modular Node Architecture

This document describes the refactored workflow engine that implements a modular, plug-and-play node system.

## Architecture Overview

The workflow engine has been refactored to separate node execution logic from the core workflow execution logic. This makes the system more maintainable, testable, and extensible.

### Key Components

1. **Node Executor Interface** (`NodeExecutor`): Defines how node execution logic should be implemented
2. **Node Executor Registry** (`NodeExecutorRegistry`): Manages and provides access to node executors
3. **Core Workflow Engine**: Handles workflow orchestration and execution flow
4. **Individual Node Executors**: Separate files containing execution logic for each node type

## File Structure

```
lib/
├── workflow-engine.ts          # Core workflow execution logic
├── node-types/
│   ├── index.ts               # Main exports
│   ├── types.ts               # Interfaces and type definitions
│   ├── registry.ts            # Node executor registry
│   ├── input-node-executor.ts # Input node logic
│   ├── math-node-executor.ts  # Math node logic
│   ├── text-node-executor.ts  # Text node logic
│   ├── condition-node-executor.ts # Condition node logic
│   └── output-node-executor.ts # Output node logic
└── examples/
    ├── custom-node-executors.ts # Example custom node implementations
    └── usage-examples.ts        # Usage examples
```

## Creating Custom Node Executors

To create a new node type, implement the `NodeExecutor` interface:

```typescript
import { NodeExecutor, NodeExecutionContext, NodeExecutionResult } from "../node-types"

export class CustomNodeExecutor implements NodeExecutor {
  type = "customNode"  // Unique identifier for this node type

  execute(data: any, context: NodeExecutionContext): NodeExecutionResult {
    const { inputs, log } = context
    
    // Your custom logic here
    const result = processInputs(inputs, data)
    
    log(`Custom node processed: ${result}`)
    
    return {
      output: result
    }
  }
}
```

## Registering Custom Nodes

### Option 1: Create a Custom Registry

```typescript
import { NodeExecutorRegistry } from "./workflow-engine"
import { CustomNodeExecutor } from "./custom-nodes"

const customRegistry = new NodeExecutorRegistry()
customRegistry.register(new CustomNodeExecutor())

// Use with workflow
const result = await runWorkflow(workflow, logger, customRegistry)
```

### Option 2: Extend the Default Registry

```typescript
import { defaultNodeRegistry } from "./workflow-engine"
import { CustomNodeExecutor } from "./custom-nodes"

// Add to default registry
defaultNodeRegistry.register(new CustomNodeExecutor())

// Use normally (no need to pass custom registry)
const result = await runWorkflow(workflow, logger)
```

## Benefits of the New Architecture

### 1. **Separation of Concerns**
- Core workflow logic is separated from node-specific execution logic
- Each node type has its own dedicated file
- Easy to understand and maintain

### 2. **Plug-and-Play Nodes**
- Add new node types without modifying core engine
- Custom nodes can be developed independently
- Easy to enable/disable specific node types

### 3. **Better Testing**
- Each node executor can be unit tested independently
- Mock executors can be used for testing workflows
- Core workflow logic can be tested separately

### 4. **Type Safety**
- Strong TypeScript interfaces ensure consistent implementation
- Clear contracts between workflow engine and node executors

### 5. **Extensibility**
- Multiple registries can be used for different use cases
- Node executors can be swapped at runtime
- Easy to create domain-specific node collections

## API Reference

### `NodeExecutor` Interface

```typescript
interface NodeExecutor {
  type: string
  execute(data: any, context: NodeExecutionContext): Promise<NodeExecutionResult> | NodeExecutionResult
}
```

### `NodeExecutionContext` Interface

```typescript
interface NodeExecutionContext {
  inputs: Record<string, any>  // Input values from connected nodes
  log: (message: string) => void  // Logging function
}
```

### `NodeExecutionResult` Interface

```typescript
interface NodeExecutionResult {
  output: any  // The result to pass to connected nodes
}
```

### `NodeExecutorRegistry` Class

```typescript
class NodeExecutorRegistry {
  register(executor: NodeExecutor): void
  getExecutor(type: string): NodeExecutor | undefined
  getAvailableTypes(): string[]
  unregister(type: string): boolean
}
```

## Migration from Old Architecture

The old monolithic `executeNode` function has been replaced with the modular system. The public API remains the same:

```typescript
// Old usage (still works)
const result = await runWorkflow(workflow, logger)

// New usage with custom registry
const result = await runWorkflow(workflow, logger, customRegistry)
```

## Examples

See the `examples/` directory for:
- Custom node executor implementations
- Usage patterns for different scenarios
- Best practices for node development

This modular architecture makes the workflow engine much more flexible and maintainable while preserving backward compatibility.
