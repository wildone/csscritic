describe("Browser renderer", function () {
    var the_image;

    beforeEach(function () {
        the_image = "the_image";
    });

    it("should draw the url to the given canvas, disable caching and execute JavaScript", function () {
        var image = null,
            drawUrlSpy = spyOn(rasterizeHTML, "drawURL").andCallFake(function (url, options, callback) {
                callback(the_image, []);
            });

        csscritic.renderer.browserRenderer("the_url", 42, 7, null, function (result_image) {
            image = result_image;
        });

        expect(the_image).toBe(image);
        expect(drawUrlSpy).toHaveBeenCalledWith("the_url", {cache: false, width: 42, height: 7, executeJs: true, executeJsTimeout: 50}, jasmine.any(Function));
    });

    it("should call the error handler if a page does not exist", function () {
        var successCallback = jasmine.createSpy("success"),
            errorCallback = jasmine.createSpy("error");
        spyOn(rasterizeHTML, "drawURL").andCallFake(function (url, options, callback) {
            callback(null, [{
                resourceType: "page",
                url: url
            }]);
        });

        csscritic.renderer.browserRenderer("the_url", 42, 7, null, successCallback, errorCallback);

        expect(successCallback).not.toHaveBeenCalled();
        expect(errorCallback).toHaveBeenCalled();
    });

    it("should call the error handler if a page could not be rendered", function () {
        var successCallback = jasmine.createSpy("success"),
            errorCallback = jasmine.createSpy("error");
        spyOn(rasterizeHTML, "drawURL").andCallFake(function (url, options, callback) {
            callback(null, [{
                resourceType: "document"
            }]);
        });

        csscritic.renderer.browserRenderer("the_url", 42, 7, null, successCallback, errorCallback);

        expect(successCallback).not.toHaveBeenCalled();
        expect(errorCallback).toHaveBeenCalled();
    });

    it("should work without a callback on error", function () {
        spyOn(rasterizeHTML, "drawURL").andCallFake(function (url, options, callback) {
            callback(null, [{
                resourceType: "page",
                url: url
            }]);
        });
        csscritic.renderer.browserRenderer("the_url", 42, 7);
    });

    // This test makes phantomjs crash, due to http://code.google.com/p/phantomjs/issues/detail?id=947
    ifNotInWebkitIt("should report erroneous resource urls", function () {
        var erroneousResourceUrls = null,
            fixtureUrl = csscriticTestPath + "fixtures/",
            pageUrl = fixtureUrl + "brokenPage.html";

        csscritic.renderer.browserRenderer(pageUrl, 42, 7, null, function (result_image, erroneousUrls) {
            erroneousResourceUrls = erroneousUrls;
        });

        waitsFor(function () {
            return erroneousResourceUrls !== null;
        });

        runs(function () {
            expect(erroneousResourceUrls).not.toBeNull();
            erroneousResourceUrls.sort();
            expect(erroneousResourceUrls).toEqual([
                fixtureUrl + "background_image_does_not_exist.jpg",
                fixtureUrl + "css_does_not_exist.css",
                fixtureUrl + "image_does_not_exist.png"
            ]);
        });
    });

});
