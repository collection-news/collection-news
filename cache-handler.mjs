import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { fromIni } from '@aws-sdk/credential-provider-ini'
import { CacheHandler } from '@neshca/cache-handler'
import { compress, uncompress } from 'snappy'

CacheHandler.onCreation(async ({ buildId }) => {
  const s3Client = new S3Client({
    region: process.env.APP_ISR_CACHE_REGION,
    credentials: process.env.DEV_AWS_PROFILE
      ? fromIni({ profile: process.env.DEV_AWS_PROFILE })
      : {
          accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY || '',
          sessionToken: process.env.APP_AWS_SESSION_TOKEN,
        },
  })

  const uploadToS3 = async (path, value) => {
    const payloadBuffer = await compress(JSON.stringify(value))
    const s3UploadParams = {
      Bucket: process.env.APP_ISR_CACHE_BUCKET_NAME,
      Key: path,
      Body: payloadBuffer,
    }
    const putObjectCommand = new PutObjectCommand(s3UploadParams)
    await s3Client.send(putObjectCommand)
  }

  const deleteFromS3 = async path => {
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: process.env.APP_ISR_CACHE_BUCKET_NAME,
      Key: path,
    })
    await s3Client.send(deleteObjectCommand)
  }

  const fetchFromS3 = async path => {
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.APP_ISR_CACHE_BUCKET_NAME,
      Key: path,
    })
    const response = await s3Client.send(getObjectCommand)
    const buffer = Buffer.from(await response.Body.transformToByteArray())
    const jsonString = await uncompress(buffer, { asBuffer: false })
    return JSON.parse(jsonString)
  }

  const handler = {
    async get(key) {
      const _key = keyGenerator(buildId, key)
      return await fetchFromS3(_key)
    },
    async set(key, value) {
      const _key = keyGenerator(buildId, key)
      await uploadToS3(_key, value)
    },
    async revalidateTag(tag) {
      // TODO: we don't support revalidation at the moment
    },
    // Optional: Implement the delete method
    // if your cache store doesn't support automatic time-based key expiration.
    // It will be called when the get method returns expired data.
    async delete(key) {
      const _key = keyGenerator(buildId, key)
      await deleteFromS3(_key)
    },
  }

  return {
    handlers: [handler],
  }
})

function keyGenerator(buildId, key) {
  return `${buildId}${key}`
}

export default CacheHandler
