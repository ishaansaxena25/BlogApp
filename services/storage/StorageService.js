class StorageService {
  async upload(buffer, key, mimetype) {
    throw new Error("StorageService.upload must be implemented");
  }

  async delete(key) {
    throw new Error("StorageService.delete must be implemented");
  }

  getUrl(key) {
    throw new Error("StorageService.getUrl must be implemented");
  }

  getKey(url) {
    return url;
  }
}

module.exports = StorageService;
