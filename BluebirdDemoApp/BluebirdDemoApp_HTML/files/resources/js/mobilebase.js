String.prototype.trim = String.prototype.trim || function () {
    if (!this) return this;
    return this.replace(/^\s+|\s+$/g, "");
};

function showSpinner(directOptions) {
    var loaderOptions;
    if (directOptions != undefined && $.type(directOptions) === "object") {
        loaderOptions = directOptions;
    } else {
        if (Appery.loaderOptions != undefined && $.type(Appery.loaderOptions) === "object") {
            loaderOptions = Appery.loaderOptions;
        }
    }
    if (loaderOptions != undefined) {
        $.mobile.loading('show', loaderOptions);
    } else {
        $.mobile.loading('show');
    }
}

function hideSpinner() {
    $.mobile.loading('hide');
}

function correctActivePage() {
    var aPage = $("." + $.mobile.activePageClass);
    correctPage(aPage);
}

function correctPage(page) {
    function _wide() {
        if ((header.length > 0 ) && (headerPadTop < 20)) {
            if(parseFloat(device.version) >= 7.) {
                header.css("padding-top", "20px");
                page.css("padding-top", pagePadTop + 20);
                $.each(childHeader, function() {
                    if($(this).css("position") === "absolute") {
                        var top = parseInt($(this).css("top"));
                            $(this).css("top", top + 20);
                    }
                });
            }
            page.css("min-height", parseInt(page.css("min-height")) - 20);
        }
    }

    function _narrow() {
        if ((header.length > 0 ) && (headerPadTop > 0)) {
            if(parseFloat(device.version) >= 7.) {
                header.css("padding-top", "0px");
                page.css("padding-top", pagePadTop - 20);
                $.each(childHeader, function() {
                    if($(this).css("position") === "absolute") {
                        var top = parseInt($(this).css("top"));
                        if(top > 20)
                            $(this).css("top", top - 20);
                    }
                });
            }
            page.css("min-height", parseInt(page.css("min-height")) + 20);
        }
    }

    page = $(page);
    // Resize header only for iOS7
    if((typeof StatusBar == "undefined") || ((typeof device != "undefined") && (device.platform !== "iOS")) || page.is("[data-corners='true']")) {
        resetContentHeight(page);
        return;
    }
    var header = page.find("[data-role='header']");
    var headerHeight = header.outerHeight() || 0;
    var headerPadTop = parseInt(header.css("padding-top"));
    var pagePadTop = parseInt(page.css("padding-top"));
    var childHeader = header.children();
    if(StatusBar.isVisible) {
        _wide();
    } else {
        _narrow();
    }
    resetContentHeight(page);
}

function resetContentHeight(page) {
    // It's OK with dialogue, we don't need extra sizing
    if (page.is("[data-role='dialog']")) return;

    var header, footer, content;
    content = page.find(".ui-content:visible:eq(0)");

    if (page.hasClass("detail-content")) {
        // If it's a detail content page, we must consider height of master page header and footer
        header = page.closest(".ui-page:not(.detail-content)").find(".ui-header:visible:eq(0)");
        footer = page.closest(".ui-page:not(.detail-content)").find(".ui-footer:visible:eq(0)");
    } else {
        header = page.find(".ui-header:visible").not(page.find("[data-role='popup'] .ui-header"));
        footer = page.find(".ui-footer:visible").not(page.find("[data-role='popup'] .ui-footer"));
    };

    var hh = header.outerHeight() || 0,
        fh = footer.outerHeight() || 0,
        topPad = parseFloat(content.css("padding-top")),
        bottomPad = parseFloat(content.css("padding-bottom"));
    var height = window.innerHeight - hh - fh - topPad - bottomPad;
    content.css("min-height", height);

    if (page.hasClass("detail-content")) {
        page.css("min-height", height);
    } else {
        if ($(window).width() >= 650) {
            $('.scroller').height(height);
        }
    };
}

function resetActivePageContentHeight() {
    var aPage = $("." + $.mobile.activePageClass);
    resetContentHeight(aPage);
}

function notifyActivePageAboutEvent(event){
	if(event != undefined && event != "" && event.type != undefined && event.type != ""){
		$('[data-role="page"].ui-page-active').triggerHandler(event.type);
	}
}

$.mobile.document.bind("pageshow", resetActivePageContentHeight);
$.mobile.window.bind("throttledresize", resetActivePageContentHeight);
$.mobile.window.bind("hashchange", notifyActivePageAboutEvent);

// Replacing native jQuery show/hide logic to handle mobileinput
(function () {
    var nativeHide = jQuery.fn.hide;
    jQuery.fn.hide = function () {
        if (this.prop('tagName') == 'INPUT' && this.parent(".ui-input-text").length > 0) {
            return nativeHide.apply(this.parent(".ui-input-text").parent(), arguments);
        } else if (this.prop('tagName') == 'A' && this.attr('data-role') == "button") {
            this.css("display", "none");
        } else if (this.prop('tagName') == 'DIV' && this.attr('data-role') == "navbar") {
			if (this.css("display") == "none") {
				return this;
			}
			var nbp = this.parent()
			if (nbp.prop('tagName') == 'DIV' && nbp.attr('data-role') == "header") {
				nbp = nbp.parent();
				var nbh = this.height();
				if (nbp.attr('data-role') == "page") {
					var nbpt = parseInt(nbp.css("padding-top")) - nbh;;
					nbp.css("padding-top", nbpt + "px");
				}
			}
			return nativeHide.apply(this, arguments);
        } else {
            return nativeHide.apply(this, arguments);
        }
    };

    var nativeShow = jQuery.fn.show;
    jQuery.fn.show = function () {
        if (this.prop('tagName') == 'INPUT' && this.parent(".ui-input-text").length > 0) {
            return nativeShow.apply(this.parent(".ui-input-text").parent(), arguments);
        } else if (this.prop('tagName') == 'A' && this.attr('data-role') == "button") {
            if (this.hasClass("ui-btn-left") || this.hasClass("ui-btn-right") || this.hasClass("ui-btn-inline")) {
                this.css("display", "inline-block");
            } else {
                this.css("display", "block");
            }

        } else if (this.prop('tagName') == 'DIV' && this.attr('data-role') == "navbar") {
			if (this.css("display") != "none") {
				return this;
			}
			var result = nativeShow.apply(this, arguments);
			var nbp = this.parent()
			if (nbp.prop('tagName') == 'DIV' && nbp.attr('data-role') == "header") {
				nbp = nbp.parent();
				var nbh = this.height();
				if (nbp.attr('data-role') == "page") {
					var nbpt = parseInt(nbp.css("padding-top")) + nbh;;
					nbp.css("padding-top", nbpt + "px");
				}
			}
			return result;
        } else {
            return nativeShow.apply(this, arguments);
        }
    };
})();
