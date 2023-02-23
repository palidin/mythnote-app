import imageCrawler from "./imageCrawler";

export default class LocalFileUploadAdapter {
  loader: any;
  config: any;

  constructor(loader, config) {
    this.loader = loader;
    this.config = config;
  }

  upload() {
    return new Promise((resolve, reject) => {
      this.uploadFile(reject)
        .then(res => {
          resolve({
            default: res,
          });
        })
        .catch(e => {
          reject(e);
        })
    });
  }

  abort() {

  }

  uploadFile(reject) {
    return this.loader.file
      .then(async file => {
        return imageCrawler.upload(file)
      })
      .catch(reject);
  }

}
