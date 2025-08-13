// /**
//  * safeKey - returns sanitized key, optionally prefixing with folder and date
//  */
// export const safeKey = (prefix = '', filename = '') => {
//   const name = filename || `${Date.now()}`
//   const sanitized = name.replace(/[^a-zA-Z0-9-_.\/]/g, '_')
//   const folder = prefix ? prefix.replace(/(^\/|\/$)/g, '') : ''
//   const key = folder ? `${folder}/${sanitized}` : sanitized
//   return key
// }

import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

const s3 = new AWS.S3()
const BUCKET_NAME = process.env.AWS_BUCKET_NAME

const uploadFile = async (file) => {
  const fileExtension = file.originalname.split('.').pop()
  const fileKey = `uploads/${uuidv4()}.${fileExtension}`

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  }

  const result = await s3.upload(params).promise()
  return { fileKey, url: result.Location }
}

const deleteFile = async (fileKey) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
  }

  await s3.deleteObject(params).promise()
  return true
}

const listFiles = async () => {
  const params = {
    Bucket: BUCKET_NAME,
  }

  const data = await s3.listObjectsV2(params).promise()
  const files = data.Contents.map((item) => ({
    key: item.Key,
    url: `https://${BUCKET_NAME}.s3.${AWS.config.region}.amazonaws.com/${item.Key}`,
  }))
  return files
}