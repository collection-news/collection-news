import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

export function installReadOnlyDynamoGuard() {
  const original = DynamoDBDocument.from
  DynamoDBDocument.from = (...args: Parameters<typeof original>) => {
    const client = original(...args)
    client.middlewareStack.add(
      (next, context) => async input => {
        if (!['GetItemCommand', 'QueryCommand'].includes(context.commandName || '')) {
          throw new Error(`Live tests forbid DynamoDB command: ${context.commandName}`)
        }
        return next(input)
      },
      { name: 'readOnlyLiveTests', step: 'initialize', priority: 'high' }
    )
    return client
  }
  return () => {
    DynamoDBDocument.from = original
  }
}
