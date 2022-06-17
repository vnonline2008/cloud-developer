import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

//Implement the fileStogare logic

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const signedUrlExpiration = process.env.SIGNED_URL_EXPIRATION
const s3Bucket = new XAWS.S3({
    signatureVersion: 'v4'
})

export function getSignedURL(todoId: string) {
    const params = {
        Bucket: bucketName,
        Key: todoId,
        Expires: Number(signedUrlExpiration)
    }
    return s3Bucket.getSignedUrl('putObject', params)
}
