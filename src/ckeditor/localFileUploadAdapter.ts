import imageCrawler from "./imageCrawler";

export default class LocalFileUploadAdapter {
    loader: any;
    config: any;

    constructor(loader, config) {
        this.loader = loader;
        this.config = config;
    }

    /**
     *  上传成功时，返回：
     *
     *         { "uploaded":1, "url":"图片访问路径"}
     *
     *     上传失败时，返回
     *           {"uploaded":0,"error":{"message":"失败原因"  }}
     */
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