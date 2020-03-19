let appControllerCache = function () {
    this.appControllerArr = [];
}
appControllerCache.prototype = {
    create: function (targetObj) {
        let that = this;
        let app = new appController(targetObj);
        that.appControllerArr.push(app);
    }
}