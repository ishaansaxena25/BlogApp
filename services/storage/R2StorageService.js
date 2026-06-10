const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const StorageService = require("./StorageService");

class R2StorageService extends StorageService {
  constructor({
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicUrl,
  }) {
    super();
    this.bucket = bucket;
    this.publicUrl = publicUrl.replace(/\/+$/, "");
    this.client = new S3Client({
      region: "auto",
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async upload(buffer, key, mimetype) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      })
    );
    return this.getUrl(key);
  }

  async delete(key) {
    if (!key) return;
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }

  getUrl(key) {
    return `${this.publicUrl}/${key}`;
  }

  getKey(url) {
    return url.startsWith(`${this.publicUrl}/`)
      ? url.slice(this.publicUrl.length + 1)
      : url;
  }
}

module.exports = R2StorageService;
