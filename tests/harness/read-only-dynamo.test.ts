import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { expect, it, vi } from 'vitest'
import { installReadOnlyDynamoGuard } from '../support/read-only-dynamo'

it('blocks live mutation commands before credentials or network I/O', async () => {
  const restore = installReadOnlyDynamoGuard()
  const credentials = vi.fn().mockRejectedValue(new Error('credentials must not be reached'))
  try {
    const document = DynamoDBDocument.from(new DynamoDBClient({ region: 'ap-east-1', credentials }))
    await expect(document.put({ TableName: 'never-written', Item: { articleId: 'never-written' } })).rejects.toThrow(
      'Live tests forbid DynamoDB command: PutItemCommand'
    )
    await expect(document.delete({ TableName: 'never-written', Key: { articleId: 'never-written' } })).rejects.toThrow(
      'Live tests forbid DynamoDB command: DeleteItemCommand'
    )
    expect(credentials).not.toHaveBeenCalled()
  } finally {
    restore()
  }
})

it('permits the read commands used by the live suite', async () => {
  const restore = installReadOnlyDynamoGuard()
  const requestHandler = { handle: vi.fn().mockRejectedValue(new Error('test transport reached')) }
  try {
    const document = DynamoDBDocument.from(
      new DynamoDBClient({
        region: 'ap-east-1',
        credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
        requestHandler,
        maxAttempts: 1,
      })
    )
    await expect(document.get({ TableName: 'fixture', Key: { articleId: 'one' } })).rejects.toThrow(
      'test transport reached'
    )
    await expect(
      document.query({
        TableName: 'fixture',
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: { ':id': 'one' },
      })
    ).rejects.toThrow('test transport reached')
    expect(requestHandler.handle).toHaveBeenCalledTimes(2)
  } finally {
    restore()
  }
})
