this.mfModules=this.mfModules||{},this.mfModules["mobile.special.mobileoptions.scripts"]=(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{"./src/mobile.special.mobileoptions.scripts.js":function(e,n,t){var o=mw.storage,i=mw.user.clientPrefs,s=new mw.Api,a=t("./src/mobile.startup/Browser.js").getSingleton(),l=t("./src/mobile.startup/showOnPageReload.js"),r=t("./src/mobile.startup/amcOutreach/amcOutreach.js"),g=mw.msg;function m(e){e?l.showOnPageReload(g("mobile-frontend-settings-save")):mw.notify(g("mobile-frontend-settings-save"))}function c(e,n){var t=$("<div>");return t.append($("<strong>").text(e)),t.append($("<div>").addClass("option-description").text(n)),new OO.ui.LabelWidget({label:t})}mw.loader.using("oojs-ui-widgets").then((function(){var e=$("#mobile-options"),n=$("#enable-beta-toggle"),t=$("#enable-amc-toggle"),l=[];n.length&&l.push({$el:n,onToggle:function(){}}),t.length&&l.push({$el:t,onToggle:function(e){!e&&r.loadCampaign().isCampaignActive()&&r.loadCampaign().makeAllActionsIneligible()}}),function(e,n){e.forEach((function(e){var t,o,i,s=e.$el;o=OO.ui.infuse(s),i=o.$element,(t=new OO.ui.ToggleSwitchWidget({value:o.isSelected()})).$element.insertAfter(i),i.hide(),i.on("change",(function(){i.attr("disabled",!0),t.setValue(o.isSelected())})),t.on("change",(function(o){e.onToggle(o),t.setValue=function(){},i.find("input").prop("checked",o),m(!0),setTimeout((function(){n.trigger("submit")}),250)}))}))}(l,e),!a.isWideScreen()&&mw.config.get("wgMFCollapseSectionsByDefault")&&function(e){var n,t;n=new OO.ui.ToggleSwitchWidget({name:"expandSections",value:"true"===o.get("expandSections")}),t=new OO.ui.FieldLayout(n,{label:c(mw.msg("mobile-frontend-expand-sections-status"),mw.msg("mobile-frontend-expand-sections-description")).$element}),n.on("change",(function(e){o.set("expandSections",e?"true":"false"),m()})),t.$element.prependTo(e)}(e),mw.config.get("wgMFEnableFontChanger")&&function(e){var n,t,o=mw.user.isAnon()?i.get("mf-font-size"):mw.user.options.get("mf-font-size");t=new OO.ui.DropdownInputWidget({value:o||"regular",options:[{data:"small",label:g("mobile-frontend-fontchanger-option-small")},{data:"regular",label:g("mobile-frontend-fontchanger-option-medium")},{data:"large",label:g("mobile-frontend-fontchanger-option-large")},{data:"xlarge",label:g("mobile-frontend-fontchanger-option-xlarge")}]}),n=new OO.ui.FieldLayout(t,{label:c(mw.msg("mobile-frontend-fontchanger-link"),mw.msg("mobile-frontend-fontchanger-desc")).$element}),t.on("change",(function(e){mw.user.isAnon()?i.set("mf-font-size",e):s.saveOption("mf-font-size",e),m()})),n.$element.prependTo(e)}(e)}))}},[["./src/mobile.special.mobileoptions.scripts.js",0,1]]]);
//# sourceMappingURL=mobile.special.mobileoptions.scripts.js.map.json